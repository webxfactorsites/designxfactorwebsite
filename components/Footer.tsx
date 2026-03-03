import React from 'react';
import { NavProps } from '../types';

export const Footer: React.FC<NavProps> = ({ onNavigate }) => {
  const handleLink = (target: string, isPage = false) => {
    if (isPage) {
      // @ts-ignore
      onNavigate(target);
      window.scrollTo(0, 0);
    } else {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <footer
      className="relative z-30 border-t border-white/10 bg-space pt-20 pb-8 px-6"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 mb-16">
        {/* Brand Column */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <img
              src="https://pub-e5994fd168b34b10b119b4228ec3bf11.r2.dev/DXF_logo-white.png"
              alt="Design X Factor"
              className="h-8 w-auto"
            />
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            We transform static corporate training into experiences learners actually remember.
          </p>
          <p className="text-slate-400 text-xs">
            Custom design for YOUR audience — never templates.
          </p>
        </div>

        {/* Explore Navigation */}
        <nav aria-labelledby="footer-explore-heading">
          <h4
            id="footer-explore-heading"
            className="font-bold text-white mb-6 uppercase tracking-wider text-sm"
          >
            Explore
          </h4>
          <ul className="space-y-4 text-slate-300 text-sm">
            <li>
              <button
                onClick={() => handleLink('how-we-work', true)}
                className="hover:text-brand-blue transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
              >
                How We Work
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLink('comparison')}
                className="hover:text-brand-blue transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
              >
                Why Choose Us
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLink('contact')}
                className="hover:text-brand-blue transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
              >
                Contact Us
              </button>
            </li>
          </ul>
        </nav>

        {/* Legal Navigation */}
        <nav aria-labelledby="footer-legal-heading">
          <h4
            id="footer-legal-heading"
            className="font-bold text-white mb-6 uppercase tracking-wider text-sm"
          >
            Legal
          </h4>
          <ul className="space-y-4 text-slate-300 text-sm">
            <li>
              <button
                onClick={() => handleLink('privacy', true)}
                className="hover:text-brand-blue transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLink('terms', true)}
                className="hover:text-brand-blue transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
              >
                Terms of Service
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center text-slate-400 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <p>&copy; {new Date().getFullYear()} Design X Factor. All rights reserved.</p>
        <p>
          <span className="text-brand-gold">Bueno.</span>{' '}
          <span className="text-brand-purple">Bonito.</span>{' '}
          <span className="text-brand-blue">Barato.</span>{' '}
          <span className="text-slate-400">— Quality, Beauty, Affordability.</span>
        </p>
      </div>
    </footer>
  );
};
