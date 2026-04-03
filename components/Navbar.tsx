import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, Wrench } from 'lucide-react';
import { NavProps, PageView } from '../types';

export const Navbar: React.FC<NavProps> = ({ onNavigate, currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  // Close menus on escape or outside click
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsToolsOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

          {/* Tools dropdown */}
          <div ref={toolsRef} className="relative">
            <button
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className={`flex items-center gap-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded px-2 py-1 ${
                currentPage === 'course-audit' ? 'text-white' : 'text-slate-300 hover:text-white'
              }`}
              aria-haspopup="true"
              aria-expanded={isToolsOpen}
            >
              Tools
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
            {isToolsOpen && (
              <div className="absolute top-full right-0 mt-2 w-52 bg-space border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                <button
                  onClick={() => { handlePageClick('course-audit'); setIsToolsOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-blue ${
                    currentPage === 'course-audit' ? 'text-white bg-white/5' : 'text-slate-300'
                  }`}
                >
                  <Wrench size={15} className="text-brand-red shrink-0" aria-hidden="true" />
                  <span>Free Course Audit</span>
                </button>
              </div>
            )}
          </div>

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

            {/* Mobile Tools */}
            <div>
              <button
                onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
                className="flex items-center gap-2 text-slate-200 text-lg font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded px-2 py-1 w-full"
                aria-expanded={isMobileToolsOpen}
              >
                Tools
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${isMobileToolsOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
              {isMobileToolsOpen && (
                <div className="mt-2 ml-4 flex flex-col gap-2 border-l border-white/10 pl-4">
                  <button
                    onClick={() => { handlePageClick('course-audit'); }}
                    className="flex items-center gap-3 text-left text-slate-300 text-base font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded px-2 py-1"
                  >
                    <Wrench size={14} className="text-brand-red shrink-0" aria-hidden="true" />
                    Free Course Audit
                  </button>
                </div>
              )}
            </div>

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
