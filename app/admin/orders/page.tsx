'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import type { Order } from '@/types';

const STATUSES = ['all', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

const STATUS_COLORS: Record<string, string> = {
  paid: 'text-green-400', processing: 'text-blue-400',
  shipped: 'text-purple-400', delivered: 'text-gold',
  pending: 'text-yellow-400', cancelled: 'text-red-400', refunded: 'text-gray-400',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = (status: string) => {
    setLoading(true);
    fetch(`/api/admin/orders?status=${status}`)
      .then(r => r.json())
      .then(data => { setOrders(data); setLoading(false); });
  };

  useEffect(() => { load(filter); }, [filter]);

  const updateStatus = async (orderId: string, status: string) => {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load(filter);
  };

  return (
    <AdminShell>
      <div className="p-8">
        <h1 className="font-heading text-3xl tracking-widest uppercase mb-6">Orders</h1>

        {/* Filter tabs */}
        <div className="flex gap-0 mb-6 overflow-x-auto">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`font-heading text-[10px] tracking-[0.25em] uppercase px-4 py-2 border-y border-r first:border-l transition-colors whitespace-nowrap ${
                filter === s ? 'bg-gold text-charcoal border-gold' : 'border-white/10 text-white/40 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="font-body text-white/30 text-sm">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="font-body text-white/30 text-sm">No orders found.</p>
        ) : (
          <div className="bg-white/5 border border-white/10 overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-white/10">
                  {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-heading text-[10px] tracking-[0.25em] text-white/40 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 font-body text-xs text-white/60">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-white">
                      {order.customer_email}
                      {order.customer_name && (
                        <p className="text-white/40">{order.customer_name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {order.order_items?.map((item, i) => (
                        <p key={i} className="font-body text-xs text-white/60">
                          {item.product_name}{item.size ? ` / ${item.size}` : ''} × {item.quantity}
                        </p>
                      ))}
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-white font-medium">
                      ${Number(order.total).toFixed(2)}
                      {order.discount_code && (
                        <p className="text-[10px] text-gold font-heading tracking-wider">{order.discount_code}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        className={`bg-transparent border border-white/10 font-heading text-[10px] tracking-wider uppercase px-2 py-1 cursor-pointer focus:outline-none ${STATUS_COLORS[order.status] ?? 'text-white'}`}
                      >
                        {['pending','paid','processing','shipped','delivered','cancelled','refunded'].map(s => (
                          <option key={s} value={s} className="bg-[#0d0d0d] text-white">{s.toUpperCase()}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-white/40">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
