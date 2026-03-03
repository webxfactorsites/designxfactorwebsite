import React, { useState, useEffect, useRef } from 'react';
import { GraduationCap, Building2, Shield, Zap } from 'lucide-react';

const stats = [
  {
    icon: GraduationCap,
    value: '6+',
    label: 'Industries Served',
    detail: 'Education, Healthcare, Insurance, Corporate & more',
  },
  {
    icon: Building2,
    value: 'Custom',
    label: 'Every Project',
    detail: 'Tailored design for YOUR audience — never templates',
  },
  {
    icon: Shield,
    value: 'WCAG 2.1 AA',
    label: 'Compliant',
    detail: 'Accessibility built in from day one, not bolted on',
  },
  {
    icon: Zap,
    value: 'Weeks',
    label: 'Not Months',
    detail: 'Enterprise quality at startup speed',
  },
];

export const ProofStrip: React.FC = () => {
  const [visibleStats, setVisibleStats] = useState<Set<number>>(new Set());
  const [promiseVisible, setPromiseVisible] = useState(false);
  const statRefs = useRef<(HTMLDivElement | null)[]>([]);
  const promiseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setVisibleStats(new Set(stats.map((_, i) => i)));
      setPromiseVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = entry.target.getAttribute('data-stat');
          if (idx !== null) setVisibleStats(prev => new Set([...prev, Number(idx)]));
          if (entry.target === promiseRef.current) setPromiseVisible(true);
        });
      },
      { threshold: 0.2 }
    );

    statRefs.current.forEach(ref => { if (ref) observer.observe(ref); });
    if (promiseRef.current) observer.observe(promiseRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="py-16 bg-gradient-to-b from-[#08080c] to-space relative overflow-hidden"
      aria-labelledby="credentials-heading"
    >
      <div className="container mx-auto px-6 max-w-6xl">
        <h2 id="credentials-heading" className="sr-only">Our credentials and promises</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                ref={el => { statRefs.current[idx] = el; }}
                data-stat={idx}
                className="text-center group transition-all"
                style={{
                  opacity: visibleStats.has(idx) ? 1 : 0,
                  transform: visibleStats.has(idx) ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(20px)',
                  transitionDuration: '500ms',
                  transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transitionDelay: `${idx * 120}ms`,
                }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/5 border border-white/10 rounded-xl mb-4 group-hover:border-brand-blue/30 transition-colors">
                  <Icon size={22} className="text-brand-blue" aria-hidden="true" />
                </div>
                <div className="text-2xl md:text-3xl font-black text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-slate-300 mb-2">
                  {stat.label}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {stat.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bueno Bonito Barato */}
        <div
          ref={promiseRef}
          className="mt-16 text-center transition-all duration-700"
          style={{
            opacity: promiseVisible ? 1 : 0,
            transform: promiseVisible ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <p className="text-slate-400 text-sm tracking-wider uppercase">
            Our Promise
          </p>
          <p className="text-2xl md:text-3xl font-black text-white mt-3">
            <span className="text-brand-gold">Bueno.</span>{' '}
            <span className="text-brand-purple">Bonito.</span>{' '}
            <span className="text-brand-blue">Barato.</span>
          </p>
          <p className="text-slate-400 text-sm mt-2">
            Quality. Beauty. Affordability. Most say pick two — we deliver all three.
          </p>
        </div>
      </div>
    </section>
  );
};
