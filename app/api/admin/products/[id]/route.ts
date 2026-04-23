import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, product_sizes(size, stock)')
    .eq('id', params.id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name, description, price, category, image_url, badge, active, stock, sizes } = body;

  const { error } = await supabaseAdmin
    .from('products')
    .update({
      name, description, price, category,
      image_url: image_url ?? '',
      badge: badge || null,
      active: active ?? true,
      stock: stock ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Replace sizes
  if (category === 'tshirt' && Array.isArray(sizes)) {
    await supabaseAdmin.from('product_sizes').delete().eq('product_id', params.id);
    if (sizes.length > 0) {
      const sizeRows = sizes.map((s: { size: string; stock: number }) => ({
        product_id: params.id,
        size: s.size,
        stock: s.stock ?? 0,
      }));
      await supabaseAdmin.from('product_sizes').insert(sizeRows);
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await supabaseAdmin
    .from('products')
    .update({ active: false })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
