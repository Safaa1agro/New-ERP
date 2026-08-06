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
      .from('supplier_requirements')
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
    const { data, error } = await supabase.from('supplier_requirements').insert([body]).select();
    if (error) throw error;
    return NextResponse.json(data ? data[0] : body, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const { data, error } = await supabase.from('supplier_requirements').update(updates).eq('id', id).select();
    if (error) throw error;
    return NextResponse.json(data ? data[0] : updates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}