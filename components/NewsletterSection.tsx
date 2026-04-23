'use client';

import { useState } from 'react';

type ListType = 'newsletter' | 'early_access';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [listType, setListType] = useState<ListType>('newsletter');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, listType }),
    });

    if (res.ok) {
      setStatus('success');
      setMessage(
        listType === 'early_access'
          ? "You're in. Early access confirmed."
          : "You're on the list. Stay tuned."
      );
      setEmail('');
    } else {
      const data = await res.json();
      setStatus('error');
      setMessage(data.error ?? 'Something went wrong');
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

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-charcoal flex items-center justify-center">
              <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-heading text-sm tracking-widest text-black uppercase">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* List type toggle */}
            <div className="flex justify-center">
              <div className="inline-flex border border-gray-200">
                {([
                  { key: 'newsletter', label: 'Newsletter' },
                  { key: 'early_access', label: 'Early Access' },
                ] as { key: ListType; label: string }[]).map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setListType(opt.key)}
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

            <p className="font-body text-xs text-gray-400">
              {listType === 'early_access'
                ? 'Be first to hear unreleased tracks before public release.'
                : 'New drops, restock alerts, and merch news.'}
            </p>

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
                disabled={status === 'loading'}
                className="bg-charcoal text-white font-heading text-xs tracking-[0.25em] uppercase px-6 py-3 hover:bg-gold transition-colors disabled:opacity-40 whitespace-nowrap"
              >
                {status === 'loading' ? '...' : 'SUBSCRIBE'}
              </button>
            </div>

            {status === 'error' && (
              <p className="font-body text-xs text-red-500">{message}</p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
