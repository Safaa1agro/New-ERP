'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  RefreshCw, 
  UserCheck, 
  Package, 
  ThermometerSnowflake, 
  Boxes, 
  DollarSign,
  Search,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export interface CustomerData {
  id: string;
  name?: string;
  company_name?: string;
  reg_number?: string;
  customer_code?: string;
  country?: string;
  destination_port?: string;
  business_category?: string;
  business_type?: string;
  payment_terms?: string;
}

export interface ProductData {
  id: string;
  name?: string;
  product_name?: string;
  export_trade_name?: string;
  hs_code?: string;
  weboc_hs_code?: string;
  sku_code?: string;
  category?: string;
  export_category?: string;
  origin_region?: string;

  // Cold Chain Specs
  storage_classification?: string;
  storage_type?: string;
  optimal_set_temp?: string | number;
  optimal_storage_temp?: string | number;
  optimal_temp_c?: string | number;
  optimal_temp?: string | number;
  allowed_temp_range?: string;
  min_temp?: string | number;
  min_temp_c?: string | number;
  min_temperature?: string | number;
  max_temp?: string | number;
  max_temp_c?: string | number;
  max_temperature?: string | number;
  guaranteed_shelf_life?: number | string;
  shelf_life_days?: number | string;
  shelf_life?: number | string;

  // Packaging & Weights
  packaging_name?: string;
  configuration_name?: string;
  packaging_config_name?: string;
  config_name?: string;
  base_uom?: string;
  uom?: string;
  
  net_box_weight?: number;
  net_weight_kg?: number;
  unit_net_weight_kg?: number;
  net_weight?: number;
  
  gross_box_weight?: number;
  gross_weight_kg?: number;
  unit_gross_weight_kg?: number;
  gross_weight?: number;

  box_length_cm?: number;
  box_width_cm?: number;
  box_height_cm?: number;
  
  cbm_per_unit?: number;
  unit_cbm?: number;

  price_per_uom?: number;
  base_price?: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customers?: CustomerData[];
  products?: ProductData[];
  initialData?: any;
  onSave?: (data: any) => Promise<void> | void;
}

const getInitialFormState = () => {
  const today = new Date().toISOString().split('T')[0];
  const expiry = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return {
    // Tab 1: Dates & Customer
    quotationNumber: '',
    quotationDate: today,
    validUntilDate: expiry,
    customerId: '',
    customerName: '',
    registrationNumber: '',
    primaryCountry: '',
    destinationPort: '',
    businessCategory: '',
    paymentTerms: '100% Advance TT',

    // Tab 2: Product
    productId: '',
    productName: '',
    hsCode: '',
    productCategory: '',
    originRegion: '',

    // Tab 3: Thermal Specs
    storageType: '',
    optimalTempC: '',
    shelfLifeDays: '',

    // Tab 4: Packing
    configurationName: '',
    cargoType: 'AIR' as 'AIR' | 'SEA',
    unitOfMeasure: 'Carton',
    netWeightKg: 0,
    grossWeightKg: 0,
    cbmPerUnit: 0,
    totalUnits: 0,

    // Tab 5: Pricing
    productPrice: 0,
    currency: 'USD',
    incoterm: 'CIF',
    freightCost: 0,
    insuranceCost: 0,
    customCost: 0,
    otherCosts: 0,
    otherCostDetails: '',
    targetMarginPct: 10,
  };
};

export default function QuotationFormModal({
  isOpen,
  onClose,
  customers: initialCustomers = [],
  products: initialProducts = [],
  initialData,
  onSave,
}: Props) {
  const supabase = createClient();
  const hasLoadedRef = useRef(false);

  const [activeTab, setActiveTab] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loadingData, setLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [customerOptions, setCustomerOptions] = useState<CustomerData[]>(initialCustomers);
  const [productOptions, setProductOptions] = useState<ProductData[]>(initialProducts);

  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  const [formData, setFormData] = useState(getInitialFormState());

  const generateQuotationNumber = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `SAF-QUO-${randomNum}`;
  };

  useEffect(() => {
    if (!isOpen) {
      hasLoadedRef.current = false;
      setErrorMessage(null);
      return;
    }

    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      setErrorMessage(null);

      if (initialData) {
        setFormData({
          ...getInitialFormState(),
          ...initialData,
        });
        if (initialData.customerName) setCustomerSearch(initialData.customerName);
        if (initialData.productName) setProductSearch(initialData.productName);
      } else {
        setFormData({
          ...getInitialFormState(),
          quotationNumber: generateQuotationNumber(),
        });
        setCustomerSearch('');
        setProductSearch('');
      }

      async function loadDataFallback() {
        setLoadingData(true);
        try {
          let custs = initialCustomers;
          let prods = initialProducts;

          if (!custs || custs.length === 0) {
            const { data } = await supabase.from('customers').select('*');
            if (data) custs = data;
          }

          if (!prods || prods.length === 0) {
            const { data } = await supabase.from('products').select('*');
            if (data) prods = data;
          }

          setCustomerOptions(custs || []);
          setProductOptions(prods || []);
        } catch (err) {
          console.error('Error loading dropdown options:', err);
        } finally {
          setLoadingData(false);
        }
      }

      loadDataFallback();
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleCancel = () => {
    setErrorMessage(null);
    if (initialData) {
      setFormData({ ...getInitialFormState(), ...initialData });
      setCustomerSearch(initialData.customerName || '');
      setProductSearch(initialData.productName || '');
    } else {
      setFormData(getInitialFormState());
      setCustomerSearch('');
      setProductSearch('');
    }
    onClose();
  };

  const getCustomerDisplayName = (c: CustomerData) => 
    c.company_name || c.name || c.customer_code || 'Unknown Customer';

  const getProductDisplayName = (p: ProductData) => 
    p.export_trade_name || p.product_name || p.name || 'Unknown Product';

  const filteredCustomers = customerOptions
    .filter((c) => {
      const name = getCustomerDisplayName(c).toLowerCase();
      const code = (c.customer_code || c.reg_number || '').toLowerCase();
      const term = customerSearch.toLowerCase();
      return name.includes(term) || code.includes(term);
    })
    .slice(0, 15);

  const filteredProducts = productOptions
    .filter((p) => {
      const name = getProductDisplayName(p).toLowerCase();
      const hs = (p.hs_code || p.weboc_hs_code || p.sku_code || '').toLowerCase();
      const term = productSearch.toLowerCase();
      return name.includes(term) || hs.includes(term);
    })
    .slice(0, 15);

  const handleSelectCustomer = (cust: CustomerData) => {
    const displayName = getCustomerDisplayName(cust);
    setFormData((prev) => ({
      ...prev,
      customerId: cust.id,
      customerName: displayName,
      registrationNumber: cust.reg_number || cust.customer_code || '',
      primaryCountry: cust.country || '',
      destinationPort: cust.destination_port || '',
      businessCategory: cust.business_category || cust.business_type || '',
      paymentTerms: cust.payment_terms || prev.paymentTerms
    }));
    setCustomerSearch(displayName);
    setIsCustomerDropdownOpen(false);
  };

  const handleSelectProduct = async (prod: ProductData) => {
    const displayName = getProductDisplayName(prod);
    
    const baseStorage = prod.storage_classification || prod.storage_type || 'CHILLED';
    const baseOptTemp = prod.optimal_set_temp ?? prod.optimal_storage_temp ?? prod.optimal_temp_c ?? prod.optimal_temp;
    const baseTempDisplay = baseOptTemp ? `${baseOptTemp}°C` : (prod.allowed_temp_range || '2.0°C to 4.0°C');
    const baseShelf = prod.guaranteed_shelf_life ?? prod.shelf_life_days ?? prod.shelf_life ?? '21';
    const baseConfig = prod.packaging_name || prod.configuration_name || prod.config_name || 'Export Master Carton';
    const baseNet = prod.net_box_weight ?? prod.net_weight_kg ?? prod.unit_net_weight_kg ?? prod.net_weight ?? 10;
    const baseGross = prod.gross_box_weight ?? prod.gross_weight_kg ?? prod.unit_gross_weight_kg ?? prod.gross_weight ?? 10.8;
    const baseCbm = prod.cbm_per_unit ?? prod.unit_cbm ?? 0.036;

    setFormData((prev) => ({
      ...prev,
      productId: prod.id,
      productName: displayName,
      hsCode: prod.hs_code || prod.weboc_hs_code || prod.sku_code || '',
      productCategory: prod.export_category || prod.category || 'Agro Meat',
      originRegion: prod.origin_region || 'Punjab, Pakistan',

      storageType: String(baseStorage).toUpperCase(),
      optimalTempC: String(baseTempDisplay),
      shelfLifeDays: String(baseShelf),

      configurationName: String(baseConfig),
      unitOfMeasure: prod.base_uom || prod.uom || 'Carton',
      netWeightKg: Number(baseNet),
      grossWeightKg: Number(baseGross),
      cbmPerUnit: Number(baseCbm),

      productPrice: Number(prod.price_per_uom ?? prod.base_price ?? 0),
    }));

    setProductSearch(displayName);
    setIsProductDropdownOpen(false);

    try {
      const [thermalRes, pkgRes] = await Promise.allSettled([
        supabase.from('product_thermal_profiles').select('*').eq('product_id', prod.id).maybeSingle(),
        supabase.from('product_packaging_specs').select('*').eq('product_id', prod.id).maybeSingle()
      ]);

      let thermalData: any = thermalRes.status === 'fulfilled' ? thermalRes.value.data : null;
      let pkgData: any = pkgRes.status === 'fulfilled' ? pkgRes.value.data : null;

      if (thermalData || pkgData) {
        setFormData((prev) => {
          const updatedStorage = thermalData?.storage_classification || thermalData?.storage_type || prev.storageType;
          
          let updatedTemp = prev.optimalTempC;
          if (thermalData?.optimal_set_temp !== undefined && thermalData?.optimal_set_temp !== null) {
            updatedTemp = `${thermalData.optimal_set_temp}°C`;
            if (thermalData.min_temp !== undefined && thermalData.max_temp !== undefined) {
              updatedTemp += ` (Range: ${thermalData.min_temp}°C to ${thermalData.max_temp}°C)`;
            }
          } else if (thermalData?.allowed_temp_range) {
            updatedTemp = thermalData.allowed_temp_range;
          }

          const updatedShelf = thermalData?.guaranteed_shelf_life ?? thermalData?.shelf_life_days ?? prev.shelfLifeDays;
          const updatedConfig = pkgData?.config_name || pkgData?.packaging_name || prev.configurationName;
          const updatedNet = pkgData?.net_weight_kg ?? prev.netWeightKg;
          const updatedGross = pkgData?.gross_weight_kg ?? prev.grossWeightKg;
          
          let updatedCbm = pkgData?.cbm_per_unit ?? prev.cbmPerUnit;
          if ((!updatedCbm || updatedCbm === 0) && pkgData?.box_length_cm && pkgData?.box_width_cm && pkgData?.box_height_cm) {
            updatedCbm = Number(((pkgData.box_length_cm * pkgData.box_width_cm * pkgData.box_height_cm) / 1000000).toFixed(4));
          }

          return {
            ...prev,
            storageType: String(updatedStorage).toUpperCase(),
            optimalTempC: String(updatedTemp),
            shelfLifeDays: String(updatedShelf),
            configurationName: String(updatedConfig),
            netWeightKg: Number(updatedNet),
            grossWeightKg: Number(updatedGross),
            cbmPerUnit: Number(updatedCbm),
          };
        });
      }
    } catch (e) {
      console.warn('Error fetching relational specs:', e);
    }
  };

  const calculatedTotalCbm = Number((formData.totalUnits * formData.cbmPerUnit).toFixed(3));
  const calculatedTotalGrossWeight = formData.totalUnits * formData.grossWeightKg;

  const incotermUpper = formData.incoterm.toUpperCase();
  const isFreightEnabled = ['CFR', 'CIF', 'DDP', 'DAP', 'CPT', 'CIP'].includes(incotermUpper);
  const isInsuranceEnabled = ['CIF', 'CIP', 'DDP'].includes(incotermUpper);

  const baseProductTotal = formData.totalUnits * formData.productPrice;
  const activeFreight = isFreightEnabled ? Number(formData.freightCost) : 0;
  const activeInsurance = isInsuranceEnabled ? Number(formData.insuranceCost) : 0;
  const directCostsSum = baseProductTotal + activeFreight + activeInsurance + Number(formData.customCost) + Number(formData.otherCosts);
  const marginAmount = (directCostsSum * Number(formData.targetMarginPct)) / 100;
  const grandTotal = directCostsSum + marginAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSaving(true);

    try {
      if (onSave) {
        await onSave({ ...formData, totalCbm: calculatedTotalCbm, grandTotal });
      }
      onClose();
    } catch (err: any) {
      console.error('Save failed:', err);
      setErrorMessage(err?.message || 'Error saving quotation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#0b0f17] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialData ? 'Edit Commercial Quotation' : 'Commercial Export Quotation Engine'}
              </h2>
              <p className="text-xs text-slate-400">Configure multi-modal spot calculations, cold-chain specifications, and pricing.</p>
            </div>
          </div>
          <button onClick={handleCancel} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="bg-[#0f172a] border-b border-slate-800 px-6 pt-3 flex gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 1, label: '1. Customer & Dates', icon: UserCheck },
            { id: 2, label: '2. Product Selection', icon: Package },
            { id: 3, label: '3. Temp Specs', icon: ThermometerSnowflake },
            { id: 4, label: '4. Packing & Cargo', icon: Boxes },
            { id: 5, label: '5. Pricing & Total', icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-400 bg-[#131b2e] text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Error Alert Box (Persists form state on error) */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: CUSTOMER SELECTION & DATES */}
          {activeTab === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">1. Quotation Number *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.quotationNumber}
                    onChange={(e) => setFormData({ ...formData, quotationNumber: e.target.value })}
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-emerald-400 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, quotationNumber: generateQuotationNumber() }))}
                    title="Auto Generate New Number"
                    className="px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 flex items-center justify-center transition"
                  >
                    <RefreshCw className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-xs font-semibold text-slate-300">2. Customer Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customerSearch}
                    onFocus={() => setIsCustomerDropdownOpen(true)}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setIsCustomerDropdownOpen(true);
                    }}
                    placeholder="Search customer name or code..."
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                  {loadingData ? (
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin absolute right-3 top-2.5" />
                  ) : (
                    <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                  )}
                </div>
                {isCustomerDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-[#0b0f17] border border-slate-800 rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-800/50">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((cust) => (
                        <div
                          key={cust.id}
                          onClick={() => handleSelectCustomer(cust)}
                          className="p-2.5 hover:bg-slate-800 cursor-pointer text-xs flex justify-between items-center text-slate-200"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{getCustomerDisplayName(cust)}</span>
                            {cust.customer_code && (
                              <span className="text-[10px] font-mono text-emerald-400">{cust.customer_code}</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{cust.country}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-slate-500 text-center">
                        {loadingData ? 'Fetching records...' : 'No matching customers found'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* DATE FIELDS */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" /> 3. Quotation Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.quotationDate || ''}
                  onChange={(e) => setFormData({ ...formData, quotationDate: e.target.value })}
                  className="w-full bg-[#0b0f17] border border-slate-700 text-slate-200 rounded-lg px-3.5 py-2 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> 4. Valid Until / Expiry Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.validUntilDate || ''}
                  onChange={(e) => setFormData({ ...formData, validUntilDate: e.target.value })}
                  className="w-full bg-[#0b0f17] border border-slate-700 text-slate-200 rounded-lg px-3.5 py-2 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">5. Registration Number</label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  placeholder="e.g. CR-88392"
                  className="w-full bg-[#0b0f17] border border-slate-700 text-slate-200 rounded-lg px-3.5 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">6. Primary Country</label>
                <input
                  type="text"
                  value={formData.primaryCountry}
                  onChange={(e) => setFormData({ ...formData, primaryCountry: e.target.value })}
                  placeholder="e.g. Saudi Arabia"
                  className="w-full bg-[#0b0f17] border border-slate-700 text-slate-200 rounded-lg px-3.5 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">7. Destination Port</label>
                <input
                  type="text"
                  value={formData.destinationPort}
                  onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                  placeholder="e.g. Jeddah Islamic Port"
                  className="w-full bg-[#0b0f17] border border-slate-700 text-slate-200 rounded-lg px-3.5 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">8. Business Category</label>
                <input
                  type="text"
                  value={formData.businessCategory}
                  onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                  placeholder="e.g. Wholesale Importer"
                  className="w-full bg-[#0b0f17] border border-slate-700 text-slate-200 rounded-lg px-3.5 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-300">9. Export Payment Terms *</label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="100% Advance TT">100% Advance Telegraphic Transfer (TT)</option>
                  <option value="LC at sight">Irrevocable LC at Sight</option>
                  <option value="LC 30 Days">LC 30 Days from BL Date</option>
                  <option value="LC 60 Days">LC 60 Days from BL Date</option>
                  <option value="LC 90 Days">LC 90 Days from BL Date</option>
                  <option value="Documents against Payment">Documents against Payment (DP)</option>
                  <option value="CAD (Cash Against Documents)">CAD (Cash Against Documents)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT SELECTION */}
          {activeTab === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2 relative">
                <label className="text-xs font-semibold text-slate-300">1. Product Trade Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={productSearch}
                    onFocus={() => setIsProductDropdownOpen(true)}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setIsProductDropdownOpen(true);
                    }}
                    placeholder="Search product master by trade name or SKU..."
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                  {loadingData ? (
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin absolute right-3 top-2.5" />
                  ) : (
                    <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                  )}
                </div>
                {isProductDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-[#0b0f17] border border-slate-800 rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-800/50">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => handleSelectProduct(prod)}
                          className="p-2.5 hover:bg-slate-800 cursor-pointer text-xs flex justify-between items-center text-slate-200"
                        >
                          <span className="font-medium">{getProductDisplayName(prod)}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {prod.hs_code || prod.weboc_hs_code ? `HS: ${prod.hs_code || prod.weboc_hs_code}` : prod.sku_code || ''}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-slate-500 text-center">
                        {loadingData ? 'Fetching products...' : 'No matching products found'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">2. Pakistan WebOC HS Code</label>
                <input
                  type="text"
                  value={formData.hsCode}
                  onChange={(e) => setFormData({ ...formData, hsCode: e.target.value })}
                  placeholder="e.g. 0201.3000"
                  className="w-full bg-[#0b0f17] border border-slate-700 text-slate-200 rounded-lg px-3.5 py-2 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">3. Product Category</label>
                <input
                  type="text"
                  value={formData.productCategory}
                  onChange={(e) => setFormData({ ...formData, productCategory: e.target.value })}
                  placeholder="e.g. Fresh Chilled Meat"
                  className="w-full bg-[#0b0f17] border border-slate-700 text-slate-200 rounded-lg px-3.5 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-300">4. Origin Region</label>
                <input
                  type="text"
                  value={formData.originRegion}
                  onChange={(e) => setFormData({ ...formData, originRegion: e.target.value })}
                  placeholder="e.g. Punjab, Pakistan"
                  className="w-full bg-[#0b0f17] border border-slate-700 text-slate-200 rounded-lg px-3.5 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: TEMPERATURE SPECIFICATIONS */}
          {activeTab === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">1. Cold-Chain Storage Type</label>
                <input
                  type="text"
                  value={formData.storageType}
                  onChange={(e) => setFormData({ ...formData, storageType: e.target.value })}
                  placeholder="e.g. CHILLED, FROZEN, AMBIENT"
                  className="w-full bg-[#0b0f17] border border-slate-700 text-emerald-400 font-semibold rounded-lg px-3.5 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">2. Optimal Storage Temp (°C)</label>
                <input
                  type="text"
                  value={formData.optimalTempC}
                  onChange={(e) => setFormData({ ...formData, optimalTempC: e.target.value })}
                  placeholder="e.g. 0°C to 2°C"
                  className="w-full bg-[#0b0f17] border border-slate-700 text-slate-200 rounded-lg px-3.5 py-2 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">3. Export Shelf Life (Days)</label>
                <input
                  type="text"
                  value={formData.shelfLifeDays}
                  onChange={(e) => setFormData({ ...formData, shelfLifeDays: e.target.value })}
                  placeholder="e.g. 21"
                  className="w-full bg-[#0b0f17] border border-slate-700 text-slate-200 rounded-lg px-3.5 py-2 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <p className="text-xs text-emerald-300">
                  Auto-filled from Master Database. You may customize these temperature values for this specific quotation.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: PACKING & CARGO */}
          {activeTab === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-300">1. Packing Configuration Name</label>
                <input
                  type="text"
                  value={formData.configurationName}
                  onChange={(e) => setFormData({ ...formData, configurationName: e.target.value })}
                  placeholder="e.g. 10kg Export Master Carton"
                  className="w-full bg-[#0b0f17] border border-slate-700 text-slate-200 rounded-lg px-3.5 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-300">2. Cargo Transport Mode *</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, cargoType: 'AIR' })}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      formData.cargoType === 'AIR'
                        ? 'bg-sky-500/10 border-sky-400 text-sky-400'
                        : 'bg-[#0b0f17] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Air Cargo Shipping
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, cargoType: 'SEA' })}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      formData.cargoType === 'SEA'
                        ? 'bg-indigo-500/10 border-indigo-400 text-indigo-400'
                        : 'bg-[#0b0f17] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Sea Reefer Cargo
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">3. Base Unit of Measure</label>
                <input
                  type="text"
                  value={formData.unitOfMeasure}
                  onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                  placeholder="e.g. Carton, Bag, TON"
                  className="w-full bg-[#0b0f17] border border-slate-700 text-slate-200 rounded-lg px-3.5 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">4. Unit Net Weight (KG)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.netWeightKg}
                  onChange={(e) => setFormData({ ...formData, netWeightKg: Number(e.target.value) })}
                  className="w-full bg-[#0b0f17] border border-slate-700 text-slate-200 rounded-lg px-3.5 py-2 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">5. Unit Gross Weight (KG)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.grossWeightKg}
                  onChange={(e) => setFormData({ ...formData, grossWeightKg: Number(e.target.value) })}
                  className="w-full bg-[#0b0f17] border border-slate-700 text-slate-200 rounded-lg px-3.5 py-2 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">6. CBM Per Unit (Editable) *</label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.cbmPerUnit}
                  onChange={(e) => setFormData({ ...formData, cbmPerUnit: Number(e.target.value) })}
                  className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-emerald-400 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">7. Total Units Order Quantity *</label>
                <input
                  type="number"
                  value={formData.totalUnits}
                  onChange={(e) => setFormData({ ...formData, totalUnits: Number(e.target.value) })}
                  placeholder="e.g., 1000 Cartons"
                  className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-emerald-400 font-bold font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">8. Total Calculated CBM & Gross Weight</label>
                <input
                  type="text"
                  readOnly
                  value={`${calculatedTotalCbm} CBM (${calculatedTotalGrossWeight.toLocaleString()} kg)`}
                  className="w-full bg-slate-800/50 border border-slate-700 text-emerald-400 font-bold font-mono rounded-lg px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 5: PRICING & TOTAL */}
          {activeTab === 5 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">1. Product Price Per Unit</label>
                <input
                  type="number"
                  value={formData.productPrice}
                  onChange={(e) => setFormData({ ...formData, productPrice: Number(e.target.value) })}
                  className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">2. Currency *</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="PKR">PKR (Rs)</option>
                  <option value="AED">AED (Dh)</option>
                  <option value="SAR">SAR (SR)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">3. Incoterm *</label>
                <select
                  value={formData.incoterm}
                  onChange={(e) => setFormData({ ...formData, incoterm: e.target.value })}
                  className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none font-bold text-emerald-400"
                >
                  <option value="FOB">FOB - Free On Board</option>
                  <option value="CIF">CIF - Cost Insurance & Freight</option>
                  <option value="CFR">CFR - Cost & Freight</option>
                  <option value="EXW">EXW - Ex Works</option>
                  <option value="DDP">DDP - Delivered Duty Paid</option>
                  <option value="DAP">DAP - Delivered At Place</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  4. Freight Cost
                  {!isFreightEnabled && <span className="text-[10px] text-amber-400 font-normal">(Blocked by Incoterm)</span>}
                </label>
                <input
                  type="number"
                  disabled={!isFreightEnabled}
                  value={formData.freightCost}
                  onChange={(e) => setFormData({ ...formData, freightCost: Number(e.target.value) })}
                  className={`w-full border rounded-lg px-3.5 py-2 text-xs font-mono focus:outline-none ${
                    isFreightEnabled
                      ? 'bg-[#0b0f17] border-slate-700 text-slate-100 focus:border-emerald-500'
                      : 'bg-[#0b0f17]/40 border-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  5. Insurance Cost
                  {!isInsuranceEnabled && <span className="text-[10px] text-amber-400 font-normal">(Blocked by Incoterm)</span>}
                </label>
                <input
                  type="number"
                  disabled={!isInsuranceEnabled}
                  value={formData.insuranceCost}
                  onChange={(e) => setFormData({ ...formData, insuranceCost: Number(e.target.value) })}
                  className={`w-full border rounded-lg px-3.5 py-2 text-xs font-mono focus:outline-none ${
                    isInsuranceEnabled
                      ? 'bg-[#0b0f17] border-slate-700 text-slate-100 focus:border-emerald-500'
                      : 'bg-[#0b0f17]/40 border-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">6. Customs Clearance Cost</label>
                <input
                  type="number"
                  value={formData.customCost}
                  onChange={(e) => setFormData({ ...formData, customCost: Number(e.target.value) })}
                  className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">7. Other Costs (Inspection/Phyto)</label>
                <input
                  type="number"
                  value={formData.otherCosts}
                  onChange={(e) => setFormData({ ...formData, otherCosts: Number(e.target.value) })}
                  className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">8. Target Profit Margin %</label>
                <input
                  type="number"
                  value={formData.targetMarginPct}
                  onChange={(e) => setFormData({ ...formData, targetMarginPct: Number(e.target.value) })}
                  className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-emerald-400 font-bold font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-300">9. Other Cost Details</label>
                <input
                  type="text"
                  value={formData.otherCostDetails}
                  onChange={(e) => setFormData({ ...formData, otherCostDetails: e.target.value })}
                  placeholder="e.g., Phytosanitary Certificate & Terminal Handling Charges"
                  className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2 bg-[#0b0f17] p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    10. Calculated Grand Total Value
                  </span>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                    {formData.currency} ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  Includes Base Cost + Freight + Insurance + Customs + {formData.targetMarginPct}% Profit Margin
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition disabled:opacity-50"
            >
              Cancel & Exit
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/10 flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {initialData ? 'Update Quotation' : 'Save Quotation'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}