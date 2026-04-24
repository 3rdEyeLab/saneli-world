import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendOrderConfirmation } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutCompleted(session);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const meta = session.metadata ?? {};
  const rawItems: { productId: string; productName: string; category?: string | string[]; size: string | null; quantity: number; price: number }[] =
    JSON.parse(meta.items ?? '[]');
  const discountCode = meta.discount_code || null;
  const discountPercent = parseInt(meta.discount_percent ?? '0', 10);

  const subtotal = rawItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountAmount = discountPercent > 0
    ? parseFloat(((subtotal * discountPercent) / 100).toFixed(2))
    : 0;
  const total = session.amount_total ? session.amount_total / 100 : subtotal - discountAmount;

  const shippingDetails = session.shipping_details;
  const shippingAddress = shippingDetails?.address
    ? {
        name: shippingDetails.name ?? '',
        line1: shippingDetails.address.line1 ?? '',
        line2: shippingDetails.address.line2 ?? '',
        city: shippingDetails.address.city ?? '',
        state: shippingDetails.address.state ?? '',
        postal_code: shippingDetails.address.postal_code ?? '',
        country: shippingDetails.address.country ?? '',
      }
    : null;

  // Create order
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      stripe_session_id: session.id,
      customer_email: session.customer_details?.email ?? '',
      customer_name: session.customer_details?.name ?? null,
      status: 'paid',
      subtotal,
      discount_amount: discountAmount,
      total,
      discount_code: discountCode,
      shipping_address: shippingAddress,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('Failed to create order:', orderError);
    return;
  }

  // Insert order items
  const orderItems = rawItems.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.productName,
    size: item.size,
    quantity: item.quantity,
    unit_price: item.price,
  }));

  await supabaseAdmin.from('order_items').insert(orderItems);

  // Decrement stock
  for (const item of rawItems) {
    if (item.size) {
      await supabaseAdmin.rpc('decrement_size_stock', {
        p_product_id: item.productId,
        p_size: item.size,
        p_qty: item.quantity,
      });
    } else {
      await supabaseAdmin
        .from('products')
        .update({ stock: supabaseAdmin.rpc('greatest', { a: 0, b: item.quantity }) })
        .eq('id', item.productId);
    }
  }

  // Increment discount code usage
  if (discountCode) {
    await supabaseAdmin.rpc('increment_discount_uses', { p_code: discountCode });
  }

  // Add subscription buyers to early access list
  const customerEmail = session.customer_details?.email;
  const hasSubscription = rawItems.some(item => {
    const cats = Array.isArray(item.category) ? item.category : [item.category ?? ''];
    return cats.includes('subscription');
  });
  if (hasSubscription && customerEmail) {
    const { data: existing } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, list_type')
      .eq('email', customerEmail)
      .maybeSingle();

    if (existing) {
      const newType = existing.list_type === 'newsletter' ? 'both' : 'early_access';
      await supabaseAdmin
        .from('newsletter_subscribers')
        .update({ list_type: newType, active: true })
        .eq('id', existing.id);
    } else {
      await supabaseAdmin
        .from('newsletter_subscribers')
        .insert({ email: customerEmail, list_type: 'early_access', active: true });
    }
  }

  // Send confirmation email
  if (session.customer_details?.email) {
    sendOrderConfirmation(session.customer_details.email, {
      orderId: order.id,
      items: rawItems.map(i => ({
        name: i.productName,
        size: i.size ?? undefined,
        quantity: i.quantity,
        price: i.price,
      })),
      total,
      discountCode: discountCode ?? undefined,
    }).catch(console.error);
  }
}
