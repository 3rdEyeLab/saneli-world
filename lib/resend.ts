import { Resend } from 'resend';

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendOrderConfirmation(
  to: string,
  orderData: {
    orderId: string;
    items: { name: string; size?: string; quantity: number; price: number }[];
    total: number;
    discountCode?: string;
  }
) {
  if (!resend) return; // gracefully skip if Resend not configured

  const itemRows = orderData.items
    .map(
      i =>
        `<tr><td>${i.name}${i.size ? ` / ${i.size}` : ''}</td><td>x${i.quantity}</td><td>$${(i.price * i.quantity).toFixed(2)}</td></tr>`
    )
    .join('');

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'orders@saneli.world',
    to,
    subject: 'SANELi — Order Confirmed',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:40px;">
        <h1 style="font-size:28px;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;">SANELi</h1>
        <p style="color:#666;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-bottom:32px;">Brooklyn, NY</p>
        <h2 style="font-size:16px;text-transform:uppercase;letter-spacing:2px;">Order Confirmed</h2>
        <p style="color:#666;font-size:13px;">Order #${orderData.orderId.slice(0, 8).toUpperCase()}</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px;">
          <thead>
            <tr style="border-bottom:1px solid #eee;">
              <th style="text-align:left;padding:8px 0;text-transform:uppercase;letter-spacing:1px;font-size:11px;">Item</th>
              <th style="text-align:left;padding:8px 0;text-transform:uppercase;letter-spacing:1px;font-size:11px;">Qty</th>
              <th style="text-align:left;padding:8px 0;text-transform:uppercase;letter-spacing:1px;font-size:11px;">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        ${orderData.discountCode ? `<p style="font-size:13px;color:#C9A84C;">Discount applied: ${orderData.discountCode}</p>` : ''}
        <p style="font-size:16px;font-weight:bold;border-top:1px solid #eee;padding-top:16px;">Total: $${orderData.total.toFixed(2)}</p>
        <p style="color:#999;font-size:12px;margin-top:32px;">We'll send tracking info once your order ships. Questions? Reply to this email.</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string, listType: string) {
  if (!resend) return;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'hello@saneli.world',
    to,
    subject:
      listType === 'early_access'
        ? 'SANELi — Early Access Confirmed'
        : 'SANELi — You\'re on the list',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d0d0d;padding:40px;color:#fff;">
        <h1 style="font-size:28px;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;">SANELi</h1>
        <p style="color:#C9A84C;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-bottom:32px;">Brooklyn, NY</p>
        <h2 style="font-size:18px;text-transform:uppercase;letter-spacing:2px;margin-bottom:16px;">
          ${listType === 'early_access' ? 'Early Access Confirmed' : "You're on the list"}
        </h2>
        <p style="color:#aaa;font-size:14px;line-height:1.7;">
          ${listType === 'early_access'
            ? "You'll be first to hear unreleased music and exclusive drops before anyone else."
            : "Stay tuned for new merch drops, music releases, and exclusive deals."}
        </p>
        <p style="color:#666;font-size:12px;margin-top:40px;">SANELi World — Brooklyn, NY</p>
      </div>
    `,
  });
}
