'use client';

import { useState } from 'react';

interface NotifyMeModalProps {
  productId: string;
  productName: string;
  size?: string;
  onClose: () => void;
}

export default function NotifyMeModal({ productId, productName, size, onClose }: NotifyMeModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, productId, size }),
    });

    if (res.ok) {
      setStatus('success');
    } else {
      const data = await res.json();
      setStatus('error');
      setErrorMsg(data.error ?? 'Failed to add');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-6 pointer-events-none">
        <div className="bg-white w-full max-w-sm p-8 pointer-events-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-heading text-xl tracking-widest uppercase">Notify Me</h2>
              <p className="font-body text-xs text-gray-400 mt-1">
                {productName}{size ? ` / ${size}` : ''}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-300 hover:text-black transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {status === 'success' ? (
            <div className="text-center py-4">
              <div className="w-10 h-10 rounded-full bg-charcoal flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-heading text-sm tracking-widest uppercase">We'll let you know</p>
              <p className="font-body text-xs text-gray-400 mt-2">
                You'll get an email when this item is back in stock.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p className="font-body text-sm text-gray-500">
                Enter your email and we'll notify you when this item is back in stock.
              </p>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="border border-gray-200 px-4 py-3 font-body text-sm focus:outline-none focus:border-charcoal placeholder-gray-300"
              />
              {status === 'error' && (
                <p className="font-body text-xs text-red-500">{errorMsg}</p>
              )}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-charcoal text-white font-heading text-xs tracking-[0.25em] uppercase py-3.5 hover:bg-gold transition-colors disabled:opacity-40"
              >
                {status === 'loading' ? 'ADDING...' : 'NOTIFY ME'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
