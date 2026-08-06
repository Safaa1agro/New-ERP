import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supplier_id = searchParams.get('supplier_id');

    let query = supabase
      .from('supplier_quality_tickets')
      .select('*, suppliers(company_name, company_or_farm_name)')
      .order('created_at', { ascending: false });

    if (supplier_id) query = query.eq('supplier_id', supplier_id);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ticket_code = `SUP-CMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const { data, error } = await supabase
      .from('supplier_quality_tickets')
      .insert([{ ...body, ticket_code }])
      .select();

    if (error) throw error;
    return NextResponse.json(data ? data[0] : body, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, supplier_id, issue_type, batch_po_no, claim_value, description, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    // Build update object with only defined fields
    const updatePayload: Record<string, any> = {};
    if (supplier_id !== undefined) updatePayload.supplier_id = supplier_id;
    if (issue_type !== undefined) updatePayload.issue_type = issue_type;
    if (batch_po_no !== undefined) updatePayload.batch_po_no = batch_po_no;
    if (claim_value !== undefined) updatePayload.claim_value = claim_value;
    if (description !== undefined) updatePayload.description = description;
    if (status !== undefined) updatePayload.status = status;

    const { data, error } = await supabase
      .from('supplier_quality_tickets')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data ? data[0] : body);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('supplier_quality_tickets')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}