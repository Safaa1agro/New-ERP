import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Retrieve all quotations with relation joins
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: rawQuotations, error } = await (supabase.from('quotations') as any)
      .select(`
        *,
        customers ( id, name, reg_number, country, destination_port, business_category ),
        quotation_items (
          id,
          quantity_cartons,
          unit_net_weight_kg,
          unit_gross_weight_kg,
          carton_cbm,
          min_temp_c,
          max_temp_c,
          unit_price_pkr,
          products ( id, name, export_trade_name, hs_code, category, storage_type )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: rawQuotations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create new quotation & quotation item from multi-tab form
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const {
      customerId,
      productId,
      incoterm = 'CIF',
      currency = 'USD',
      shippingMode = 'AIR_FREIGHT',
      paymentTerms = '100% Advance TT',
      totalUnits = 1,
      unitNetWeightKg = 0,
      unitGrossWeightKg = 0,
      cartonCbm = 0,
      minTempC = 0,
      maxTempC = 2,
      unitPricePkr = 0,
      spotFreightRateUsd = 0,
      insuranceCostPkr = 0,
      spotLocalChargesPkr = 0,
      otherCosts = 0,
      otherCostDetails = '',
      marginPercentage = 10,
      grandTotal = 0,
    } = body;

    // Generate unique Quotation Number (SAF-QUO-XXXX)
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const quotationNumber = `SAF-QUO-${randomCode}`;

    const totalVolumeCbm = Number((totalUnits * cartonCbm).toFixed(3));
    const totalGrossWeightKg = Number((totalUnits * unitGrossWeightKg).toFixed(2));

    // 1. Insert into quotations table
    const { data: newQuotation, error: qError } = await (supabase.from('quotations') as any)
      .insert([
        {
          quotation_number: quotationNumber,
          customer_id: customerId,
          incoterm,
          currency,
          shipping_mode: shippingMode,
          payment_terms: paymentTerms,
          spot_freight_rate_usd: spotFreightRateUsd,
          insurance_cost_pkr: insuranceCostPkr,
          spot_local_charges_pkr: spotLocalChargesPkr,
          other_costs: otherCosts,
          other_cost_details: otherCostDetails,
          margin_percentage: marginPercentage,
          total_volume_cbm: totalVolumeCbm,
          total_gross_weight_kg: totalGrossWeightKg,
          grand_total_currency: grandTotal,
          status: 'DRAFT',
        },
      ])
      .select()
      .single();

    if (qError) {
      return NextResponse.json({ error: qError.message }, { status: 400 });
    }

    // 2. Insert line item into quotation_items table
    if (productId) {
      const { error: itemError } = await (supabase.from('quotation_items') as any).insert([
        {
          quotation_id: newQuotation.id,
          product_id: productId,
          quantity_cartons: totalUnits,
          unit_net_weight_kg: unitNetWeightKg,
          unit_gross_weight_kg: unitGrossWeightKg,
          carton_cbm: cartonCbm,
          min_temp_c: minTempC,
          max_temp_c: maxTempC,
          unit_price_pkr: unitPricePkr,
        },
      ]);

      if (itemError) {
        return NextResponse.json({ error: itemError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, data: newQuotation }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}