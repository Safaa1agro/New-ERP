'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productMasterSchema, ProductMasterFormValues } from '@/types/product';
import { createProductAction, updateProductAction } from '@/app/(dashboard)/products/actions';
import { 
  PlusCircle, 
  Edit3,
  Thermometer, 
  Package, 
  DollarSign, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Plane,
  Ship
} from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: any) => void;
  productToEdit?: (ProductMasterFormValues & { id?: string }) | null;
}

// Dynamically extracts 3-letter prefix from any product name
function extractCommodityPrefix(text: string): string {
  if (!text || !text.trim()) return 'PRD';

  // Clean special characters and numbers
  const clean = text.trim().toUpperCase().replace(/[^A-Z]/g, '');
  if (clean.length === 0) return 'PRD';

  // Takes first 3 letters (pads with 'X' if shorter than 3 letters)
  return clean.substring(0, 3).padEnd(3, 'X');
}

// Generates SKU in format SAF-PRO-[3-LETTER-PREFIX]-[4-DIGIT-NUMBER]
function generateSku(productName: string): string {
  const prefix = extractCommodityPrefix(productName);
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `SAF-PRO-${prefix}-${randomDigits}`;
}

export function ProductFormModal({ isOpen, onClose, onSuccess, productToEdit }: ProductFormModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'coldchain' | 'packaging' | 'pricing'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEditMode = Boolean(productToEdit && productToEdit.id);

  const defaultFormValues: ProductMasterFormValues = {
    sku: 'SAF-PRO-PRD-' + Math.floor(1000 + Math.random() * 9000),
    name: '',
    trade_name: '',
    scientific_name: '',
    hs_code: '',
    description: '',
    is_active: true,
    status: 'ACTIVE',
    compliance_status: 'PENDING_COMPLIANCE',
    category: 'FRESH_FRUIT',
    base_uom: 'CARTON',
    origin_region: 'Punjab, Pakistan',
    cold_chain: {
      storage_type: 'CHILLED',
      min_temp_c: 2.0,
      max_temp_c: 5.0,
      optimal_temp_c: 3.5,
      min_humidity_pct: 85,
      max_humidity_pct: 90,
      ventilation_cbm_hr: 20,
      ethylene_sensitivity: 'LOW',
      shelf_life_days: 30,
      reefer_precooling_required: true,
    },
    packaging: {
      config_name: '10kg Export Master Carton',
      gross_weight_kg: 10.8,
      net_weight_kg: 10.0,
      tare_weight_kg: 0.8,
      box_length_cm: 50,
      box_width_cm: 30,
      box_height_cm: 24,
      boxes_per_pallet: 80,
      pallets_per_20ft_reefer: 10,
      pallets_per_40ft_reefer: 20,
      air_cargo_payload_tons: 2.0,
    },
    pricing: {
      destination_port: 'JEBEL_ALI',
      incoterm: 'CIF',
      currency: 'USD',
      min_order_qty: 1,
      price_per_uom: 12.5,
      seasonal_surcharge_pct: 0,
      valid_from: new Date().toISOString().split('T')[0],
      valid_to: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    },
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductMasterFormValues>({
    resolver: zodResolver(productMasterSchema),
    defaultValues: defaultFormValues,
  });

  const productNameValue = watch('name');

const regenerateSku = () => {
  const generated = generateSku(productNameValue || '');
  setValue('sku', generated, { shouldValidate: true, shouldDirty: true });
};

  // Safe Deep-Merge Reset on Modal Open
  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        reset({
          ...defaultFormValues,
          ...productToEdit,
          cold_chain: {
            ...defaultFormValues.cold_chain,
            ...(productToEdit.cold_chain || {}),
          },
          packaging: {
            ...defaultFormValues.packaging,
            ...(productToEdit.packaging || {}),
          },
          pricing: {
            ...defaultFormValues.pricing,
            ...(productToEdit.pricing || {}),
          },
        });
      } else {
        reset({
          ...defaultFormValues,
          sku: generateSku('', ''),
        });
      }
      setActiveTab('general');
      setFormError(null);
    }
  }, [isOpen, productToEdit, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: ProductMasterFormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      let res;
      if (isEditMode && productToEdit?.id) {
        res = await updateProductAction(productToEdit.id, data);
      } else {
        res = await createProductAction(data);
      }

      if (res.success) {
        reset();
        onSuccess(res.data); // Returns real Supabase record to parent component
        onClose();
      } else {
        setFormError(res.error || 'Validation error');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Switch tab automatically to where validation failed
  const onInvalid = (errors: FieldErrors<ProductMasterFormValues>) => {
    setFormError('Please review and correct the highlighted fields.');
    if (errors.sku || errors.name || errors.trade_name || errors.hs_code || errors.category || errors.base_uom || errors.origin_region || errors.compliance_status || errors.status) {
      setActiveTab('general');
    } else if (errors.cold_chain) {
      setActiveTab('coldchain');
    } else if (errors.packaging) {
      setActiveTab('packaging');
    } else if (errors.pricing) {
      setActiveTab('pricing');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div>
            <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
              {isEditMode ? (
                <>
                  <Edit3 className="w-5 h-5 text-amber-400" /> Edit Product Master
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" /> Master Product Registration
                </>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Define export-compliant perishable produce, thermal profiles, reefer/airway limits & pricing.
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-emerald-500 bg-slate-800/60 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Info className="w-4 h-4" /> 1. General & Compliance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('coldchain')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'coldchain'
                ? 'border-emerald-500 bg-slate-800/60 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Thermometer className="w-4 h-4" /> 2. Cold Chain Specs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('packaging')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'packaging'
                ? 'border-emerald-500 bg-slate-800/60 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Package className="w-4 h-4" /> 3. Packaging & Multi-Modal Freight
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'border-emerald-500 bg-slate-800/60 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <DollarSign className="w-4 h-4" /> 4. Export Pricing Tiers
          </button>
        </div>

        {/* Form Body */}
        <form 
          onSubmit={handleSubmit(onSubmit, onInvalid)} 
          autoComplete="off" 
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
            </div>
          )}

         {/* TAB 1: GENERAL INFO */}
{activeTab === 'general' && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">SKU Code *</label>
      <div className="flex gap-2">
        <input
          {...register('sku')}
          autoComplete="off"
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100 font-mono"
        />
        <button
          type="button"
          onClick={regenerateSku}
          title="Regenerate SKU Code"
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center justify-center transition border border-slate-700 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
      {errors.sku && <p className="text-rose-400 text-[10px] mt-1">{errors.sku.message}</p>}
      <p className="text-[10px] text-slate-500 mt-1">Auto-generated format: SAF-PRO-[PREFIX]-[NUMBER]</p>
    </div>

    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">Export Trade Name *</label>
      <input
        {...register('trade_name')}
        autoComplete="off"
        placeholder="e.g. Fresh Red Onion / Chaunsa Mango"
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
      />
      {errors.trade_name && <p className="text-rose-400 text-[10px] mt-1">{errors.trade_name.message}</p>}
    </div>

    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">Product Name *</label>
      <input
        {...register('name')}
        autoComplete="off"
        placeholder="e.g. Onion, Tomato, Potato, Mango, Mutton, Beef"
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
      />
      {errors.name && <p className="text-rose-400 text-[10px] mt-1">{errors.name.message}</p>}
    </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Scientific Name</label>
                <input
                  {...register('scientific_name')}
                  autoComplete="off"
                  placeholder="e.g. Allium cepa"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Pakistan WebOC HS Code *</label>
                <input
                  {...register('hs_code')}
                  autoComplete="off"
                  placeholder="0703.10.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100 font-mono"
                />
                {errors.hs_code && <p className="text-rose-400 text-[10px] mt-1">{errors.hs_code.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Product Category *</label>
                <select
                  {...register('category')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
                >
                  <option value="FRESH_VEGETABLE">Fresh Vegetable</option>
                  <option value="FRESH_FRUIT">Fresh Fruit</option>
                  <option value="FRESH_MEAT">Fresh Chilled Meat</option>
                  <option value="FROZEN_MEAT">Frozen Meat</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Base Unit of Measure *</label>
                <select
                  {...register('base_uom')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
                >
                  <option value="CARTON">Carton / Box</option>
                  <option value="KG">Kilogram (KG)</option>
                  <option value="TON">Metric Ton</option>
                  <option value="CARCASS">Carcass</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Origin Region *</label>
                <input
                  {...register('origin_region')}
                  autoComplete="off"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-400 mb-1">Compliance Readiness *</label>
                <select
                  {...register('compliance_status')}
                  className="w-full bg-slate-950 border border-amber-500/30 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 text-amber-200 font-medium"
                >
                  <option value="PENDING_COMPLIANCE">Pending Compliance</option>
                  <option value="COMPLIANCE_READY">Compliance Ready</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-400 mb-1">Product Lifecycle Status *</label>
                <select
                  {...register('status')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100 font-medium"
                >
                  <option value="ACTIVE">Active (In-Season / Open)</option>
                  <option value="INACTIVE">Inactive (Off-Season)</option>
                  <option value="BLOCKED">Blocked (Restricted / Hold)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">Product Description</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  placeholder="Detail grading standards, size specs, and treatment parameters..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
                />
              </div>
            </div>
          )}

          {/* TAB 2: COLD CHAIN SPECS */}
          {activeTab === 'coldchain' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Storage Type *</label>
                <select
                  {...register('cold_chain.storage_type')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
                >
                  <option value="CHILLED">Chilled</option>
                  <option value="FROZEN">Frozen</option>
                  <option value="AMBIENT">Ambient</option>
                  <option value="CONTROLLED_ATMOSPHERE">Controlled Atmosphere</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Optimal Storage Temp (°C) *</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('cold_chain.optimal_temp_c', { valueAsNumber: true })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Shelf Life (Days) *</label>
                <input
                  type="number"
                  {...register('cold_chain.shelf_life_days', { valueAsNumber: true })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Min Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('cold_chain.min_temp_c', { valueAsNumber: true })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Max Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('cold_chain.max_temp_c', { valueAsNumber: true })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reefer Air Vent (CBM/hr)</label>
                <input
                  type="number"
                  {...register('cold_chain.ventilation_cbm_hr', { valueAsNumber: true })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Min Humidity (%)</label>
                <input
                  type="number"
                  {...register('cold_chain.min_humidity_pct', { valueAsNumber: true })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Max Humidity (%)</label>
                <input
                  type="number"
                  {...register('cold_chain.max_humidity_pct', { valueAsNumber: true })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Ethylene Sensitivity</label>
                <select
                  {...register('cold_chain.ethylene_sensitivity')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="reefer_precooling"
                  {...register('cold_chain.reefer_precooling_required')}
                  className="w-4 h-4 accent-emerald-500 rounded bg-slate-950 border-slate-800"
                />
                <label htmlFor="reefer_precooling" className="text-xs text-slate-300">
                  Reefer Pre-cooling Mandatory
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: PACKAGING & MULTI-MODAL FREIGHT */}
          {activeTab === 'packaging' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-emerald-400 mb-3 flex items-center gap-1.5">
                  <Package className="w-4 h-4" /> Physical Master Carton Packaging Unit
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Configuration Name *</label>
                    <input
                      {...register('packaging.config_name')}
                      placeholder="e.g. 10kg Export Master Corrugated Box"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Boxes per Pallet *</label>
                    <input
                      type="number"
                      {...register('packaging.boxes_per_pallet', { valueAsNumber: true })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Net Weight (KG) *</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('packaging.net_weight_kg', { valueAsNumber: true })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Gross Weight (KG) *</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('packaging.gross_weight_kg', { valueAsNumber: true })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Tare Weight (KG)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('packaging.tare_weight_kg', { valueAsNumber: true })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Box Dimensions (L x W x H cm)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Length (cm)"
                        {...register('packaging.box_length_cm', { valueAsNumber: true })}
                        className="w-1/3 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                      />
                      <input
                        type="number"
                        placeholder="Width (cm)"
                        {...register('packaging.box_width_cm', { valueAsNumber: true })}
                        className="w-1/3 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                      />
                      <input
                        type="number"
                        placeholder="Height (cm)"
                        {...register('packaging.box_height_cm', { valueAsNumber: true })}
                        className="w-1/3 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-sky-400 mb-1 flex items-center gap-1.5">
                  <Ship className="w-4 h-4 text-blue-400" /> <Plane className="w-4 h-4 text-sky-400" /> Export Freight Loading Capacities
                </h3>
                <p className="text-[11px] text-slate-400 mb-3">
                  Configure loading specifications for both Ocean Reefers and Air Freight consignments for this product.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-blue-500/20">
                    <label className="block text-xs font-semibold text-blue-400 mb-1 flex items-center gap-1">
                      <Ship className="w-3.5 h-3.5" /> 20ft Reefer Container
                    </label>
                    <p className="text-[10px] text-slate-500 mb-2">Standard capacity: ~10 Pallets (~10-12 Tons)</p>
                    <div className="space-y-1">
                      <label className="block text-[11px] text-slate-300">Pallets per 20ft Reefer</label>
                      <input
                        type="number"
                        {...register('packaging.pallets_per_20ft_reefer', { valueAsNumber: true })}
                        placeholder="10"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-blue-500/20">
                    <label className="block text-xs font-semibold text-blue-400 mb-1 flex items-center gap-1">
                      <Ship className="w-3.5 h-3.5" /> 40ft HC Reefer Container
                    </label>
                    <p className="text-[10px] text-slate-500 mb-2">Standard capacity: ~20 Pallets (~20-22 Tons)</p>
                    <div className="space-y-1">
                      <label className="block text-[11px] text-slate-300">Pallets per 40ft Reefer</label>
                      <input
                        type="number"
                        {...register('packaging.pallets_per_40ft_reefer', { valueAsNumber: true })}
                        placeholder="20"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-sky-500/20">
                    <label className="block text-xs font-semibold text-sky-400 mb-1 flex items-center gap-1">
                      <Plane className="w-3.5 h-3.5" /> Air Cargo Consignment
                    </label>
                    <p className="text-[10px] text-slate-500 mb-2">Airway batch payload capability (Tons)</p>
                    <div className="space-y-1">
                      <label className="block text-[11px] text-slate-300">Air Batch Weight (Tons)</label>
                      <input
                        type="number"
                        step="0.1"
                        {...register('packaging.air_cargo_payload_tons', { valueAsNumber: true })}
                        placeholder="e.g. 2.0 or 4.0"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

         {/* TAB 4: EXPORT PRICING */}
{activeTab === 'pricing' && (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">Destination Port / Airport *</label>
      <input
        {...register('pricing.destination_port')}
        placeholder="e.g. JEBEL_ALI, DXB, DAMMAM, JEDDAH"
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
      />
    </div>

    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">Incoterm *</label>
      <select
        {...register('pricing.incoterm')}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
      >
        <option value="CIF">CIF (Cost, Insurance, Freight)</option>
        <option value="CPT">CPT (Carriage Paid To - Air Freight)</option>
        <option value="FOB">FOB (Free on Board)</option>
        <option value="C_AND_F">C&F (Cost & Freight)</option>
        <option value="EXW">EXW (Ex Works)</option>
      </select>
    </div>

    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">Currency *</label>
      <select
        {...register('pricing.currency')}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
      >
        <option value="USD">USD ($)</option>
        <option value="AED">AED (Dh)</option>
        <option value="SAR">SAR (SR)</option>
        <option value="PKR">PKR (Rs)</option>
        <option value="EUR">EUR (€)</option>
      </select>
    </div>

    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">Price per UOM *</label>
      <input
        type="number"
        step="0.01"
        {...register('pricing.price_per_uom', { valueAsNumber: true })}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100 font-mono"
      />
    </div>

    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">Seasonal Surcharge (%)</label>
      <input
        type="number"
        step="0.1"
        {...register('pricing.seasonal_surcharge_pct', { valueAsNumber: true })}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
      />
    </div>

    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">Min Order Quantity</label>
      <input
        type="number"
        {...register('pricing.min_order_qty', { valueAsNumber: true })}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
      />
    </div>

    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">Price Valid From</label>
      <input
        type="date"
        {...register('pricing.valid_from')}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
      />
    </div>

    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">Price Valid To</label>
      <input
        type="date"
        {...register('pricing.valid_to')}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-100"
      />
    </div>
  </div>
)}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="text-[11px] text-slate-400">
              * All products are validated against Pakistan Federal Board of Revenue WebOC standards.
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 px-5 py-2 rounded-lg text-xs font-semibold transition shadow-lg shadow-emerald-500/20"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isEditMode ? 'Update Product Master' : 'Save Product Master'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}