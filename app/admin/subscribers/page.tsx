'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';

interface Subscriber {
  id: string;
  email: string;
  list_type: 'newsletter' | 'early_access' | 'both';
  active: boolean;
  created_at: string;
}

type Tab = 'newsletter' | 'early_access';

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [tab, setTab] = useState<Tab>('newsletter');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/subscribers')
      .then(r => r.json())
      .then(data => { setSubscribers(data); setLoading(false); });
  };

  useEffect(load, []);

  const remove = async (id: string) => {
    await fetch('/api/admin/subscribers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const filtered = subscribers.filter(s =>
    tab === 'newsletter'
      ? s.list_type === 'newsletter' || s.list_type === 'both'
      : s.list_type === 'early_access' || s.list_type === 'both'
  );

  const newsletterCount = subscribers.filter(s => s.list_type === 'newsletter' || s.list_type === 'both').length;
  const earlyAccessCount = subscribers.filter(s => s.list_type === 'early_access' || s.list_type === 'both').length;

  return (
    <AdminShell>
      <div className="p-4 md:p-8">
        <h1 className="font-heading text-2xl md:text-3xl tracking-widest uppercase mb-6">Subscribers</h1>

        {/* Tabs */}
        <div className="flex gap-0 mb-6">
          <button onClick={() => setTab('newsletter')}
            className={`font-heading text-[10px] tracking-[0.2em] uppercase px-4 py-2.5 border transition-colors ${
              tab === 'newsletter' ? 'bg-gold text-charcoal border-gold' : 'border-white/10 text-white/40 hover:text-white'
            }`}>
            NEWSLETTER ({newsletterCount})
          </button>
          <button onClick={() => setTab('early_access')}
            className={`font-heading text-[10px] tracking-[0.2em] uppercase px-4 py-2.5 border-y border-r transition-colors ${
              tab === 'early_access' ? 'bg-gold text-charcoal border-gold' : 'border-white/10 text-white/40 hover:text-white'
            }`}>
            EARLY ACCESS ({earlyAccessCount})
          </button>
        </div>

        {loading ? (
          <p className="font-body text-white/30 text-sm">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="font-body text-white/30 text-sm">No subscribers yet.</p>
        ) : (
          <>
            {/* Mobile */}
            <div className="flex flex-col gap-2 md:hidden">
              {filtered.map(sub => (
                <div key={sub.id} className="bg-white/5 border border-white/10 p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-body text-sm text-white truncate">{sub.email}</p>
                    <p className="font-heading text-[10px] tracking-wider text-white/30 mt-0.5">
                      {new Date(sub.created_at).toLocaleDateString()}
                      {sub.list_type === 'both' && <span className="ml-2 text-gold">BOTH LISTS</span>}
                    </p>
                  </div>
                  <button onClick={() => remove(sub.id)}
                    className="font-heading text-[10px] tracking-wider text-red-500/50 hover:text-red-500 transition-colors shrink-0">
                    REMOVE
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden md:block bg-white/5 border border-white/10">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Email', 'List', 'Signed Up', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-heading text-[10px] tracking-[0.25em] text-white/40 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(sub => (
                    <tr key={sub.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3 font-body text-sm text-white">{sub.email}</td>
                      <td className="px-4 py-3 font-heading text-[10px] tracking-wider uppercase">
                        <span className={sub.list_type === 'both' ? 'text-gold' : 'text-white/50'}>
                          {sub.list_type === 'both' ? 'BOTH' : sub.list_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-body text-xs text-white/40">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => remove(sub.id)}
                          className="font-heading text-[10px] tracking-wider text-red-500/50 hover:text-red-500 transition-colors">
                          REMOVE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
