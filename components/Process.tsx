import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Users,
  Hammer,
  Rocket,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { PageView } from '../types';

const steps = [
  {
    id: 1,
    title: 'Discovery',
    description: 'We learn your content, your audience, your goals',
    icon: MessageSquare,
    color: '#38bdf8',
    details: [
      'Review your existing materials',
      'Interview actual end users — not just stakeholders',
      'Define measurable success outcomes'
    ]
  },
  {
    id: 2,
    title: 'Design & Validate',
    description: 'We test concepts with real users before building',
    icon: Users,
    color: '#d946ef',
    details: [
      'Create design direction based on personas',
      'Validate with real learners before production',
      'Catch problems early, save money'
    ]
  },
  {
    id: 3,
    title: 'Build',
    description: 'Content approved in plain text, then produced to spec',
    icon: Hammer,
    color: '#f59e0b',
    details: [
      'Black & white content review — no expensive surprises',
      'Full media production (video, audio, interactive)',
      'WCAG 2.1 AA accessibility built in'
    ]
  },
  {
    id: 4,
    title: 'Deliver',
    description: 'LMS-ready in HTML, SCORM, or API — your choice',
    icon: Rocket,
    color: '#10b981',
    details: [
      'Multiple output formats for any platform',
      'Client review and iteration rounds',
      'Training and handoff included'
    ]
  }
];

export const Process: React.FC<{ onNavigate: (page: PageView) => void }> = ({ onNavigate }) => {
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const [headerVisible, setHeaderVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setVisibleSteps(new Set(steps.map((_, i) => i)));
      setHeaderVisible(true);
      setCtaVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = entry.target.getAttribute('data-step');
          if (idx !== null) setVisibleSteps(prev => new Set([...prev, Number(idx)]));
          if (entry.target === headerRef.current) setHeaderVisible(true);
          if (entry.target === ctaRef.current) setCtaVisible(true);
        });
      },
      { threshold: 0.2 }
    );

    // Query all visible step elements in the DOM (avoids desktop/mobile ref collision)
    if (sectionRef.current) {
      sectionRef.current.querySelectorAll('[data-step]').forEach(el => observer.observe(el));
    }
    if (headerRef.current) observer.observe(headerRef.current);
    if (ctaRef.current) observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent relative overflow-hidden"
      aria-labelledby="process-heading"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.03),transparent_50%)]" aria-hidden="true" />

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div
          ref={headerRef}
          className="text-center mb-16 transition-all duration-700"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(30px)',
          }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full mb-6">
            <Rocket size={16} className="text-brand-gold" aria-hidden="true" />
            <span className="text-sm text-brand-gold font-semibold">Our Methodology</span>
          </div>
          <h2 id="process-heading" className="text-4xl md:text-5xl font-black text-white mb-6">
            A Process Built to Eliminate Surprises
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            We design for your audience, not assumptions about your audience.
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block relative">
          <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-blue via-brand-purple via-brand-gold to-green-500" aria-hidden="true" />

          <div className="grid grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                data-step={idx}
                className="relative transition-all duration-600"
                style={{
                  opacity: visibleSteps.has(idx) ? 1 : 0,
                  transform: visibleSteps.has(idx) ? 'translateY(0)' : 'translateY(40px)',
                  transitionDuration: '600ms',
                  transitionDelay: `${idx * 150}ms`,
                }}
              >
                <div className="flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-6 relative z-10 border-4 border-space"
                    style={{ backgroundColor: step.color }}
                  >
                    <step.icon size={20} className="text-white" aria-hidden="true" />
                  </div>

                  <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 w-full hover:border-white/20 transition-all group">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white/90">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                          <CheckCircle size={12} style={{ color: step.color }} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden space-y-6">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              data-step={idx}
              className="relative flex gap-4 transition-all"
              style={{
                opacity: visibleSteps.has(idx) ? 1 : 0,
                transform: visibleSteps.has(idx) ? 'translateX(0)' : 'translateX(-30px)',
                transitionDuration: '500ms',
                transitionDelay: `${idx * 120}ms`,
              }}
            >
              {idx < steps.length - 1 && (
                <div
                  className="absolute left-6 top-12 w-0.5 h-[calc(100%-24px)]"
                  style={{ backgroundColor: `${step.color}30` }}
                  aria-hidden="true"
                />
              )}

              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
                style={{ backgroundColor: step.color }}
              >
                <step.icon size={20} className="text-white" aria-hidden="true" />
              </div>

              <div className="flex-1 pb-6">
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm mb-3">{step.description}</p>
                <ul className="space-y-1.5">
                  {step.details.map((detail, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                      <CheckCircle size={10} style={{ color: step.color }} aria-hidden="true" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* CTA to full experience */}
        <div
          ref={ctaRef}
          className="mt-16 text-center transition-all duration-700 focus-within:!opacity-100 focus-within:!translate-y-0"
          style={{
            opacity: ctaVisible ? 1 : 0,
            transform: ctaVisible ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <p className="text-slate-400 text-sm mb-6">
            This is the condensed version. Want to experience it firsthand?
          </p>
          <button
            onClick={() => onNavigate('how-we-work')}
            className="inline-flex items-center gap-2 px-8 py-3 bg-brand-gold/10 border border-brand-gold/30 hover:bg-brand-gold/20 text-brand-gold font-semibold rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
          >
            Experience Our Full Process <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};
