import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, RotateCcw, Monitor, FileText } from 'lucide-react';

interface Transformation {
  id: string;
  industry: string;
  title: string;
  beforeLabel: string;
  afterLabel: string;
  beforeImage: string;
  afterImage: string;
}

const transformations: Transformation[] = [
  {
    id: 'ipv',
    industry: 'Healthcare & Social Services',
    title: 'Intimate partner violence awareness training',
    beforeLabel: 'Legacy SCORM compliance module',
    afterLabel: 'Trauma-informed iceberg descent experience',
    beforeImage: '/transformations/beforeviolence.jpg',
    afterImage: '/transformations/ipv-after.jpg',
  },
  {
    id: 'entrepreneurship',
    industry: 'Corporate Training',
    title: '7-week entrepreneurship course',
    beforeLabel: 'PowerPoint slides and printed handouts',
    afterLabel: 'Immersive mountain climbing learning journey',
    beforeImage: '/transformations/beforeenterprenuer.jpg',
    afterImage: '/transformations/eie-after.jpg',
  },
  {
    id: 'healthcare',
    industry: 'Higher Education Healthcare',
    title: 'AI essentials for clinical staff',
    beforeLabel: 'Text-heavy compliance documents',
    afterLabel: 'Futuristic clinical dashboard experience',
    beforeImage: '/transformations/beforeclinical.jpg',
    afterImage: '/transformations/healthcare-after.png',
  },
  {
    id: 'insurance',
    industry: 'Insurance Licensing',
    title: '40-hour compliance training',
    beforeLabel: 'Static PDF manual with walls of regulatory text',
    afterLabel: 'Interactive CRM dashboard simulation',
    beforeImage: '/transformations/BeforeInsurance.jpg',
    afterImage: '/transformations/aic-after.jpg',
  },
];

type Phase = 'before' | 'destabilize' | 'flash' | 'revealing' | 'after' | 'reverting';

const BeforeFallback = ({ label }: { label: string }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-900/50">
    <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center mb-4">
      <FileText size={24} className="text-slate-500" aria-hidden="true" />
    </div>
    <p className="text-slate-400 text-sm">{label}</p>
  </div>
);

const AfterFallback = ({ label }: { label: string }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-brand-blue/5">
    <div className="w-16 h-16 bg-brand-blue/10 rounded-xl flex items-center justify-center mb-4">
      <Monitor size={24} className="text-brand-blue" aria-hidden="true" />
    </div>
    <p className="text-brand-blue text-sm font-medium">{label}</p>
  </div>
);

// Energy particles that scatter radially from center during flash
const PARTICLE_COUNT = 8;

const TransformationCard: React.FC<{
  item: Transformation;
  idx: number;
  isVisible: boolean;
  prefersReducedMotion: boolean;
  cardRef: (el: HTMLDivElement | null) => void;
}> = ({ item, idx, isVisible, prefersReducedMotion, cardRef }) => {
  const [beforeFailed, setBeforeFailed] = useState(false);
  const [afterFailed, setAfterFailed] = useState(false);
  const [phase, setPhase] = useState<Phase>('before');
  const timeoutsRef = useRef<number[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearAllTimeouts();
  }, [clearAllTimeouts]);

  const addTimeout = (fn: () => void, ms: number) => {
    timeoutsRef.current.push(window.setTimeout(fn, ms));
  };

  const handleTransform = () => {
    if (phase !== 'before' && phase !== 'after') return;

    if (prefersReducedMotion) {
      setPhase(phase === 'before' ? 'after' : 'before');
      return;
    }

    clearAllTimeouts();

    if (phase === 'before') {
      // Forward: destabilize → flash → revealing → after
      setPhase('destabilize');
      addTimeout(() => setPhase('flash'), 400);
      addTimeout(() => setPhase('revealing'), 600);
      addTimeout(() => setPhase('after'), 1500);
    } else {
      // Reverse: simple circle shrink back
      setPhase('reverting');
      addTimeout(() => setPhase('before'), 700);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTransform();
    }
  };

  const isShowingAfter = phase === 'revealing' || phase === 'after';
  const isInteractive = phase === 'before' || phase === 'after';

  // Before image filter per phase
  const getBeforeFilter = (): string => {
    switch (phase) {
      case 'destabilize':
        return 'grayscale(0%) hue-rotate(90deg) brightness(1.4) contrast(1.3)';
      case 'flash':
        return 'grayscale(0%) brightness(3) blur(6px)';
      case 'revealing':
      case 'after':
        return 'grayscale(100%) brightness(0.3) blur(2px)';
      default:
        return 'grayscale(100%) opacity(0.7)';
    }
  };

  // After image clip-path per phase (circular reveal from center)
  const getAfterClipPath = (): string => {
    switch (phase) {
      case 'revealing':
      case 'after':
        return 'circle(85% at 50% 50%)';
      case 'reverting':
        return 'circle(0% at 50% 50%)';
      default:
        return 'circle(0% at 50% 50%)';
    }
  };

  // Particle positions (radial, 8 directions)
  const particleAngles = Array.from({ length: PARTICLE_COUNT }, (_, i) => (360 / PARTICLE_COUNT) * i);

  return (
    <div
      ref={cardRef}
      data-id={item.id}
      className="transition-all duration-700"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transitionDelay: prefersReducedMotion ? '0ms' : `${idx * 150}ms`,
      }}
    >
      {/* Industry label */}
      <div className="mb-4">
        <span className="text-xs uppercase tracking-widest text-brand-blue font-bold">
          {item.industry}
        </span>
        <span className="text-slate-400 mx-2">—</span>
        <span className="text-sm text-slate-400">{item.title}</span>
      </div>

      {/* Interactive Before/After Image */}
      <div
        className="relative aspect-video rounded-2xl overflow-hidden select-none"
        style={{
          border: isShowingAfter ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'border-color 0.5s',
          cursor: isInteractive ? 'pointer' : 'default',
        }}
        onClick={handleTransform}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`${item.title}. Currently showing ${isShowingAfter ? 'after' : 'before'}: ${isShowingAfter ? item.afterLabel : item.beforeLabel}. Press to ${isShowingAfter ? 'see original' : 'see transformation'}.`}
      >
        {/* Before image (base layer) */}
        {beforeFailed ? (
          <BeforeFallback label={item.beforeLabel} />
        ) : (
          <img
            src={item.beforeImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: getBeforeFilter(),
              transition: 'filter 0.4s ease',
              animation: phase === 'destabilize' ? 'glitch-shake 0.15s ease infinite' : 'none',
            }}
            onError={() => setBeforeFailed(true)}
            draggable={false}
          />
        )}

        {/* Scanlines overlay during destabilize */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          aria-hidden="true"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
            opacity: phase === 'destabilize' ? 0.7 : 0,
            transition: 'opacity 0.2s',
          }}
        />

        {/* After image (overlay, circular reveal from center) */}
        {!afterFailed ? (
          <img
            src={item.afterImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover z-20"
            style={{
              clipPath: getAfterClipPath(),
              transition: phase === 'reverting'
                ? 'clip-path 0.6s cubic-bezier(0.4, 0, 0.8, 1)'
                : phase === 'revealing'
                  ? 'clip-path 0.9s cubic-bezier(0.16, 1, 0.3, 1)'
                  : 'clip-path 0.1s',
            }}
            onError={() => setAfterFailed(true)}
            draggable={false}
          />
        ) : isShowingAfter ? (
          <div
            className="absolute inset-0 z-20"
            style={{
              clipPath: getAfterClipPath(),
              transition: 'clip-path 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <AfterFallback label={item.afterLabel} />
          </div>
        ) : null}

        {/* Expanding glow ring during flash/revealing */}
        <div
          className="absolute z-30 pointer-events-none"
          aria-hidden="true"
          style={{
            top: '50%',
            left: '50%',
            width: '40px',
            height: '40px',
            marginTop: '-20px',
            marginLeft: '-20px',
            borderRadius: '50%',
            border: '2px solid rgba(56, 189, 248, 0.8)',
            boxShadow: '0 0 30px 10px rgba(56, 189, 248, 0.3), 0 0 60px 20px rgba(217, 70, 239, 0.2)',
            transform: (phase === 'flash' || phase === 'revealing') ? 'scale(25)' : 'scale(0)',
            opacity: phase === 'flash' ? 0.9 : phase === 'revealing' ? 0 : 0,
            transition: phase === 'flash'
              ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s'
              : phase === 'revealing'
                ? 'opacity 0.4s ease-out'
                : 'transform 0s, opacity 0s',
          }}
        />

        {/* Central radial flash burst */}
        <div
          className="absolute inset-0 pointer-events-none z-25"
          aria-hidden="true"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.6) 0%, rgba(217, 70, 239, 0.3) 30%, transparent 70%)',
            opacity: phase === 'flash' ? 1 : 0,
            transition: phase === 'flash' ? 'opacity 0.15s' : 'opacity 0.3s',
          }}
        />

        {/* Energy particles scattering from center */}
        {phase === 'flash' || phase === 'revealing' ? (
          particleAngles.map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const distance = 120 + (i % 3) * 40;
            const tx = Math.cos(rad) * distance;
            const ty = Math.sin(rad) * distance;
            return (
              <div
                key={i}
                className="absolute pointer-events-none z-30"
                aria-hidden="true"
                style={{
                  top: '50%',
                  left: '50%',
                  width: '6px',
                  height: '6px',
                  marginTop: '-3px',
                  marginLeft: '-3px',
                  borderRadius: '50%',
                  background: i % 2 === 0 ? '#38bdf8' : '#d946ef',
                  boxShadow: `0 0 8px 2px ${i % 2 === 0 ? 'rgba(56,189,248,0.6)' : 'rgba(217,70,239,0.6)'}`,
                  transform: phase === 'revealing'
                    ? `translate(${tx}px, ${ty}px) scale(0)`
                    : 'translate(0, 0) scale(1)',
                  opacity: phase === 'flash' ? 1 : 0,
                  transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease-out',
                }}
              />
            );
          })
        ) : null}

        {/* Before/After badge */}
        <div
          className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider z-40 backdrop-blur-sm"
          style={{
            backgroundColor: isShowingAfter ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.8)',
            borderWidth: '1px',
            borderColor: isShowingAfter ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.15)',
            color: isShowingAfter ? '#38bdf8' : '#94a3b8',
            transition: 'all 0.5s',
          }}
        >
          {isShowingAfter ? 'After' : 'Before'}
        </div>

        {/* Bottom CTA overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-40 pointer-events-none">
          <p className="text-center">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 backdrop-blur-sm"
              style={{
                backgroundColor: isShowingAfter ? 'rgba(255, 255, 255, 0.1)' : 'rgba(56, 189, 248, 0.15)',
                color: isShowingAfter ? 'rgba(255, 255, 255, 0.7)' : '#38bdf8',
                transition: 'all 0.5s',
              }}
            >
              {isShowingAfter ? (
                <><RotateCcw size={13} aria-hidden="true" /> Tap to see original</>
              ) : (
                <><Zap size={13} aria-hidden="true" /> Tap to transform</>
              )}
            </span>
          </p>
        </div>
      </div>

      {/* Label below */}
      <p
        className="text-sm mt-3 text-center font-medium transition-all duration-500"
        style={{ color: isShowingAfter ? '#38bdf8' : '#64748b' }}
      >
        {isShowingAfter ? item.afterLabel : item.beforeLabel}
      </p>
    </div>
  );
};

export const TransformationShowcase: React.FC = () => {
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const [headerVisible, setHeaderVisible] = useState(false);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const headerRef = useRef<HTMLDivElement>(null);
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
      setVisibleCards(new Set(transformations.map(t => t.id)));
      setHeaderVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === headerRef.current) {
              setHeaderVisible(true);
            } else {
              const id = entry.target.getAttribute('data-id');
              if (id) setVisibleCards(prev => new Set([...prev, id]));
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

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <section
      className="py-24 bg-space relative overflow-hidden"
      aria-labelledby="transformation-heading"
    >
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden="true" />

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <div
          ref={headerRef}
          className="text-center mb-16 transition-all duration-700"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(30px)',
          }}
        >
          <h2 id="transformation-heading" className="text-4xl md:text-5xl font-black text-white mb-6">
            We Don't Redesign.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">
              We Reimagine.
            </span>
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Every project gets a custom design tailored to the audience — never templates.
          </p>
        </div>

        <div className="space-y-16">
          {transformations.map((item, idx) => (
            <TransformationCard
              key={item.id}
              item={item}
              idx={idx}
              isVisible={visibleCards.has(item.id)}
              prefersReducedMotion={prefersReducedMotion}
              cardRef={(el) => { if (el) cardRefs.current.set(item.id, el); }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
