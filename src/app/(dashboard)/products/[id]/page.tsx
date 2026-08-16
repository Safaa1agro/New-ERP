'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Package, 
  Thermometer, 
  Truck, 
  DollarSign, 
  ShieldCheck, 
  Printer, 
  Box, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Info
} from 'lucide-react';

interface KYPPageProps {
  params: any;
}

export default function ProductKYPPage({ params }: KYPPageProps) {
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        setLoading(true);

        const resolvedParams = await Promise.resolve(params);
        const productId = resolvedParams?.id;

        if (!productId) {
          throw new Error('Invalid product ID in URL path.');
        }

        let foundProduct = null;

        // Strategy 1: Dynamic route `/api/products/[id]`
        let res = await fetch(`/api/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          foundProduct = data.product || data;
        }

        // Strategy 2: Query param route `/api/products?id=[id]`
        if (!foundProduct || !foundProduct.id) {
          res = await fetch(`/api/products?id=${productId}`);
          if (res.ok) {
            const data = await res.json();
            foundProduct = data.product || data;
          }
        }

        // Strategy 3: Catalog list fallback
        if (!foundProduct || !foundProduct.id) {
          res = await fetch('/api/products');
          if (res.ok) {
            const data = await res.json();
            const list = data.products || (Array.isArray(data) ? data : []);
            foundProduct = list.find((p: any) => String(p.id) === String(productId));
          }
        }

        if (!foundProduct || !foundProduct.id) {
          throw new Error('Product specification record not found in database.');
        }

        setProduct(foundProduct);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching KYP details:', err);
        setError(err.message || 'Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    }

    fetchProductDetails();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-mono tracking-wider">LOADING KYP PASSPORT DATA...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center justify-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold">KYP Record Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'Unable to retrieve complete product specs.'}</p>
        <Link 
          href="/products" 
          className="mt-4 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-slate-800 transition"
        >
          Back to Product Master
        </Link>
      </div>
    );
  }

  // Multi-tier Fallback Extractors for Nested or Flat API Schemas
  const rawPackaging = 
    (Array.isArray(product.packaging_configs) ? product.packaging_configs[0] : product.packaging_configs) ||
    (Array.isArray(product.product_packaging_configs) ? product.product_packaging_configs[0] : product.product_packaging_configs) ||
    (Array.isArray(product.packaging) ? product.packaging[0] : product.packaging) ||
    product;

  const packaging = {
    config_name: rawPackaging?.config_name || rawPackaging?.configuration_name || product?.config_name || product?.configuration_name || '',
    net_weight_kg: rawPackaging?.net_weight_kg ?? rawPackaging?.net_weight ?? product?.net_weight_kg ?? product?.net_weight ?? null,
    gross_weight_kg: rawPackaging?.gross_weight_kg ?? rawPackaging?.gross_weight ?? product?.gross_weight_kg ?? product?.gross_weight ?? null,
    box_length_cm: rawPackaging?.box_length_cm ?? rawPackaging?.box_length ?? rawPackaging?.length_cm ?? product?.box_length_cm ?? product?.box_length ?? null,
    box_width_cm: rawPackaging?.box_width_cm ?? rawPackaging?.box_width ?? rawPackaging?.width_cm ?? product?.box_width_cm ?? product?.box_width ?? null,
    box_height_cm: rawPackaging?.box_height_cm ?? rawPackaging?.box_height ?? rawPackaging?.height_cm ?? product?.box_height_cm ?? product?.box_height ?? null,
    boxes_per_pallet: rawPackaging?.boxes_per_pallet ?? product?.boxes_per_pallet ?? null,
    pallets_per_20ft_reefer: rawPackaging?.pallets_per_20ft_reefer ?? rawPackaging?.pallets_per_20ft ?? rawPackaging?.pallets_20ft ?? product?.pallets_per_20ft_reefer ?? product?.pallets_20ft ?? null,
    pallets_per_40ft_reefer: rawPackaging?.pallets_per_40ft_reefer ?? rawPackaging?.pallets_per_40ft ?? rawPackaging?.pallets_40ft ?? product?.pallets_per_40ft_reefer ?? product?.pallets_40ft ?? null,
    air_cargo_payload_tons: rawPackaging?.air_cargo_payload_tons ?? rawPackaging?.air_batch_weight ?? rawPackaging?.air_cargo_payload ?? product?.air_cargo_payload_tons ?? product?.air_batch_weight ?? null,
  };

  const rawColdChain = 
    (Array.isArray(product.cold_chain_specs) ? product.cold_chain_specs[0] : product.cold_chain_specs) ||
    (Array.isArray(product.product_cold_chain_specs) ? product.product_cold_chain_specs[0] : product.product_cold_chain_specs) ||
    (Array.isArray(product.cold_chain) ? product.cold_chain[0] : product.cold_chain) ||
    product;

  const coldChain = {
    storage_type: rawColdChain?.storage_type || product?.storage_type || 'CHILLED',
    optimal_temp_c: rawColdChain?.optimal_temp_c ?? rawColdChain?.optimal_temp ?? product?.optimal_temp_c ?? product?.optimal_temp ?? null,
    min_temp_c: rawColdChain?.min_temp_c ?? product?.min_temp_c ?? null,
    max_temp_c: rawColdChain?.max_temp_c ?? product?.max_temp_c ?? null,
    min_humidity_pct: rawColdChain?.min_humidity_pct ?? product?.min_humidity_pct ?? null,
    max_humidity_pct: rawColdChain?.max_humidity_pct ?? product?.max_humidity_pct ?? null,
    ventilation_cbm_hr: rawColdChain?.ventilation_cbm_hr ?? product?.ventilation_cbm_hr ?? null,
    ethylene_sensitivity: rawColdChain?.ethylene_sensitivity || product?.ethylene_sensitivity || 'LOW',
    shelf_life_days: rawColdChain?.shelf_life_days ?? product?.shelf_life_days ?? null,
    reefer_precooling_required: rawColdChain?.reefer_precooling_required ?? product?.reefer_precooling_required ?? true,
  };

  const rawPricing = 
    (Array.isArray(product.pricing_tiers) ? product.pricing_tiers[0] : product.pricing_tiers) ||
    (Array.isArray(product.product_pricing_tiers) ? product.product_pricing_tiers[0] : product.product_pricing_tiers) ||
    (Array.isArray(product.pricing) ? product.pricing[0] : product.pricing) ||
    product;

  const pricing = {
    price_per_uom: rawPricing?.price_per_uom ?? rawPricing?.price ?? product?.price_per_uom ?? product?.price ?? 0,
    currency: rawPricing?.currency || product?.currency || 'USD',
    incoterm: rawPricing?.incoterm || product?.incoterm || 'CIF',
    destination_port: rawPricing?.destination_port || product?.destination_port || 'JEBEL_ALI',
    min_order_qty: rawPricing?.min_order_qty ?? product?.min_order_qty ?? 1,
    seasonal_surcharge_pct: rawPricing?.seasonal_surcharge_pct ?? product?.seasonal_surcharge_pct ?? 0,
    valid_from: rawPricing?.valid_from || product?.valid_from || null,
    valid_to: rawPricing?.valid_to || product?.valid_to || null,
  };

  const isCompliant = [
    'COMPLIANCE_READY', 'READY', 'CLEARED', 'COMPLIANCE_CLEARED', 'APPROVED', 'COMPLIANT'
  ].includes(product.compliance_status);

  // Robust Numeric Parsing for Freight Capacity
  const boxesPerPalletNum = Number(packaging.boxes_per_pallet) || 0;
  const pallets20ftNum = Number(packaging.pallets_per_20ft_reefer) || 0;
  const pallets40ftNum = Number(packaging.pallets_per_40ft_reefer) || 0;
  const netWeightNum = Number(packaging.net_weight_kg) || 0;

  const boxes20ft = boxesPerPalletNum * pallets20ftNum;
  const boxes40ft = boxesPerPalletNum * pallets40ftNum;
  const netTons20ft = ((boxes20ft * netWeightNum) / 1000).toFixed(2);
  const netTons40ft = ((boxes40ft * netWeightNum) / 1000).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      
      {/* Top Navigation & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link 
            href="/products" 
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-100 hover:border-slate-700 transition"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                SKU: {product.sku || 'N/A'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                HS Code: {product.hs_code || 'N/A'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-1 flex items-center gap-2">
              {product.trade_name || product.name}
              <span className="text-xs font-normal text-slate-400 italic">({product.scientific_name || product.name})</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-medium rounded-lg text-slate-300 transition"
          >
            <Printer className="w-4 h-4 text-slate-400" /> Print KYP Sheet
          </button>
        </div>
      </div>

      {/* Hero Quick Badge Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-semibold text-slate-400">Trade Compliance</p>
            <p className="text-sm font-bold mt-1">
              {isCompliant ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Compliance Ready
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Pending Compliance
                </span>
              )}
            </p>
          </div>
          <ShieldCheck className={`w-8 h-8 ${isCompliant ? 'text-emerald-400/30' : 'text-amber-400/30'}`} />
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-semibold text-slate-400">Thermal Regime</p>
            <p className="text-sm font-bold text-cyan-400 mt-1">
              {coldChain.optimal_temp_c != null ? `${coldChain.optimal_temp_c}°C` : coldChain.storage_type}
            </p>
            <p className="text-[10px] text-slate-500">Shelf Life: {coldChain.shelf_life_days ?? 'N/A'} Days</p>
          </div>
          <Thermometer className="w-8 h-8 text-cyan-400/30" />
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-semibold text-slate-400">Baseline Pricing</p>
            <p className="text-sm font-bold text-emerald-400 mt-1">
              {pricing.currency} ${pricing.price_per_uom} / {product.base_uom || 'CARTON'}
            </p>
            <p className="text-[10px] text-slate-500">{pricing.incoterm} - {pricing.destination_port}</p>
          </div>
          <DollarSign className="w-8 h-8 text-emerald-400/30" />
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-semibold text-slate-400">40ft Reefer Capacity</p>
            <p className="text-sm font-bold text-blue-400 mt-1">
              {boxes40ft > 0 ? `${boxes40ft} Boxes` : 'Standard Bulk'}
            </p>
            <p className="text-[10px] text-slate-500">Payload: approx. {netTons40ft} Net Tons</p>
          </div>
          <Truck className="w-8 h-8 text-blue-400/30" />
        </div>

      </div>

      {/* Detailed Technical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. General & Classification Specifications */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Package className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">1. Master Product & WebOC Specs</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Unique SKU Identifier</span>
              <span className="font-mono text-emerald-400 font-semibold">{product.sku || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">WebOC HS Code</span>
              <span className="font-mono text-slate-200 font-semibold">{product.hs_code || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Trade Name</span>
              <span className="text-slate-200 font-semibold">{product.trade_name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Scientific Botanical Name</span>
              <span className="text-slate-300 italic">{product.scientific_name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Export Category</span>
              <span className="text-slate-200 font-semibold">{product.category?.replace('_', ' ') || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Base UOM</span>
              <span className="text-slate-200 font-semibold">{product.base_uom || 'CARTON'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Origin Region</span>
              <span className="text-slate-200 font-semibold">{product.origin_region || 'Punjab, Pakistan'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Catalog Operational Status</span>
              <span className="text-slate-200 font-semibold">{product.status || 'ACTIVE'}</span>
            </div>
          </div>

          {product.description && (
            <div className="pt-2 border-t border-slate-800/60 text-xs">
              <span className="text-slate-500 block mb-1">Product Description / Quality Specs:</span>
              <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* 2. Cold Chain & Thermal Management Specs */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Thermometer className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">2. Thermal & Cold Chain Profile</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Storage Classification</span>
              <span className="text-cyan-400 font-semibold">{coldChain.storage_type}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Optimal Set Temperature</span>
              <span className="text-slate-100 font-semibold">{coldChain.optimal_temp_c != null ? `${coldChain.optimal_temp_c}°C` : 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Allowed Temperature Range</span>
              <span className="text-slate-200 font-semibold">
                {coldChain.min_temp_c != null && coldChain.max_temp_c != null 
                  ? `${coldChain.min_temp_c}°C to ${coldChain.max_temp_c}°C` 
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Relative Humidity Range</span>
              <span className="text-slate-200 font-semibold">
                {coldChain.min_humidity_pct != null ? `${coldChain.min_humidity_pct}% - ${coldChain.max_humidity_pct}%` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Reefer Air Ventilation</span>
              <span className="text-slate-200 font-semibold">{coldChain.ventilation_cbm_hr ? `${coldChain.ventilation_cbm_hr} CBM/hr` : 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Ethylene Sensitivity</span>
              <span className="text-slate-200 font-semibold">{coldChain.ethylene_sensitivity}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Guaranteed Shelf Life</span>
              <span className="text-slate-200 font-semibold">{coldChain.shelf_life_days ? `${coldChain.shelf_life_days} Days` : 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Reefer Pre-Cooling Required</span>
              <span className="text-slate-200 font-semibold">{coldChain.reefer_precooling_required ? 'Yes (Mandatory)' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* 3. Freight Capacity & Packaging Configuration */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-blue-400" />
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">3. Freight Capacity & Packaging</h2>
            </div>
            <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-mono">
              {packaging.config_name || 'Standard Export Packaging'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Net Box Weight</span>
              <span className="text-slate-100 font-semibold">{packaging.net_weight_kg != null ? `${packaging.net_weight_kg} kg` : 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Gross Box Weight</span>
              <span className="text-slate-100 font-semibold">{packaging.gross_weight_kg != null ? `${packaging.gross_weight_kg} kg` : 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Box Dimensions (L x W x H)</span>
              <span className="text-slate-200 font-semibold">
                {packaging.box_length_cm != null ? `${packaging.box_length_cm} x ${packaging.box_width_cm} x ${packaging.box_height_cm} cm` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Boxes per Industrial Pallet</span>
              <span className="text-slate-200 font-semibold">{packaging.boxes_per_pallet ?? 'N/A'}</span>
            </div>
          </div>

          {/* Container Load Multipliers Table */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Reefer Container & Air Load Stacking Matrix</span>
            <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">20ft Reefer Container:</span>
                <span className="font-semibold text-slate-200">
                  {pallets20ftNum} Pallets ({boxes20ft} Boxes ~ {netTons20ft} Net Tons)
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">40ft High Cube Reefer:</span>
                <span className="font-semibold text-slate-200">
                  {pallets40ftNum} Pallets ({boxes40ft} Boxes ~ {netTons40ft} Net Tons)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Air Cargo Payload Capacity:</span>
                <span className="font-semibold text-slate-200">
                  {packaging.air_cargo_payload_tons != null ? `${packaging.air_cargo_payload_tons} Tons` : 'Loose Air Freight'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Baseline Pricing & Financial Structure */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">4. Baseline Export Pricing & Terms</h2>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
              {pricing.currency} Commercial Terms
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Baseline Price per UOM</span>
              <span className="text-lg font-bold text-emerald-400">
                {pricing.currency} ${pricing.price_per_uom}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Default Incoterm</span>
              <span className="text-slate-100 font-semibold">{pricing.incoterm}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Destination Port</span>
              <span className="text-slate-200 font-semibold">{pricing.destination_port}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Minimum Order Quantity (MOQ)</span>
              <span className="text-slate-200 font-semibold">{pricing.min_order_qty} {product.base_uom || 'CARTON'}s</span>
            </div>
            <div>
              <span className="text-slate-500 block">Seasonal Surcharge</span>
              <span className="text-slate-200 font-semibold">{pricing.seasonal_surcharge_pct}%</span>
            </div>
            <div>
              <span className="text-slate-500 block">Pricing Validity Window</span>
              <span className="text-slate-200 font-semibold">
                {pricing.valid_from ? `${pricing.valid_from} to ${pricing.valid_to}` : 'Active Rate Card'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <p className="flex items-center gap-1.5 font-medium text-slate-300 mb-1">
              <Info className="w-3.5 h-3.5 text-emerald-400" /> Dynamic Pricing Note
            </p>
            Base pricing is structured on {pricing.incoterm} terms for foreign trade. Surcharges apply during off-peak season supply fluctuations.
          </div>
        </div>

      </div>

      {/* Footer Audit Stamp */}
      <div className="text-center pt-4 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
        SAFAA AGRO FARMS (PVT.) LTD. — ENTERPRISE RESOURCE PLANNING SYSTEM v1.0 — KYP DIGITAL PASSPORT
      </div>

    </div>
  );
}