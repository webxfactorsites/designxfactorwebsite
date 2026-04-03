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
  COURSE_UPLOADS: R2Bucket;
  RESEND_API_KEY: string;
  NOTIFICATION_EMAIL: string;
  RESEND_FROM_EMAIL: string;
  WEBSITE_URL: string;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const FREE_AUDIT_LIMIT = 3; // max audits per email (non-failed jobs)
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

    // ── Upload to R2 ──
    const fileBuffer = await file.arrayBuffer();
    await context.env.COURSE_UPLOADS.put(r2Key, fileBuffer, {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream',
        contentDisposition: `attachment; filename="${safeFile}"`,
      },
      customMetadata: {
        jobId,
        uploadedBy: email,
        originalName: file.name,
      },
    });

    // ── Insert job into D1 ──
    await context.env.DB.prepare(`
      INSERT INTO audit_jobs (id, name, email, company, role, course_type, file_name, file_r2_key, file_size, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).bind(jobId, name, email, company, role, courseType, file.name, r2Key, file.size).run();

    // ── Notify internally ──
    await notifyInternal(context.env, {
      jobId, name, email, company, role, courseType,
      fileName: file.name, fileSize: file.size,
      auditNumber: usedCount + 1,
    });

    return new Response(JSON.stringify({
      success: true,
      jobId,
      auditsUsed: usedCount + 1,
      auditsRemaining: FREE_AUDIT_LIMIT - (usedCount + 1),
    }), { status: 200, headers });

  } catch (err) {
    console.error('audit/submit error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers });
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
