'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';

type ListType = 'newsletter' | 'early_access';

export default function NewsletterSection() {
  const { addItem } = useCart();
  const [email, setEmail] = useState('');
  const [listType, setListType] = useState<ListType>('newsletter');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const [earlyProduct, setEarlyProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (listType !== 'early_access' || earlyProduct) return;
    setProductLoading(true);
    fetch('/api/early-access')
      .then(r => r.json())
      .then(data => {
        if (data) setEarlyProduct(data as Product);
        setProductLoading(false);
      });
  }, [listType, earlyProduct]);

  const handleAddToCart = () => {
    if (!earlyProduct) return;
    addItem(earlyProduct);
    setAdded(true);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus('loading');
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, listType: 'newsletter' }),
    });
    if (res.ok) {
      setNewsletterStatus('success');
      setEmail('');
    } else {
      const data = await res.json();
      setNewsletterStatus('error');
      setNewsletterMsg(data.error ?? 'Something went wrong');
    }
  };

  return (
    <section id="newsletter" className="bg-white border-t border-gray-100 py-24 px-6">
      <div className="max-w-xl mx-auto text-center">
        <p className="font-heading text-xs tracking-[0.5em] text-gold uppercase mb-3">
          SANELi WORLD
        </p>
        <h2 className="font-heading text-4xl md:text-6xl tracking-widest text-black uppercase mb-3">
          JOIN THE MOVEMENT
        </h2>
        <div className="w-8 h-px bg-charcoal mx-auto mb-6" />
        <p className="font-body text-gray-400 text-sm mb-10">
          Exclusive drops, early access to unreleased music, and first dibs on limited merch.
        </p>

        {/* Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex border border-gray-200">
            {([
              { key: 'newsletter',   label: 'Newsletter' },
              { key: 'early_access', label: 'Early Access' },
            ] as { key: ListType; label: string }[]).map(opt => (
              <button
                key={opt.key}
                type="button"
                onClick={() => { setListType(opt.key); setAdded(false); }}
                className={`font-heading text-xs tracking-[0.2em] uppercase px-6 py-2.5 transition-colors ${
                  listType === opt.key
                    ? 'bg-charcoal text-white'
                    : 'bg-white text-black hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {listType === 'newsletter' ? (
          newsletterStatus === 'success' ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-charcoal flex items-center justify-center">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-heading text-sm tracking-widest text-black uppercase">You&apos;re on the list. Stay tuned.</p>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-4">
              <p className="font-body text-xs text-gray-400">New drops, restock alerts, and merch news.</p>
              <div className="flex gap-0">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 border border-gray-200 border-r-0 px-4 py-3 font-body text-sm focus:outline-none focus:border-charcoal placeholder-gray-300"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  className="bg-charcoal text-white font-heading text-xs tracking-[0.25em] uppercase px-6 py-3 hover:bg-gold transition-colors disabled:opacity-40 whitespace-nowrap"
                >
                  {newsletterStatus === 'loading' ? '...' : 'SUBSCRIBE'}
                </button>
              </div>
              {newsletterStatus === 'error' && (
                <p className="font-body text-xs text-red-500">{newsletterMsg}</p>
              )}
            </form>
          )
        ) : (
          <div className="flex flex-col items-center gap-6">
            {productLoading ? (
              <p className="font-body text-sm text-gray-400">Loading...</p>
            ) : !earlyProduct ? (
              <p className="font-body text-sm text-gray-400">Early access coming soon.</p>
            ) : added ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-charcoal flex items-center justify-center">
                  <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-heading text-sm tracking-widest text-black uppercase">Added to bag</p>
                <p className="font-body text-xs text-gray-400">Complete your checkout to secure your spot.</p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <p className="font-heading text-2xl tracking-widest text-black uppercase mb-1">{earlyProduct.name}</p>
                  {earlyProduct.description && (
                    <p className="font-body text-sm text-gray-400 mb-4 max-w-sm mx-auto">{earlyProduct.description}</p>
                  )}
                  <p className="font-heading text-4xl text-gold">${Number(earlyProduct.price).toFixed(2)}</p>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="bg-charcoal text-white font-heading text-xs tracking-[0.35em] uppercase px-12 py-4 hover:bg-gold transition-colors"
                >
                  ADD TO BAG
                </button>
                <p className="font-body text-xs text-gray-400">
                  Your email will be saved to the early access list after checkout.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
