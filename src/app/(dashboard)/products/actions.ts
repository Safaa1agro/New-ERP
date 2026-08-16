'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { ProductMasterFormValues, productMasterSchema } from '@/types/product';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables in .env.local');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}

function sanitizeChildData(data: Record<string, any> | undefined) {
  if (!data) return null;
  const { id, created_at, updated_at, product_id, ...cleanData } = data;
  return cleanData;
}

export async function createProductAction(formData: ProductMasterFormValues) {
  try {
    const validated = productMasterSchema.parse(formData);
    const supabase = getSupabaseClient();

    // 1. Insert Core Product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        sku: validated.sku,
        name: validated.name,
        trade_name: validated.trade_name,
        scientific_name: validated.scientific_name || null,
        hs_code: validated.hs_code,
        category: validated.category,
        base_uom: validated.base_uom,
        description: validated.description || null,
        origin_region: validated.origin_region,
        is_active: validated.is_active ?? true,
        status: validated.status ?? 'ACTIVE',
        compliance_status: validated.compliance_status ?? 'PENDING_COMPLIANCE',
      })
      .select()
      .maybeSingle();

    if (productError || !product) {
      return {
        success: false,
        error: productError?.message || 'Failed to insert product record into Supabase',
      };
    }

    // 2. Insert Cold Chain Specs
    if (validated.cold_chain) {
      const cleanColdChain = sanitizeChildData(validated.cold_chain);
      const { error: coldError } = await supabase
        .from('product_cold_chain_specs')
        .insert({ product_id: product.id, ...cleanColdChain });
      
      if (coldError) return { success: false, error: `Cold Chain Error: ${coldError.message}` };
    }

    // 3. Insert Packaging Configs
    if (validated.packaging) {
      const cleanPackaging = sanitizeChildData(validated.packaging);
      const { error: packError } = await supabase
        .from('product_packaging_configs')
        .insert({ product_id: product.id, ...cleanPackaging });
      
      if (packError) return { success: false, error: `Packaging Error: ${packError.message}` };
    }

    // 4. Insert Pricing Tiers
    if (validated.pricing) {
      const cleanPricing = sanitizeChildData(validated.pricing);
      const { error: priceError } = await supabase
        .from('product_pricing_tiers')
        .insert({ product_id: product.id, ...cleanPricing });
      
      if (priceError) return { success: false, error: `Pricing Error: ${priceError.message}` };
    }

    revalidatePath('/products');
    return { success: true, data: product };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Server action execution failed',
    };
  }
}

export async function updateProductAction(id: string, formData: ProductMasterFormValues) {
  try {
    if (!id) {
      return { success: false, error: 'Product ID is missing or undefined' };
    }

    const validated = productMasterSchema.parse(formData);
    const supabase = getSupabaseClient();

    // 1. Update Core Product
    const { data: product, error: productError } = await supabase
      .from('products')
      .update({
        sku: validated.sku,
        name: validated.name,
        trade_name: validated.trade_name,
        scientific_name: validated.scientific_name || null,
        hs_code: validated.hs_code,
        category: validated.category,
        base_uom: validated.base_uom,
        description: validated.description || null,
        origin_region: validated.origin_region,
        is_active: validated.is_active ?? true,
        status: validated.status ?? 'ACTIVE',
        compliance_status: validated.compliance_status ?? 'PENDING_COMPLIANCE',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (productError) {
      return { success: false, error: productError.message };
    }

    if (!product) {
      return {
        success: false,
        error: `Supabase updated 0 rows for ID "${id}". Check SQL RLS policies.`,
      };
    }

    // 2. Upsert Cold Chain Specs
    if (validated.cold_chain) {
      const cleanCold = sanitizeChildData(validated.cold_chain);
      const { error: coldError } = await supabase
        .from('product_cold_chain_specs')
        .upsert(
          { product_id: id, ...cleanCold },
          { onConflict: 'product_id' }
        );
      if (coldError) return { success: false, error: `Cold Chain Update Error: ${coldError.message}` };
    }

    // 3. Upsert Packaging Configs
    if (validated.packaging) {
      const cleanPack = sanitizeChildData(validated.packaging);
      const { error: packError } = await supabase
        .from('product_packaging_configs')
        .upsert(
          { product_id: id, ...cleanPack },
          { onConflict: 'product_id' }
        );
      if (packError) return { success: false, error: `Packaging Update Error: ${packError.message}` };
    }

    // 4. Upsert Pricing Tiers
    if (validated.pricing) {
      const cleanPrice = sanitizeChildData(validated.pricing);
      const { error: priceError } = await supabase
        .from('product_pricing_tiers')
        .upsert(
          { product_id: id, ...cleanPrice },
          { onConflict: 'product_id' }
        );
      if (priceError) return { success: false, error: `Pricing Update Error: ${priceError.message}` };
    }

    // Explicitly revalidate both list and specific KYP detail page
    revalidatePath('/products');
    revalidatePath(`/products/${id}`);

    return { success: true, data: product };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Server action execution failed',
    };
  }
}