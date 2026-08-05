import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Map human readable category to valid DB enum string format
function sanitizeSupplierType(cat: string) {
  if (!cat) return 'broker';
  const clean = cat.toLowerCase().trim().replace(/\s+/g, '_');
  return clean;
}

export async function GET() {
  try {
    const { data: suppliers, error: supplierError } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (supplierError) throw supplierError;

    let products: any[] = [];
    try {
      const { data: prodData } = await supabase.from('supplier_products').select('*');
      if (prodData) products = prodData;
    } catch (_) {}

    let pos: any[] = [];
    try {
      const { data: poData } = await supabase.from('purchase_orders').select('*');
      if (poData) pos = poData;
    } catch (_) {}

    const enrichedSuppliers = (suppliers || []).map((s) => {
      const vendorProducts = products.filter((p) => p.supplier_id === s.id);
      const vendorPOs = pos.filter((po) => po.supplier_id === s.id);

      return {
        ...s,
        rating: s.rating || 5.0,
        products_count: vendorProducts.length,
        cleared_products_count: vendorProducts.filter((p) => p.status === 'Cleared' || p.is_compliant).length,
        pending_products_count: vendorProducts.filter((p) => p.status !== 'Cleared' && !p.is_compliant).length,
        total_pos: vendorPOs.length,
        active_pos: vendorPOs.filter((po) => po.status === 'Active' || po.status === 'Issued').length,
        completed_pos: vendorPOs.filter((po) => po.status === 'Completed').length,
        canceled_pos: vendorPOs.filter((po) => po.status === 'Cancelled' || po.status === 'Rejected').length,
      };
    });

    return NextResponse.json(enrichedSuppliers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawCategory = body.category || 'Broker';
    const isCompliant = body.compliance_readiness === 'YES' || body.compliance_readiness === 'YES (Compliance Cleared)';

    const payload: any = {
      supplier_code: body.supplier_code,
      company_name: body.company_name,
      company_or_farm_name: body.company_name,
      category: rawCategory,
      status: body.status || 'Active',
      tax_id: body.tax_id || null,
      city_region: body.city_region_country || null,
      city_region_country: body.city_region_country || null,
      primary_contact_name: body.primary_contact_name || null,
      phone: body.phone || null,
      email: body.email || null,
      compliance_readiness: isCompliant ? 'YES' : 'NO',
      internal_compliance_ref: body.internal_compliance_ref || null,
      default_payment_terms: body.default_payment_terms || 'Accept All Contract',
      rating: 5.0,
      is_trade_ready: isCompliant,
      is_kyc_cleared: isCompliant,
    };

    // Try insert with raw category first, fallback to sanitized enum if schema enforces enum
    let { data, error } = await supabase.from('suppliers').insert([{ ...payload, supplier_type: rawCategory }]).select();

    if (error && error.message.includes('supplier_type_enum')) {
      const sanitized = sanitizeSupplierType(rawCategory);
      const retry = await supabase.from('suppliers').insert([{ ...payload, supplier_type: sanitized }]).select();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;
    return NextResponse.json(data ? data[0] : payload, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateFields } = body;

    if (!id) return NextResponse.json({ error: 'Missing supplier ID' }, { status: 400 });

    const rawCategory = updateFields.category || 'Broker';
    const isCompliant = updateFields.compliance_readiness === 'YES' || updateFields.compliance_readiness === 'YES (Compliance Cleared)';

    const payload: any = {
      company_name: updateFields.company_name,
      company_or_farm_name: updateFields.company_name,
      category: rawCategory,
      status: updateFields.status,
      tax_id: updateFields.tax_id || null,
      city_region: updateFields.city_region_country || null,
      city_region_country: updateFields.city_region_country || null,
      primary_contact_name: updateFields.primary_contact_name || null,
      phone: updateFields.phone || null,
      email: updateFields.email || null,
      compliance_readiness: isCompliant ? 'YES' : 'NO',
      internal_compliance_ref: updateFields.internal_compliance_ref || null,
      default_payment_terms: updateFields.default_payment_terms || 'Accept All Contract',
      is_trade_ready: isCompliant,
      is_kyc_cleared: isCompliant,
    };

    let { data, error } = await supabase
      .from('suppliers')
      .update({ ...payload, supplier_type: rawCategory })
      .eq('id', id)
      .select();

    if (error && error.message.includes('supplier_type_enum')) {
      const sanitized = sanitizeSupplierType(rawCategory);
      const retry = await supabase
        .from('suppliers')
        .update({ ...payload, supplier_type: sanitized })
        .eq('id', id)
        .select();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;
    return NextResponse.json(data ? data[0] : payload);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}