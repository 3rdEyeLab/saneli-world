'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  newsletterSubscribers: number;
  earlyAccessSubscribers: number;
  recentOrders: { id: string; customer_email: string; total: number; status: string; created_at: string }[];
  lowStock: { size: string; stock: number; products: { name: string } }[];
}

const STATUS_COLORS: Record<string, string> = {
  paid: 'text-green-400', processing: 'text-blue-400',
  shipped: 'text-purple-400', delivered: 'text-gold',
  pending: 'text-yellow-400', cancelled: 'text-red-400', refunded: 'text-gray-400',
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats);
  }, []);

  if (!stats) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center h-64 text-white/30 font-heading tracking-widest text-sm">
          LOADING...
        </div>
      </AdminShell>
    );
  }

  const statCards = [
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}` },
    { label: 'Total Orders',  value: stats.totalOrders },
    { label: 'Newsletter',    value: stats.newsletterSubscribers },
    { label: 'Early Access',  value: stats.earlyAccessSubscribers },
  ];

  return (
    <AdminShell>
      <div className="p-8">
        <h1 className="font-heading text-3xl tracking-widest uppercase mb-8">Dashboard</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map(card => (
            <div key={card.label} className="bg-white/5 border border-white/10 p-5">
              <p className="font-heading text-[10px] tracking-[0.3em] text-white/40 uppercase mb-2">{card.label}</p>
              <p className="font-heading text-3xl text-gold">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent orders */}
          <div className="bg-white/5 border border-white/10 p-5">
            <h2 className="font-heading text-sm tracking-[0.25em] uppercase mb-4">Recent Orders</h2>
            {stats.recentOrders.length === 0 ? (
              <p className="font-body text-xs text-white/30">No orders yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <p className="font-body text-xs text-white">{order.customer_email}</p>
                      <p className="font-heading text-[10px] tracking-wider text-white/40">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-body text-xs text-white">${Number(order.total).toFixed(2)}</p>
                      <p className={`font-heading text-[10px] tracking-wider uppercase ${STATUS_COLORS[order.status] ?? 'text-white/40'}`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low stock */}
          <div className="bg-white/5 border border-white/10 p-5">
            <h2 className="font-heading text-sm tracking-[0.25em] uppercase mb-4">
              Low Stock <span className="text-white/30">(under 5)</span>
            </h2>
            {stats.lowStock.length === 0 ? (
              <p className="font-body text-xs text-white/30">All sizes well stocked</p>
            ) : (
              <div className="flex flex-col gap-2">
                {stats.lowStock.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <p className="font-body text-xs text-white">
                      {item.products?.name} / {item.size}
                    </p>
                    <span className={`font-heading text-xs ${item.stock === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                      {item.stock === 0 ? 'OUT' : `${item.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
