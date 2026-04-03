/**
 * GET /api/audit/status/:jobId
 * Returns the current status of a course audit job.
 */

interface Env {
  DB: D1Database;
}

interface AuditJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  report_url: string | null;
  error: string | null;
  created_at: number;
  completed_at: number | null;
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { status: 204, headers: corsHeaders() });

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const headers = { 'Content-Type': 'application/json', ...corsHeaders() };
  const jobId = context.params.jobId as string;

  if (!jobId || jobId.length < 10) {
    return new Response(JSON.stringify({ error: 'Invalid job ID' }), { status: 400, headers });
  }

  try {
    const row = await context.env.DB.prepare(
      'SELECT id, status, report_url, error, created_at, completed_at FROM audit_jobs WHERE id = ?'
    ).bind(jobId).first<AuditJob>();

    if (!row) {
      return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404, headers });
    }

    return new Response(JSON.stringify({
      jobId: row.id,
      status: row.status,
      reportUrl: row.report_url ?? null,
      createdAt: row.created_at,
      completedAt: row.completed_at ?? null,
    }), { status: 200, headers });

  } catch (err) {
    console.error('audit/status error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers });
  }
};
