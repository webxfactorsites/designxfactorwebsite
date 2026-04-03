import { useCourseAudit } from '../../context/CourseAuditContext';

export function AuditSubmitted() {
  const { state, reset } = useCourseAudit();
  const { contact } = state;

  return (
    <div className="min-h-screen bg-[#0b0e1a] text-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg text-center">

        {/* Success icon */}
        <div className="w-16 h-16 rounded-full bg-[#00d4ff]/15 border border-[#00d4ff]/30 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>

        <h2 className="text-2xl font-bold mb-3">Your audit is queued</h2>

        <p className="text-slate-300 mb-2">
          Your report will be emailed to:
        </p>
        <p className="text-[#00d4ff] font-semibold text-lg mb-2">{contact.email}</p>
        <p className="text-slate-500 text-sm mb-8">Expect your report within 24 hours.</p>

        {/* What happens next */}
        <div className="bg-[#111827] border border-white/8 rounded-xl p-6 text-left space-y-4 mb-8">
          <p className="text-sm font-semibold text-white mb-2">What happens next</p>
          {[
            { n: 1, text: 'Your course file is added to the queue — we process audits in order.' },
            { n: 2, text: 'Our AI engine extracts your course structure, objectives, assessments, and content.' },
            { n: 3, text: 'IDDFX runs a full quality analysis: Bloom\'s taxonomy, alignment, accessibility, cognitive load.' },
            { n: 4, text: 'Your detailed report — with scores, findings, and actionable recommendations — is emailed within 24 hours.' },
          ].map(s => (
            <div key={s.n} className="flex gap-3 text-sm text-slate-400">
              <span className="w-5 h-5 rounded-full bg-[#1e293b] text-[#00d4ff] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {s.n}
              </span>
              <span>{s.text}</span>
            </div>
          ))}
        </div>

        {/* Privacy reminder */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 text-xs text-slate-500 leading-relaxed mb-8">
          <strong className="text-slate-400 block mb-1">Privacy reminder</strong>
          Your uploaded course file is used solely to generate this report and will be
          permanently deleted within 24 hours of delivery. We do not retain, store,
          train on, or share your content in any way.
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://designxfactor.com"
            className="px-6 py-3 rounded-lg border border-white/15 text-slate-300 hover:text-white transition-colors text-sm"
          >
            ← Back to Design X Factor
          </a>
          <button
            onClick={reset}
            className="px-6 py-3 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-colors text-sm"
          >
            Audit another course
          </button>
        </div>
      </div>
    </div>
  );
}
