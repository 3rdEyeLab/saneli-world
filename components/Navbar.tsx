'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { openCart, itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const navLinks = [
    { label: 'SHOP', id: 'shop' },
    { label: 'MUSIC', id: 'music' },
    { label: 'ABOUT', id: 'about' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 focus-visible:outline-none"
          aria-label="SANELi home"
        >
          <img
            src="/mainpagelogo.png"
            alt="SANELi"
            className="h-9 w-auto object-contain"
            onError={e => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </button>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="font-heading text-xs tracking-[0.3em] text-black hover:text-gold transition-colors duration-200 uppercase"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right: Cart + Mobile menu toggle */}
        <div className="flex items-center gap-5">
          <button
            onClick={openCart}
            className="relative flex items-center gap-1.5 font-heading text-xs tracking-[0.2em] text-black hover:text-gold transition-colors"
            aria-label={`Open cart — ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
              />
            </svg>
            <span className="hidden sm:block">BAG</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-charcoal text-white font-body text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1 p-1"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-5 h-px bg-black transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}
            />
            <span
              className={`block w-5 h-px bg-black transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`block w-5 h-px bg-black transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          {navLinks.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="block w-full text-left px-6 py-3 font-heading text-xs tracking-[0.3em] text-black hover:text-gold hover:bg-gray-50 transition-colors border-b border-gray-50"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
