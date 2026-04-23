'use client';

import { useState } from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-white"
    >
      <button
        onClick={onEnter}
        className="logo-enter flex flex-col items-center gap-6 cursor-pointer border-none bg-transparent p-0 outline-none focus-visible:outline-none"
        aria-label="Enter SANELi"
      >
        {!imgFailed ? (
          <img
            src="/logo.png"
            alt="SANELi"
            className="w-60 h-60 md:w-80 md:h-80 object-contain select-none"
            draggable={false}
            onError={() => setImgFailed(true)}
          />
        ) : (
          /* Fallback if logo.png is not yet placed in /public */
          <div className="w-60 h-60 md:w-80 md:h-80 rounded-full border-2 border-charcoal/20 flex items-center justify-center">
            <span
              className="font-heading text-5xl md:text-7xl tracking-widest text-charcoal"
              style={{ letterSpacing: '0.15em' }}
            >
              SANELi
            </span>
          </div>
        )}

        <span className="font-heading text-xs tracking-[0.45em] text-black/30 uppercase select-none">
          CLICK TO ENTER
        </span>
      </button>
    </div>
  );
}
