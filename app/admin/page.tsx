'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      setError('Incorrect password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img src="/mainpagelogo.png" alt="SANELi" className="h-14 w-auto object-contain mx-auto mb-4"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <p className="font-heading text-xs tracking-[0.4em] text-white/40 uppercase">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-white/5 border border-white/10 text-white placeholder-white/30 px-4 py-3 font-body text-sm focus:outline-none focus:border-gold w-full"
            autoFocus
          />
          {error && (
            <p className="font-body text-xs text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="bg-gold text-charcoal font-heading text-xs tracking-[0.3em] uppercase py-3.5 hover:bg-gold-light transition-colors disabled:opacity-40"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </div>
  );
}
