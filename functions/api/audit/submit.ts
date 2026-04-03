/**
 * POST /api/audit/submit
 * Accepts a course file upload (SCORM .zip, IMSCC .zip, PDF) + contact info.
 * Stores the file in R2, creates a pending job in D1, returns the jobId.
 *
 * Rate limit: 3 audits per email address (failed jobs don't count).
 * Privacy: uploaded files are permanently deleted within 24 hours of report delivery.
 */

interface Env {
  DB: D1Database;
  CF_API_TOKEN: string;
  CF_ACCOUNT_ID: string;
  CF_R2_BUCKET_NAME: string;
  RESEND_API_KEY: string;
  NOTIFICATION_EMAIL: string;
  RESEND_FROM_EMAIL: string;
  WEBSITE_URL: string;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const FREE_AUDIT_LIMIT = 2; // max audits per email (non-failed jobs)
const ALLOWED_EXTENSIONS = ['.zip', '.pdf'];

function nanoid(size = 21): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  for (const b of bytes) id += chars[b % chars.length];
  return id;
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { status: 204, headers: corsHeaders() });

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const headers = { 'Content-Type': 'application/json', ...corsHeaders() };

  try {
    const contentType = context.request.headers.get('Content-Type') ?? '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ error: 'Must be multipart/form-data' }), { status: 400, headers });
    }

    const formData = await context.request.formData();

    // ── Contact fields ──
    const name       = (formData.get('name') as string | null)?.trim();
    const email      = (formData.get('email') as string | null)?.trim().toLowerCase();
    const company    = (formData.get('company') as string | null)?.trim() ?? null;
    const role       = (formData.get('role') as string | null)?.trim() ?? null;
    const courseType = (formData.get('courseType') as string | null)?.trim() ?? null;

    if (!name || !email) {
      return new Response(JSON.stringify({ error: 'name and email are required' }), { status: 400, headers });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), { status: 400, headers });
    }

    // ── Rate limit: max FREE_AUDIT_LIMIT non-failed jobs per email ──
    const countResult = await context.env.DB.prepare(
      `SELECT COUNT(*) as count FROM audit_jobs WHERE email = ? AND status != 'failed'`
    ).bind(email).first<{ count: number }>();

    const usedCount = countResult?.count ?? 0;

    if (usedCount >= FREE_AUDIT_LIMIT) {
      return new Response(JSON.stringify({
        error: 'rate_limit',
        used: usedCount,
        limit: FREE_AUDIT_LIMIT,
        message: `You've used all ${FREE_AUDIT_LIMIT} free audits for this email address. Reach out to us at designxfactor.com/#contact to discuss additional audits or a full remediation engagement.`,
      }), { status: 429, headers });
    }

    // ── File validation ──
    const file = formData.get('file') as File | null;
    if (!file || file.size === 0) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400, headers });
    }
    if (file.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ error: 'File too large (max 100 MB)' }), { status: 400, headers });
    }

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return new Response(JSON.stringify({ error: 'Only .zip and .pdf files are accepted' }), { status: 400, headers });
    }

    // ── Generate job ID and R2 key ──
    const jobId    = nanoid();
    const safeFile = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const r2Key    = `uploads/${jobId}/${safeFile}`;

    // ── Upload to R2 via REST API ──
    const fileBuffer = await file.arrayBuffer();
    const r2Base = `https://api.cloudflare.com/client/v4/accounts/${context.env.CF_ACCOUNT_ID}/r2/buckets/${context.env.CF_R2_BUCKET_NAME}`;
    const r2Res = await fetch(`${r2Base}/objects/${encodeURIComponent(r2Key)}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${context.env.CF_API_TOKEN}`,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: fileBuffer,
    });
    if (!r2Res.ok) {
      const r2Err = await r2Res.text();
      throw new Error(`R2 upload failed (${r2Res.status}): ${r2Err}`);
    }

    // ── Insert job into D1 ──
    await context.env.DB.prepare(`
      INSERT INTO audit_jobs (id, name, email, company, role, course_type, file_name, file_r2_key, file_size, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).bind(jobId, name, email, company, role, courseType, file.name, r2Key, file.size).run();

    // ── Notify internally + confirm to user (fire-and-forget) ──
    await Promise.all([
      notifyInternal(context.env, {
        jobId, name, email, company, role, courseType,
        fileName: file.name, fileSize: file.size,
        auditNumber: usedCount + 1,
      }),
      confirmToUser(context.env, { name, email, fileName: file.name }),
    ]);

    return new Response(JSON.stringify({
      success: true,
      jobId,
      auditsUsed: usedCount + 1,
      auditsRemaining: FREE_AUDIT_LIMIT - (usedCount + 1),
    }), { status: 200, headers });

  } catch (err) {
    console.error('audit/submit error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    console.error('audit/submit error:', msg);
    return new Response(JSON.stringify({ error: 'Internal server error', detail: msg }), { status: 500, headers });
  }
};

async function notifyInternal(env: Env, data: {
  jobId: string; name: string; email: string; company: string | null;
  role: string | null; courseType: string | null; fileName: string; fileSize: number;
  auditNumber: number;
}) {
  const sizeMb = (data.fileSize / 1024 / 1024).toFixed(2);
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: [env.NOTIFICATION_EMAIL],
        subject: `🎓 New Course Audit — ${data.name} (audit ${data.auditNumber}/${FREE_AUDIT_LIMIT})`,
        html: `
          <h2>New IDDFX Course Audit Request</h2>
          <ul>
            <li><strong>Name:</strong> ${data.name}</li>
            <li><strong>Email:</strong> ${data.email}</li>
            <li><strong>Company:</strong> ${data.company ?? '—'}</li>
            <li><strong>Role:</strong> ${data.role ?? '—'}</li>
            <li><strong>Course Type:</strong> ${data.courseType ?? '—'}</li>
            <li><strong>File:</strong> ${data.fileName} (${sizeMb} MB)</li>
            <li><strong>Job ID:</strong> <code>${data.jobId}</code></li>
            <li><strong>Audit #:</strong> ${data.auditNumber} of ${FREE_AUDIT_LIMIT} free</li>
          </ul>
          <p>The daemon will pick this up within the next poll cycle (max 2 min).</p>
          <p><strong>Expected delivery:</strong> within 24 hours.</p>
          <hr>
          <p style="font-size:12px;color:#64748b">
            File will be permanently deleted within 24 hours of report delivery.
          </p>
        `,
      }),
    });
  } catch (e) {
    console.error('Failed to send internal notification:', e);
  }
}

async function confirmToUser(env: Env, data: { name: string; email: string; fileName: string }) {
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: [data.email],
        subject: `Your Course Audit Has Been Received — Design × Factor`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
            <div style="background:#0f172a;padding:24px 32px;border-radius:8px 8px 0 0">
              <h1 style="margin:0;font-size:20px;color:#ffffff;font-weight:600">Design × Factor</h1>
              <p style="margin:4px 0 0;font-size:13px;color:#94a3b8">Instructional Design &amp; Development</p>
            </div>
            <div style="background:#f8fafc;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
              <p style="margin:0 0 16px;font-size:16px">Hi ${data.name},</p>
              <p style="margin:0 0 16px">We've received your course audit submission for <strong>${data.fileName}</strong> and it's now in our processing queue.</p>
              <p style="margin:0 0 16px">Here's what happens next:</p>
              <ol style="margin:0 0 24px;padding-left:20px;line-height:1.8">
                <li>Our system will analyze your course content against accessibility, instructional design, and content quality standards.</li>
                <li>You'll receive a second email with a link to your full audit report — typically within <strong>24 hours</strong>.</li>
                <li>The report link will remain active until the file is permanently deleted (within 24 hours of delivery).</li>
              </ol>
              <p style="margin:0 0 24px">If you have any questions in the meantime, feel free to reach out through our <a href="${env.WEBSITE_URL}/#contact" style="color:#6366f1">contact form</a>.</p>
              <p style="margin:0">Thank you for trusting us with your course,<br><strong>The Design × Factor Team</strong></p>
            </div>
            <p style="text-align:center;font-size:11px;color:#94a3b8;margin:16px 0 0">
              &copy; ${new Date().getFullYear()} Design × Factor · <a href="${env.WEBSITE_URL}" style="color:#94a3b8">${env.WEBSITE_URL.replace('https://', '')}</a>
            </p>
          </div>
        `,
      }),
    });
  } catch (e) {
    console.error('Failed to send user confirmation:', e);
  }
}
