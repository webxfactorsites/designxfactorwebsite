import { useState } from 'react';
import { useCourseAudit } from '../../context/CourseAuditContext';
import type { AuditCourseType } from '../../types/audit';

const COURSE_TYPES: { value: AuditCourseType; label: string }[] = [
  { value: 'higher-education', label: 'Higher Education' },
  { value: 'corporate-training', label: 'Corporate Training' },
  { value: 'healthcare', label: 'Healthcare / Clinical' },
  { value: 'government', label: 'Government / Compliance' },
  { value: 'k12', label: 'K–12 Education' },
];

export function AuditContact() {
  const { state, setContact, setStep } = useCourseAudit();
  const { contact } = state;
  const [errors, setErrors] = useState<Partial<Record<keyof typeof contact, string>>>({});

  function validate() {
    const e: typeof errors = {};
    if (!contact.name.trim()) e.name = 'Required';
    if (!contact.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) e.email = 'Invalid email';
    return e;
  }

  function handleNext() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep('upload');
  }

  return (
    <div className="min-h-screen bg-[#0b0e1a] text-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <StepIndicator current={1} />

        <h2 className="text-2xl font-bold mb-1 mt-6">Tell us about yourself</h2>
        <p className="text-slate-400 text-sm mb-8">
          Where should we send your report?{' '}
          <span className="text-slate-500">
            We ask for your email to deliver the report and to prevent abuse — each address gets up to 3 free audits. We will never spam you.
          </span>
        </p>

        <div className="space-y-4">
          <Field label="Full Name *" error={errors.name}>
            <input
              type="text" value={contact.name} autoFocus
              onChange={e => { setContact({ name: e.target.value }); setErrors(p => ({ ...p, name: undefined })); }}
              className={input(errors.name)}
              placeholder="Jane Smith"
            />
          </Field>

          <Field label="Work Email *" error={errors.email}>
            <input
              type="email" value={contact.email}
              onChange={e => { setContact({ email: e.target.value }); setErrors(p => ({ ...p, email: undefined })); }}
              className={input(errors.email)}
              placeholder="jane@company.com"
            />
          </Field>

          <Field label="Organization">
            <input
              type="text" value={contact.company}
              onChange={e => setContact({ company: e.target.value })}
              className={input()}
              placeholder="Acme University"
            />
          </Field>

          <Field label="Your Role">
            <input
              type="text" value={contact.role}
              onChange={e => setContact({ role: e.target.value })}
              className={input()}
              placeholder="Instructional Designer, L&D Manager…"
            />
          </Field>

          <Field label="Course Type">
            <select
              value={contact.courseType}
              onChange={e => setContact({ courseType: e.target.value as AuditCourseType })}
              className={input() + ' appearance-none'}
            >
              <option value="">Select course type…</option>
              {COURSE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={() => setStep('landing')} className="px-5 py-3 rounded-lg border border-white/15 text-slate-400 hover:text-white transition-colors text-sm">
            Back
          </button>
          <button onClick={handleNext} className="flex-1 bg-[#00d4ff] hover:bg-[#00b4d8] text-[#0b0e1a] font-bold py-3 rounded-lg transition-colors">
            Continue →
          </button>
        </div>

        <PrivacyNote />
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

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function input(error?: string) {
  return `w-full bg-[#111827] border ${error ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4ff] transition-colors text-sm`;
}

function PrivacyNote() {
  return (
    <p className="mt-6 text-xs text-slate-600 text-center leading-relaxed">
      Your information is only used to deliver your report.
      All files are permanently deleted within 24 hours of delivery.
      We do not sell, share, or retain your data.
    </p>
  );
}
