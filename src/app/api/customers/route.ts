import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateCustomerInput } from '@/types/customer.types';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: customers, error } = await supabase
      .from('customers')
      .select('*, customer_contacts(*)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(customers, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body: CreateCustomerInput = await request.json();

    if (!body.company_name || !body.customer_code) {
      return NextResponse.json(
        { error: 'company_name and customer_code are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('customers')
      .insert(body as any)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create customer' },
      { status: 500 }
    );
  }
}
