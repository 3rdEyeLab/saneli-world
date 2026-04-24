import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, product_sizes(size, stock), product_colors(id, color_name, color_hex, stock), product_images(id, url, sort_order)')
    .eq('id', id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, description, price, category, image_url, badge, active, stock, sizes, colors, images } = body;

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
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (category === 'tshirt' && Array.isArray(sizes)) {
    await supabaseAdmin.from('product_sizes').delete().eq('product_id', id);
    if (sizes.length > 0) {
      await supabaseAdmin.from('product_sizes').insert(
        sizes.map((s: { size: string; stock: number }) => ({ product_id: id, size: s.size, stock: s.stock ?? 0 }))
      );
    }
  }

  if (Array.isArray(colors)) {
    await supabaseAdmin.from('product_colors').delete().eq('product_id', id);
    if (colors.length > 0) {
      await supabaseAdmin.from('product_colors').insert(
        colors.map((c: { color_name: string; color_hex: string; stock: number }) => ({
          product_id: id, color_name: c.color_name, color_hex: c.color_hex, stock: c.stock ?? 0,
        }))
      );
    }
  }

  if (Array.isArray(images)) {
    await supabaseAdmin.from('product_images').delete().eq('product_id', id);
    if (images.length > 0) {
      await supabaseAdmin.from('product_images').insert(
        images.map((img: { url: string; sort_order: number }) => ({
          product_id: id, url: img.url, sort_order: img.sort_order ?? 0,
        }))
      );
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabaseAdmin
    .from('products')
    .update({ active: false })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
