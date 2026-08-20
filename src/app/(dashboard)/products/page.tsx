'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { ProductFormModal } from '@/components/product/product-form';
import { 
  Plus, 
  Search, 
  Thermometer, 
  Package, 
  Layers, 
  Snowflake, 
  ShieldCheck,
  RefreshCw,
  Edit3,
  Trash2,
  FileCheck,
  PieChart,
  CheckCircle2,
  Clock
} from 'lucide-react';

// Helper functions to safely extract relation objects across API formats
const getColdChainSpec = (prod: any) => {
  if (!prod) return null;
  const raw = prod.cold_chain_specs ?? prod.cold_chain ?? prod.product_cold_chain_specs;
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] : raw;
};

const getPackagingConfig = (prod: any) => {
  if (!prod) return null;
  const raw = prod.packaging_configs ?? prod.packaging ?? prod.product_packaging_configs;
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] : raw;
};

const getPricingTier = (prod: any) => {
  if (!prod) return null;
  const raw = prod.pricing_tiers ?? prod.pricing ?? prod.product_pricing_tiers;
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] : raw;
};

// Unified compliance checker used across KPI metrics and table row status
const isProductCompliant = (p: any) => {
  if (!p) return false;
  const status = p.compliance_status;
  return (
    status === 'COMPLIANCE_READY' ||
    status === 'READY' ||
    status === 'CLEARED' ||
    status === 'COMPLIANCE_CLEARED' ||
    status === 'APPROVED' ||
    status === 'COMPLIANT'
  );
};

// Normalizes database / API response objects into the form state structure for editing
const formatProductForForm = (prod: any) => {
  const cc = getColdChainSpec(prod) || {};
  const pkg = getPackagingConfig(prod) || {};
  const prc = getPricingTier(prod) || {};

  return {
    id: prod.id,
    sku: prod.sku || '',
    name: prod.name || '',
    trade_name: prod.trade_name || '',
    scientific_name: prod.scientific_name || '',
    hs_code: prod.hs_code || '',
    category: prod.category || 'FRESH_FRUIT',
    base_uom: prod.base_uom || 'CARTON',
    origin_region: prod.origin_region || 'Punjab, Pakistan',
    is_active: prod.is_active ?? true,
    status: prod.status || 'ACTIVE',
    compliance_status: prod.compliance_status || 'PENDING_COMPLIANCE',
    description: prod.description || '',
    cold_chain: {
      storage_type: cc.storage_type || 'CHILLED',
      min_temp_c: cc.min_temp_c ?? 2.0,
      max_temp_c: cc.max_temp_c ?? 5.0,
      optimal_temp_c: cc.optimal_temp_c ?? 3.5,
      min_humidity_pct: cc.min_humidity_pct ?? 85,
      max_humidity_pct: cc.max_humidity_pct ?? 90,
      ventilation_cbm_hr: cc.ventilation_cbm_hr ?? 20,
      ethylene_sensitivity: cc.ethylene_sensitivity || 'LOW',
      shelf_life_days: cc.shelf_life_days ?? 30,
      reefer_precooling_required: cc.reefer_precooling_required ?? true,
    },
    packaging: {
      config_name: pkg.config_name || '10kg Export Master Carton',
      gross_weight_kg: pkg.gross_weight_kg ?? 10.8,
      net_weight_kg: pkg.net_weight_kg ?? 10.0,
      tare_weight_kg: pkg.tare_weight_kg ?? 0.8,
      box_length_cm: pkg.box_length_cm ?? 50,
      box_width_cm: pkg.box_width_cm ?? 30,
      box_height_cm: pkg.box_height_cm ?? 24,
      boxes_per_pallet: pkg.boxes_per_pallet ?? 80,
      pallets_per_20ft_reefer: pkg.pallets_per_20ft_reefer ?? 10,
      pallets_per_40ft_reefer: pkg.pallets_per_40ft_reefer ?? 20,
      air_cargo_payload_tons: pkg.air_cargo_payload_tons ?? 2.0,
    },
    pricing: {
      destination_port: prc.destination_port || 'JEBEL_ALI',
      incoterm: prc.incoterm || 'CIF',
      currency: prc.currency || 'USD',
      min_order_qty: prc.min_order_qty ?? 1,
      price_per_uom: prc.price_per_uom ?? 12.5,
      seasonal_surcharge_pct: prc.seasonal_surcharge_pct ?? 0,
      valid_from: prc.valid_from || new Date().toISOString().split('T')[0],
      valid_to: prc.valid_to || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    },
  };
};

export default function ProductMasterDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/products';
      const params = new URLSearchParams();
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch product catalog', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    const formatted = formatProductForForm(prod);
    setEditingProduct(formatted);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert('Failed to delete product.');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleKYPClick = (prod: Product) => {
    router.push(`/products/${prod.id}`);
};

  // --- KPI Card Metric Aggregations ---
  
  // Card 1: Catalog Status Counts
  const activeCount = products.filter((p) => p.status === 'ACTIVE' || (!p.status && p.is_active !== false)).length;
  const inactiveCount = products.filter((p) => p.status === 'INACTIVE').length;
  const blockedCount = products.filter((p) => p.status === 'BLOCKED').length;

  // Card 2: Thermal & Cold Chain Profile Breakdown (Mutually Exclusive Logic)
  const thermalStats = useMemo(() => {
    let chilled = 0;
    let frozen = 0;
    let ambientCa = 0;

    products.forEach((p) => {
      const spec = getColdChainSpec(p);
      const st = spec?.storage_type?.toUpperCase();

      if (st === 'FROZEN' || p.category === 'FROZEN_MEAT') {
        frozen++;
      } else if (st === 'AMBIENT' || st === 'CONTROLLED_ATMOSPHERE') {
        ambientCa++;
      } else if (st === 'CHILLED' || p.category === 'FRESH_FRUIT' || p.category === 'FRESH_VEGETABLE' || p.category === 'FRESH_MEAT') {
        chilled++;
      } else {
        ambientCa++;
      }
    });

    return { chilled, frozen, ambientCa };
  }, [products]);

  // Card 3: Categories Breakdown
  const fruitCount = products.filter((p) => p.category === 'FRESH_FRUIT').length;
  const vegCount = products.filter((p) => p.category === 'FRESH_VEGETABLE').length;
  const meatCount = products.filter((p) => p.category === 'FRESH_MEAT' || p.category === 'FROZEN_MEAT').length;
  const otherCatCount = products.filter((p) => !['FRESH_FRUIT', 'FRESH_VEGETABLE', 'FRESH_MEAT', 'FROZEN_MEAT'].includes(p.category)).length;

  // Card 4: Trade Readiness & Compliance Breakdown
  const complianceClearedCount = products.filter(isProductCompliant).length;
  const pendingComplianceCount = Math.max(0, products.length - complianceClearedCount);

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-100">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Package className="w-7 h-7 text-emerald-400" /> Master Product & Pricing Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Standardizing perishable exports, WebOC HS classifications, thermal profiles & multi-currency dynamic pricing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchProducts()}
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900 border border-slate-800 rounded-lg transition"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleCreateProduct}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-2.5 rounded-lg text-xs transition shadow-lg shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" /> Add Export Product
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Catalog Status */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">CATALOG STATUS</p>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <h3 className="text-2xl font-bold text-slate-100">{products.length} <span className="text-sm font-normal text-slate-400">Products</span></h3>
          </div>
          <div className="text-[11px] font-medium pt-2 border-t border-slate-800/80 flex items-center gap-2">
            <span className="text-emerald-400">Active: {activeCount}</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400">Inactive: {inactiveCount}</span>
            <span className="text-slate-600">|</span>
            <span className="text-rose-400">Blocked: {blockedCount}</span>
          </div>
        </div>

        {/* Card 2: Thermal & Cold Chain Profiles */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">THERMAL SPECS</p>
            <Snowflake className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <h3 className="text-2xl font-bold text-slate-100">{products.length} <span className="text-sm font-normal text-slate-400">Total Items</span></h3>
          </div>
          <div className="text-[11px] font-medium pt-2 border-t border-slate-800/80 flex items-center gap-2">
            <span className="text-cyan-400">Chilled: {thermalStats.chilled}</span>
            <span className="text-slate-600">|</span>
            <span className="text-blue-400">Frozen: {thermalStats.frozen}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Ambient/CA: {thermalStats.ambientCa}</span>
          </div>
        </div>

        {/* Card 3: Categories Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">CATEGORIES</p>
            <PieChart className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <h3 className="text-2xl font-bold text-slate-100">{products.length} <span className="text-sm font-normal text-slate-400">Total Items</span></h3>
          </div>
          <div className="text-[11px] font-medium pt-2 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap">
            <span className="text-amber-400">Fruit: {fruitCount}</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400">Veg: {vegCount}</span>
            <span className="text-slate-600">|</span>
            <span className="text-rose-400">Meat: {meatCount}</span>
            {otherCatCount > 0 && (
              <>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Other: {otherCatCount}</span>
              </>
            )}
          </div>
        </div>

        {/* Card 4: Trade Readiness & Compliance */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">TRADE COMPLIANCE</p>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <h3 className="text-2xl font-bold text-slate-100">{complianceClearedCount} <span className="text-sm font-normal text-slate-400">Ready for Trade</span></h3>
          </div>
          <div className="text-[11px] font-medium pt-2 border-t border-slate-800/80 flex items-center gap-2">
            <span className="text-emerald-400">Ready: {complianceClearedCount}</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400">Pending: {pendingComplianceCount}</span>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              selectedCategory === 'ALL'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setSelectedCategory('FRESH_FRUIT')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              selectedCategory === 'FRESH_FRUIT'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Fresh Fruit
          </button>
          <button
            onClick={() => setSelectedCategory('FRESH_VEGETABLE')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              selectedCategory === 'FRESH_VEGETABLE'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Fresh Vegetables
          </button>
          <button
            onClick={() => setSelectedCategory('FRESH_MEAT')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              selectedCategory === 'FRESH_MEAT'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Chilled Meat
          </button>
          <button
            onClick={() => setSelectedCategory('FROZEN_MEAT')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              selectedCategory === 'FROZEN_MEAT'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Frozen Meat
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search SKU, Product, HS Code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Catalog Table Block */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="max-h-[520px] overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/50">
          <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[700px]">
            <thead className="sticky top-0 z-10 bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 shadow-sm">
              <tr>
                <th className="py-3 px-3 bg-slate-950">SKU / HS CODE</th>
                <th className="py-3 px-3 bg-slate-950">PRODUCT & TRADE NAME</th>
                <th className="py-3 px-3 bg-slate-950">CATEGORY</th>
                <th className="py-3 px-3 bg-slate-950">THERMAL SPECS</th>
                <th className="py-3 px-3 bg-slate-950">COMPLIANCE</th>
                <th className="py-3 px-3 bg-slate-950">STATUS</th>
                <th className="py-3 px-3 text-right bg-slate-950">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Loading Product Master Catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No products found matching your search criteria.
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const coldSpec = getColdChainSpec(prod);

                  const displayTemp = coldSpec?.optimal_temp_c != null 
                    ? `${coldSpec.optimal_temp_c}°C` 
                    : (coldSpec?.min_temp_c != null && coldSpec?.max_temp_c != null)
                    ? `${coldSpec.min_temp_c}°C to ${coldSpec.max_temp_c}°C`
                    : null;

                  const isCompliant = isProductCompliant(prod);

                  return (
                    <tr key={prod.id} className="hover:bg-slate-800/40 transition">
                      
                      {/* SKU / HS Code */}
                      <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                        <div className="font-semibold text-emerald-400">{prod.sku}</div>
                        <div className="text-[10px] text-slate-500">HS: {prod.hs_code}</div>
                      </td>

                      {/* Product & Trade Name */}
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-100">{prod.trade_name || prod.name}</div>
                        <div className="text-[10px] text-slate-400 italic truncate max-w-[180px]">{prod.scientific_name || prod.name}</div>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          prod.category === 'FRESH_FRUIT'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : prod.category === 'FRESH_VEGETABLE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {prod.category?.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Thermal Specs */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {coldSpec && (displayTemp || coldSpec.shelf_life_days) ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-slate-200 font-medium text-[11px]">
                              <Thermometer className="w-3 h-3 text-cyan-400 shrink-0" />
                              <span>{displayTemp ?? 'Controlled'}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {coldSpec.shelf_life_days ? (
                                <>Shelf: <span className="text-slate-300">{coldSpec.shelf_life_days} days</span></>
                              ) : (
                                <span className="text-slate-400">{coldSpec.storage_type || 'Cold Storage'}</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">Unspecified</span>
                        )}
                      </td>

                      {/* Compliance Column */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {isCompliant ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Compliance Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
                            <Clock className="w-3 h-3 text-amber-400" /> Pending Compliance
                          </span>
                        )}
                      </td>

                      {/* Status Column */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                          prod.status === 'BLOCKED'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : prod.status === 'INACTIVE'
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {prod.status || 'ACTIVE'}
                        </span>
                      </td>

                      {/* Symbol Action Buttons */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditProduct(prod)}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-md transition"
                            title="Edit Product Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* KYP Page Symbol Button */}
                          <button
                            onClick={() => handleKYPClick(prod)}
                            className="p-1.5 text-cyan-400 hover:text-cyan-300 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-md transition"
                            title="Know Your Product (KYP) Passport"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.trade_name || prod.name)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-md transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shared Create / Edit Modal Dialog */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={() => {
          fetchProducts();
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        productToEdit={editingProduct}
      />
    </div>
  );
}
