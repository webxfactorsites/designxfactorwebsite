import { useCourseAudit } from '../../context/CourseAuditContext';

const WHAT_YOU_GET = [
  { icon: '🎯', title: 'Objectives Review', desc: "Bloom's taxonomy analysis — are your learning objectives measurable and at the right cognitive level?" },
  { icon: '📊', title: 'IDDXF Quality Score', desc: 'A 0–100 score across 6 dimensions: objectives, assessments, content depth, accessibility, engagement, and design consistency.' },
  { icon: '🔍', title: 'Assessment Alignment', desc: "Are your assessments testing what your objectives promise? We'll find the gaps." },
  { icon: '♿', title: 'Accessibility Check', desc: 'WCAG 2.1 AA compliance review — is your course legally accessible?' },
  { icon: '🚩', title: 'Red Flag Report', desc: "Adversarial audit — we assume your course is broken until proven otherwise. No sugar-coating." },
  { icon: '💡', title: 'How to Fix It', desc: 'Concrete, service-specific recommendations for every gap we find.' },
];

export function AuditLanding() {
  const { setStep } = useCourseAudit();

  return (
    <div className="min-h-screen bg-[#0b0e1a] text-white">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-full px-4 py-1.5 text-sm text-[#00d4ff] mb-6">
          <span className="w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse" />
          Free · No account required · Report delivered within 24 hours
        </div>

        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
          Get a Free{' '}
          <span className="text-[#00d4ff]">Course Audit</span>
        </h1>

        <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-4">
          Upload your SCORM package, Common Cartridge, or PDF. We run a full
          evidence-based instructional design analysis and email you a detailed report —
          no login, no credit card.
        </p>

        <p className="text-sm text-slate-400 max-w-xl mx-auto mb-6 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
          <strong className="text-white">What is the IDDXF score?</strong>{' '}
          IDDXF (Instructional Design Design × Factor) is our proprietary scoring framework — a 0–100 rating that benchmarks your course across objectives, assessments, content depth, accessibility, engagement patterns, and design consistency.
        </p>

        <p className="text-sm text-slate-500 mb-8">
          Up to 2 free audits per email address.{' '}
          <a href="/#contact" className="text-slate-400 hover:text-[#00d4ff] underline underline-offset-2 transition-colors">
            Need more? Let's talk.
          </a>
        </p>

        <button
          onClick={() => setStep('contact')}
          className="inline-flex items-center gap-2 bg-[#00d4ff] hover:bg-[#00b4d8] text-[#0b0e1a] font-bold px-8 py-4 rounded-lg text-lg transition-colors"
        >
          Start Free Audit
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>

      {/* What you get */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <p className="text-center text-slate-400 text-sm uppercase tracking-widest mb-8">What your report includes</p>
        <div className="grid md:grid-cols-3 gap-4">
          {WHAT_YOU_GET.map(item => (
            <div key={item.title} className="bg-[#111827] border border-white/8 rounded-xl p-5">
              <div className="text-2xl mb-3">{item.icon}</div>
              <div className="font-semibold text-white mb-1">{item.title}</div>
              <div className="text-sm text-slate-400 leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy notice */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <div className="bg-[#111827] border border-slate-700 rounded-xl p-6 text-center">
          <div className="text-slate-400 text-sm leading-relaxed">
            <strong className="text-slate-300 block mb-2">Privacy First</strong>
            Your course content is used solely to generate your audit report.
            All uploaded files and generated reports are <strong className="text-white">permanently deleted within 24 hours</strong> of delivery.
            We do not retain, analyze, train on, or share your content in any way.
          </div>
        </div>
      </div>
    </div>
  );
}
