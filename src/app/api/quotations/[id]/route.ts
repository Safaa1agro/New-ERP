import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface Params {
  params: Promise<{ id: string }>;
}

// GET: Fetch full KYQ details for a specific quotation ID
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: quotation, error } = await (supabase.from('quotations') as any)
      .select(`
        *,
        customers (
          id,
          name,
          reg_number,
          country,
          destination_port,
          business_category
        ),
        quotation_items (
          id,
          quantity_cartons,
          unit_net_weight_kg,
          unit_gross_weight_kg,
          carton_cbm,
          min_temp_c,
          max_temp_c,
          unit_price_pkr,
          products (
            id,
            name,
            export_trade_name,
            hs_code,
            category,
            origin_region,
            storage_type,
            shelf_life_days,
            configuration_name,
            base_uom
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: quotation });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Update quotation status or commercial values
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const updates = await req.json();

    const { data: updatedQuotation, error } = await (supabase.from('quotations') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: updatedQuotation });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Remove a quotation by ID
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Delete associated items first (if cascade is not set in DB)
    await (supabase.from('quotation_items') as any).delete().eq('quotation_id', id);

    const { error } = await (supabase.from('quotations') as any).delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Quotation deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}