import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables in .env.local');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Strips system/primary key fields before child table writes
function sanitizeChildData(data: Record<string, any> | undefined) {
  if (!data) return null;
  const { id, created_at, updated_at, product_id, ...cleanData } = data;
  return cleanData;
}

// ----------------------------------------------------------------------
// GET: Fetch products (supports ?id=, ?category=, ?search=)
// ----------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabase
      .from('products')
      .select(`
        *,
        cold_chain:product_cold_chain_specs(*),
        packaging:product_packaging_configs(*),
        pricing:product_pricing_tiers(*)
      `);

    if (id) {
      query = query.eq('id', id);
    } else {
      query = query.order('created_at', { ascending: false });

      if (category && category !== 'ALL') {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(
          `name.ilike.%${search}%,sku.ilike.%${search}%,hs_code.ilike.%${search}%,trade_name.ilike.%${search}%`
        );
      }
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('Supabase GET Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const formattedProducts = (products || []).map((p: any) => ({
      ...p,
      cold_chain: Array.isArray(p.cold_chain) ? p.cold_chain[0] || null : p.cold_chain,
      packaging: Array.isArray(p.packaging) ? p.packaging[0] || null : p.packaging,
      pricing: Array.isArray(p.pricing) ? p.pricing[0] || null : p.pricing,
    }));

    // Return single product object if queried by ID directly
    if (id) {
      const singleProduct = formattedProducts[0] || null;
      if (!singleProduct) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(
        { product: singleProduct },
        {
          status: 200,
          headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
        }
      );
    }

    return NextResponse.json(
      { products: formattedProducts },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server Error' }, { status: 500 });
  }
}

// ----------------------------------------------------------------------
// POST: Create new product record and child specs
// ----------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await req.json();

    // 1. Insert Core Product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        sku: body.sku,
        name: body.name || body.trade_name,
        scientific_name: body.scientific_name || null,
        trade_name: body.trade_name,
        hs_code: body.hs_code,
        category: body.category,
        base_uom: body.base_uom,
        description: body.description || null,
        origin_region: body.origin_region,
        status: body.status || 'ACTIVE',
        compliance_status: body.compliance_status || 'PENDING_COMPLIANCE',
      })
      .select()
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: `Core Product Error: ${productError?.message}` },
        { status: 400 }
      );
    }

    // 2. Insert Cold Chain Specs (Rollback if fails)
    if (body.cold_chain) {
      const cleanCold = sanitizeChildData(body.cold_chain);
      const { error } = await supabase
        .from('product_cold_chain_specs')
        .insert({ product_id: product.id, ...cleanCold });

      if (error) {
        await supabase.from('products').delete().eq('id', product.id);
        return NextResponse.json({ error: `Cold Chain Error: ${error.message}` }, { status: 400 });
      }
    }

    // 3. Insert Packaging Configs (Rollback if fails)
    if (body.packaging) {
      const cleanPack = sanitizeChildData(body.packaging);
      const { error } = await supabase
        .from('product_packaging_configs')
        .insert({ product_id: product.id, ...cleanPack });

      if (error) {
        await supabase.from('products').delete().eq('id', product.id);
        return NextResponse.json({ error: `Packaging Error: ${error.message}` }, { status: 400 });
      }
    }

    // 4. Insert Pricing Tiers (Rollback if fails)
    if (body.pricing) {
      const cleanPrice = sanitizeChildData(body.pricing);
      const { error } = await supabase
        .from('product_pricing_tiers')
        .insert({ product_id: product.id, ...cleanPrice });

      if (error) {
        await supabase.from('products').delete().eq('id', product.id);
        return NextResponse.json({ error: `Pricing Error: ${error.message}` }, { status: 400 });
      }
    }

    revalidatePath('/products');
    return NextResponse.json({ message: 'Product created successfully', product }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// ----------------------------------------------------------------------
// PUT: Update existing product record and child specifications
// ----------------------------------------------------------------------
export async function PUT(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await req.json();
    const { id, cold_chain, packaging, pricing, ...productData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required for updates' }, { status: 400 });
    }

    // 1. Update Core Product
    const { data: product, error: productError } = await supabase
      .from('products')
      .update({
        sku: productData.sku,
        name: productData.name || productData.trade_name,
        scientific_name: productData.scientific_name || null,
        trade_name: productData.trade_name,
        hs_code: productData.hs_code,
        category: productData.category,
        base_uom: productData.base_uom,
        description: productData.description || null,
        origin_region: productData.origin_region,
        status: productData.status || 'ACTIVE',
        compliance_status: productData.compliance_status || 'PENDING_COMPLIANCE',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (productError || !product) {
      return NextResponse.json(
        { error: productError?.message || 'Product record not found or update blocked by RLS' },
        { status: 400 }
      );
    }

    // 2. Upsert Cold Chain Specs
    if (cold_chain) {
      const cleanCold = sanitizeChildData(cold_chain);
      const { error } = await supabase
        .from('product_cold_chain_specs')
        .upsert({ product_id: id, ...cleanCold }, { onConflict: 'product_id' });

      if (error) return NextResponse.json({ error: `Cold Chain Upsert Error: ${error.message}` }, { status: 400 });
    }

    // 3. Upsert Packaging Configs
    if (packaging) {
      const cleanPack = sanitizeChildData(packaging);
      const { error } = await supabase
        .from('product_packaging_configs')
        .upsert({ product_id: id, ...cleanPack }, { onConflict: 'product_id' });

      if (error) return NextResponse.json({ error: `Packaging Upsert Error: ${error.message}` }, { status: 400 });
    }

    // 4. Upsert Pricing Tiers
    if (pricing) {
      const cleanPrice = sanitizeChildData(pricing);
      const { error } = await supabase
        .from('product_pricing_tiers')
        .upsert({ product_id: id, ...cleanPrice }, { onConflict: 'product_id' });

      if (error) return NextResponse.json({ error: `Pricing Upsert Error: ${error.message}` }, { status: 400 });
    }

    revalidatePath('/products');
    revalidatePath(`/products/${id}`);

    return NextResponse.json({ message: 'Product updated successfully', product }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// ----------------------------------------------------------------------
// DELETE: Remove product record
// ----------------------------------------------------------------------
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    revalidatePath('/products');
    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
