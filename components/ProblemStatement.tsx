import React, { useEffect, useRef, useState } from 'react';
import { TrendingDown, Clock, Palette, HelpCircle } from 'lucide-react';

const painPoints = [
  {
    icon: TrendingDown,
    quote: "Our training content is solid, but completion rates are embarrassing",
  },
  {
    icon: Clock,
    quote: "We spent months building this course and it's already outdated",
  },
  {
    icon: Palette,
    quote: "We have the tools, but our training still looks... off",
  },
  {
    icon: HelpCircle,
    quote: "No way to know if the message actually landed",
  },
];

export const ProblemStatement: React.FC = () => {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const [headerVisible, setHeaderVisible] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLParagraphElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisibleCards(new Set(painPoints.map((_, i) => i)));
      setHeaderVisible(true);
      setFooterVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === headerRef.current) {
              setHeaderVisible(true);
            } else if (entry.target === footerRef.current) {
              setFooterVisible(true);
            } else {
              const idx = Number(entry.target.getAttribute('data-index'));
              setVisibleCards(prev => new Set([...prev, idx]));
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    if (headerRef.current) observer.observe(headerRef.current);
    if (footerRef.current) observer.observe(footerRef.current);

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <section
      className="py-24 bg-space relative overflow-hidden"
      aria-labelledby="problem-heading"
    >
      {/* Subtle red glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-red/5 rounded-full blur-[120px]" aria-hidden="true" />

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <div
          ref={headerRef}
          className="text-center mb-16 transition-all duration-700"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(30px)',
          }}
        >
          <blockquote className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-6 leading-tight">
            "Having Canva and ChatGPT doesn't make you a designer.
            <br className="hidden sm:block" />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(110deg, #ff4d6d 0%, #d946ef 35%, #ffa0b4 50%, #d946ef 65%, #ff4d6d 100%)',
                backgroundSize: '250% 100%',
                WebkitBackgroundClip: 'text',
                animation: headerVisible && !prefersReducedMotion ? 'shimmer 4s ease-in-out infinite 1s' : 'none',
              }}
            >
              {' '}Just like having a scalpel doesn't make you a surgeon."
            </span>
          </blockquote>
          <p className="text-lg text-slate-400 font-medium">
            Tools don't teach. Design does.
          </p>
        </div>

        <h2 id="problem-heading" className="sr-only">Common training challenges</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {painPoints.map((point, idx) => {
            const Icon = point.icon;
            const isVisible = visibleCards.has(idx);

            return (
              <div
                key={idx}
                ref={el => { cardRefs.current[idx] = el; }}
                data-index={idx}
                className="bg-white/[0.02] border border-brand-red/20 rounded-xl p-6 transition-all duration-500"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
                  transitionDelay: prefersReducedMotion ? '0ms' : `${idx * 100}ms`,
                  animation: isVisible && !prefersReducedMotion ? `glow-pulse-red 3s ease-in-out infinite ${idx * 0.7}s` : 'none',
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-brand-red/10 rounded-lg flex-shrink-0">
                    <Icon size={20} className="text-brand-red" aria-hidden="true" />
                  </div>
                  <p className="text-slate-300 text-lg font-medium leading-relaxed italic">
                    "{point.quote}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <p
          ref={footerRef}
          className="text-center text-slate-400 text-sm mt-12 transition-all duration-700"
          style={{
            opacity: footerVisible ? 1 : 0,
            transform: footerVisible ? 'translateY(0)' : 'translateY(15px)',
          }}
        >
          Sound familiar? You're not alone — and there's a better way.
        </p>
      </div>
    </section>
  );
};
