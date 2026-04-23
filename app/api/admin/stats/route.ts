import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const [ordersRes, subscribersRes, recentRes, lowStockRes] = await Promise.all([
    supabaseAdmin
      .from('orders')
      .select('total, status, created_at')
      .in('status', ['paid', 'processing', 'shipped', 'delivered']),
    supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, list_type', { count: 'exact' })
      .eq('active', true),
    supabaseAdmin
      .from('orders')
      .select('id, customer_email, total, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('product_sizes')
      .select('size, stock, products(name)')
      .lt('stock', 5)
      .order('stock', { ascending: true })
      .limit(10),
  ]);

  const orders = ordersRes.data ?? [];
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const totalOrders = orders.length;

  const subscribers = subscribersRes.data ?? [];
  const newsletterCount = subscribers.filter(s => s.list_type !== 'early_access').length;
  const earlyAccessCount = subscribers.filter(s => s.list_type !== 'newsletter').length;

  return NextResponse.json({
    totalRevenue,
    totalOrders,
    newsletterSubscribers: newsletterCount,
    earlyAccessSubscribers: earlyAccessCount,
    recentOrders: recentRes.data ?? [],
    lowStock: lowStockRes.data ?? [],
  });
}
