import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendWelcomeEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  const { email, listType = 'newsletter' } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const validTypes = ['newsletter', 'early_access', 'both'];
  if (!validTypes.includes(listType)) {
    return NextResponse.json({ error: 'Invalid list type' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .upsert(
      { email: email.toLowerCase().trim(), list_type: listType, active: true },
      { onConflict: 'email' }
    );

  if (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }

  // Fire-and-forget welcome email
  sendWelcomeEmail(email, listType).catch(console.error);

  return NextResponse.json({ success: true });
}
