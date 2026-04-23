'use client';

import { useState } from 'react';
import { CartProvider } from '@/context/CartContext';
import LandingPage from '@/components/LandingPage';
import HomePage from '@/components/HomePage';

export default function Page() {
  const [entered, setEntered] = useState(false);

  return (
    <CartProvider>
      {!entered ? (
        <LandingPage onEnter={() => setEntered(true)} />
      ) : (
        <div className="animate-fadeIn">
          <HomePage />
        </div>
      )}
    </CartProvider>
  );
}
