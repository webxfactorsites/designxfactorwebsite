import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { NavProps, PageView } from '../types';

export const Navbar: React.FC<NavProps> = ({ onNavigate, currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  const handleNavClick = (e: React.MouseEvent, target: string) => {
    e.preventDefault();
    if (currentPage !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const handlePageClick = (page: PageView) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <header>
      <nav
        className="fixed top-0 w-full h-[70px] bg-space/90 backdrop-blur-xl border-b border-white/10 z-50 px-6 lg:px-12 flex items-center justify-between transition-all duration-300"
        aria-label="Main navigation"
      >
        <a
          href="#"
          onClick={handleHomeClick}
          className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red rounded-lg p-1"
          aria-label="Design X Factor - Go to homepage"
        >
          <img
            src="https://pub-e5994fd168b34b10b119b4228ec3bf11.r2.dev/DXF_logo-white.png"
            alt="Design X Factor"
            className="h-8 w-auto"
          />
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => handlePageClick('how-we-work')}
            className={`text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded px-2 py-1 ${
              currentPage === 'how-we-work' ? 'text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            How We Work
          </button>

          <a
            href="#comparison"
            onClick={(e) => handleNavClick(e, 'comparison')}
            className="text-slate-300 hover:text-white transition-colors text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded px-2 py-1"
          >
            Why Us
          </a>

          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, 'contact')}
            className="bg-brand-red hover:bg-red-500 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-all transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-500/50 shadow-lg shadow-brand-red/20"
          >
            Let's Talk
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-lg"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            id="mobile-menu"
            role="navigation"
            aria-label="Mobile navigation"
            className="absolute top-[70px] left-0 w-full bg-space border-b border-white/10 p-6 flex flex-col gap-6 md:hidden shadow-2xl"
          >
            <button
              onClick={() => handlePageClick('how-we-work')}
              className={`text-left text-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded px-2 py-1 ${
                currentPage === 'how-we-work' ? 'text-white' : 'text-slate-200'
              }`}
            >
              How We Work
            </button>

            <a
              href="#comparison"
              className="text-slate-200 text-lg font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded px-2 py-1"
              onClick={(e) => handleNavClick(e, 'comparison')}
            >
              Why Us
            </a>

            <a
              href="#contact"
              className="bg-brand-red text-center text-white px-6 py-3 rounded-lg font-bold mt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 focus-visible:ring-offset-space"
              onClick={(e) => handleNavClick(e, 'contact')}
            >
              Let's Talk
            </a>
          </div>
        )}
      </nav>
    </header>
  );
};
