import { useRef, useState } from 'react';
import { useCourseAudit } from '../../context/CourseAuditContext';

const MAX_MB = 100;
const ACCEPTED = '.zip,.pdf';

// Friendly error shown when rate limit is hit (429)
function RateLimitError() {
  return (
    <div className="mt-4 bg-amber-900/20 border border-amber-500/30 rounded-lg px-4 py-4 text-sm">
      <p className="text-amber-300 font-semibold mb-1">Free audit limit reached</p>
      <p className="text-amber-200/70 leading-relaxed">
        You've used all 3 free audits for this email address. If you'd like additional
        audits or are interested in a full remediation engagement,{' '}
        <a href="/#contact" className="text-amber-300 underline underline-offset-2 hover:text-white transition-colors">
          get in touch
        </a>{' '}
        — we'd love to talk.
      </p>
    </div>
  );
}

export function AuditUpload() {
  const { state, setUpload, setStep, setJobId, setSubmitting, setError } = useCourseAudit();
  const { contact, upload, submitting, error } = state;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);

  function validateFile(f: File): string | null {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!['zip', 'pdf'].includes(ext ?? '')) return 'Only .zip and .pdf files are accepted';
    if (f.size > MAX_MB * 1024 * 1024) return `File too large — max ${MAX_MB} MB`;
    return null;
  }

  function handleFile(f: File) {
    const err = validateFile(f);
    if (err) { setFileError(err); return; }
    setFileError(null);
    setUpload({ file: f, fileName: f.name });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleSubmit() {
    if (!upload.file) { setFileError('Please select a file'); return; }
    setError(null);
    setRateLimited(false);
    setSubmitting(true);

    try {
      const form = new FormData();
      form.append('name',       contact.name);
      form.append('email',      contact.email);
      form.append('company',    contact.company);
      form.append('role',       contact.role);
      form.append('courseType', contact.courseType);
      form.append('file',       upload.file, upload.file.name);

      const res = await fetch('/api/audit/submit', { method: 'POST', body: form });
      const data = await res.json() as { success?: boolean; jobId?: string; error?: string };

      if (res.status === 429) { setRateLimited(true); return; }
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Submission failed');

      setJobId(data.jobId!);
      setStep('submitted');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0e1a] text-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <StepIndicator current={2} />

        <h2 className="text-2xl font-bold mb-1 mt-6">Upload your course</h2>
        <p className="text-slate-400 text-sm mb-8">
          SCORM package (.zip), IMS Common Cartridge (.zip), or PDF — up to {MAX_MB} MB.
        </p>

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
            ${dragOver ? 'border-[#00d4ff] bg-[#00d4ff]/5' : upload.file ? 'border-[#00d4ff]/50 bg-[#00d4ff]/5' : 'border-white/15 hover:border-white/30'}`}
        >
          <input ref={inputRef} type="file" accept={ACCEPTED} className="sr-only"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          {upload.file ? (
            <div>
              <div className="text-4xl mb-3">📦</div>
              <div className="font-semibold text-white text-sm">{upload.file.name}</div>
              <div className="text-slate-500 text-xs mt-1">{(upload.file.size / 1024 / 1024).toFixed(2)} MB</div>
              <button
                onClick={e => { e.stopPropagation(); setUpload({ file: null, fileName: '' }); setFileError(null); }}
                className="mt-3 text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-3">📤</div>
              <div className="text-slate-300 text-sm mb-1">Drop your file here or click to browse</div>
              <div className="text-slate-600 text-xs">.zip (SCORM / Common Cartridge) or .pdf</div>
            </div>
          )}
        </div>

        {fileError && <p className="text-red-400 text-xs mt-2">{fileError}</p>}
        {rateLimited && <RateLimitError />}
        {error && !rateLimited && (
          <div className="mt-4 bg-red-900/30 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Format guide */}
        <div className="mt-5 grid grid-cols-3 gap-3 text-xs text-slate-500">
          {[
            { icon: '📦', label: 'SCORM', desc: 'SCORM 1.2 or 2004 package' },
            { icon: '🗂️', label: 'Common Cartridge', desc: 'IMS CC v1.1–v1.3' },
            { icon: '📄', label: 'PDF', desc: 'Course syllabus or materials' },
          ].map(f => (
            <div key={f.label} className="bg-[#111827] rounded-lg p-3 text-center">
              <div className="text-lg mb-1">{f.icon}</div>
              <div className="text-slate-400 font-medium">{f.label}</div>
              <div className="text-slate-600 mt-0.5">{f.desc}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={() => setStep('contact')} disabled={submitting}
            className="px-5 py-3 rounded-lg border border-white/15 text-slate-400 hover:text-white transition-colors text-sm disabled:opacity-40">
            Back
          </button>
          <button onClick={handleSubmit} disabled={!upload.file || submitting}
            className="flex-1 bg-[#00d4ff] hover:bg-[#00b4d8] disabled:bg-[#00d4ff]/30 disabled:cursor-not-allowed text-[#0b0e1a] font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
            {submitting ? (
              <><Spinner />Uploading…</>
            ) : (
              <>Get My Free Audit</>
            )}
          </button>
        </div>

        <p className="mt-6 text-xs text-slate-600 text-center leading-relaxed">
          Your file is encrypted in transit and permanently deleted within 24 hours of report delivery.
          We do not retain, train on, or share your content.
        </p>
      </div>
    </div>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      {['Contact', 'Upload', 'Done'].map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
            ${i < current ? 'bg-[#00d4ff] text-[#0b0e1a]' : i === current ? 'border-2 border-[#00d4ff] text-[#00d4ff]' : 'border border-white/20 text-slate-600'}`}>
            {i < current ? '✓' : i + 1}
          </span>
          <span className={i === current ? 'text-white' : ''}>{label}</span>
          {i < 2 && <span className="text-slate-700 mx-1">─</span>}
        </div>
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  );
}
