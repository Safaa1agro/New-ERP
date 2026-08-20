'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, FileText, Edit, Trash2, Eye } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import QuotationFormModal from '@/components/quotations/QuotationFormModal';

export default function QuotationsDirectoryPage() {
  const router = useRouter();
  const supabase = createClient();

  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<any | null>(null);

  // Fetch quotations from Supabase on page load
  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotations(data || []);
    } catch (err) {
      console.error('Error fetching quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  // Helper UUID validator & sanitizer to eliminate Supabase UUID syntax errors
  const isUUID = (str: any) =>
    typeof str === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  const sanitizeUUID = (val: any) => (isUUID(val) ? val : null);

  // Clean Save or Update Handler
  const handleSaveQuotation = async (formData: any) => {
    try {
      const quotationId = isUUID(formData?.id) ? formData.id : crypto.randomUUID();

      // Extract current auth user ID if available
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id || null;

      // Check validUntilDate first (matches QuotationFormModal state key)
      const rawValidUntil = 
        formData.validUntilDate || 
        formData.validUntil || 
        formData.valid_until || 
        formData.expiryDate || 
        formData.validityDate || 
        formData.valid_until_date;

      // Default to +14 days ONLY if user left the date input completely blank
      const defaultValidUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const cleanValidUntil = rawValidUntil ? String(rawValidUntil).split('T')[0] : defaultValidUntil;

      const dbPayload = {
        id: quotationId,
        quotation_number: formData.quotationNumber,
        customer_id: sanitizeUUID(formData.customerId || formData.customer_id),
        customer_name: formData.customerName,
        registration_number: formData.registrationNumber,
        primary_country: formData.primaryCountry,
        destination_port: formData.destinationPort,
        business_category: formData.businessCategory,
        payment_terms: formData.paymentTerms,
        product_id: sanitizeUUID(formData.productId || formData.product_id),
        product_name: formData.productName,
        hs_code: formData.hsCode,
        product_category: formData.productCategory,
        origin_region: formData.originRegion,
        storage_type: formData.storageType,
        optimal_temp_c: formData.optimalTempC,
        shelf_life_days: formData.shelfLifeDays,
        configuration_name: formData.configurationName,
        cargo_type: formData.cargoType || 'AIR',
        shipping_mode: formData.cargoType || formData.shippingMode || 'AIR',
        unit_of_measure: formData.unitOfMeasure,
        net_weight_kg: formData.netWeightKg,
        gross_weight_kg: formData.grossWeightKg,
        cbm_per_unit: formData.cbmPerUnit,
        total_units: formData.totalUnits,
        product_price: formData.productPrice,
        currency: formData.currency,
        incoterm: formData.incoterm,
        freight_cost: formData.freightCost,
        insurance_cost: formData.insuranceCost,
        custom_cost: formData.customCost,
        other_costs: formData.otherCosts,
        other_cost_details: formData.otherCostDetails,
        target_margin_pct: formData.targetMarginPct,
        calculated_total_cbm: formData.totalCbm,
        grand_total: formData.grandTotal,
        exchange_rate_to_pkr: formData.exchangeRateToPkr || formData.exchange_rate_to_pkr || 278.50,
        valid_until: cleanValidUntil,
        created_by: sanitizeUUID(formData.createdBy || formData.created_by) || currentUserId,
        status: (formData.status || 'Pending').toString(),
      };

      const { error } = await supabase
        .from('quotations')
        .upsert(dbPayload as any, { onConflict: 'id' });

      if (error) throw error;

      await fetchQuotations();
      setIsModalOpen(false);
      setEditingQuotation(null);
    } catch (err: any) {
      console.error('Failed to save quotation:', err.message);
      alert('Error saving quotation: ' + err.message);
    }
  };

  // Direct Inline Status Update Handler
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setQuotations((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
      );

      const { error } = await (supabase.from('quotations') as any)
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
    } catch (err: any) {
      console.error('Failed to update status:', err.message);
      alert('Error updating status: ' + err.message);
      fetchQuotations();
    }
  };

  // Open Edit Modal with Row Data
  const handleOpenEdit = (quote: any) => {
    // Extract clean YYYY-MM-DD date string without time/timezone shift
    const formattedDate = quote.valid_until ? String(quote.valid_until).split('T')[0] : '';

    const mappedFormState = {
      id: quote.id,
      quotationNumber: quote.quotation_number,
      customerId: quote.customer_id,
      customerName: quote.customer_name,
      registrationNumber: quote.registration_number,
      primaryCountry: quote.primary_country,
      destinationPort: quote.destination_port,
      businessCategory: quote.business_category,
      paymentTerms: quote.payment_terms,
      productId: quote.product_id,
      productName: quote.product_name,
      hsCode: quote.hs_code,
      productCategory: quote.product_category,
      originRegion: quote.origin_region,
      storageType: quote.storage_type,
      optimalTempC: quote.optimal_temp_c,
      shelfLifeDays: quote.shelf_life_days,
      configurationName: quote.configuration_name,
      cargoType: quote.cargo_type,
      unitOfMeasure: quote.unit_of_measure,
      netWeightKg: quote.net_weight_kg,
      grossWeightKg: quote.gross_weight_kg,
      cbmPerUnit: quote.cbm_per_unit,
      totalUnits: quote.total_units,
      productPrice: quote.product_price,
      currency: quote.currency,
      incoterm: quote.incoterm,
      freightCost: quote.freight_cost,
      insuranceCost: quote.insurance_cost,
      customCost: quote.custom_cost,
      otherCosts: quote.other_costs,
      otherCostDetails: quote.other_cost_details,
      targetMarginPct: quote.target_margin_pct,
      status: quote.status || 'Pending',
      // Map valid date across all possible prop names expected by QuotationFormModal
      validUntilDate: formattedDate,
      valid_until: formattedDate,
      expiryDate: formattedDate,
      validityDate: formattedDate,
    };

    setEditingQuotation(mappedFormState);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quotation?')) return;
    try {
      await supabase.from('quotations').delete().eq('id', id);
      fetchQuotations();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const filteredQuotations = quotations.filter((q) => {
    const term = searchTerm.toLowerCase();
    return (
      (q.quotation_number || '').toLowerCase().includes(term) ||
      (q.customer_name || '').toLowerCase().includes(term) ||
      (q.product_name || '').toLowerCase().includes(term) ||
      (q.primary_country || '').toLowerCase().includes(term)
    );
  });

  // Dynamic KPI Metric Calculations
  const totalVal = quotations.reduce((acc, curr) => acc + Number(curr.grand_total || 0), 0);

  const approvedQuotes = quotations.filter((q) => (q.status || '').toLowerCase() === 'approved');
  const approvedVal = approvedQuotes.reduce((acc, curr) => acc + Number(curr.grand_total || 0), 0);

  const pendingQuotes = quotations.filter((q) => (q.status || 'pending').toLowerCase() === 'pending');
  const pendingVal = pendingQuotes.reduce((acc, curr) => acc + Number(curr.grand_total || 0), 0);

  const rejectedQuotes = quotations.filter((q) => (q.status || '').toLowerCase() === 'rejected');
  const rejectedVal = rejectedQuotes.reduce((acc, curr) => acc + Number(curr.grand_total || 0), 0);

  return (
    <div className="p-6 space-y-6 bg-[#0b0f17] min-h-screen text-slate-100">
      {/* Top Banner */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Export Quotations Engine</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Manage spot rate calculations, thermal compliance, and active customer commercial proposals.</p>
        </div>

        <button
          onClick={() => {
            setEditingQuotation(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/10"
        >
          <Plus className="w-4 h-4" /> New Quotation
        </button>
      </div>

      {/* Dynamic KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#131b2e] border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Quotations</span>
          <div className="text-xl font-black text-white mt-1">{quotations.length} Records</div>
          <span className="text-xs text-emerald-400 font-mono">Total: USD ${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-[#131b2e] border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Approved Quotations</span>
          <div className="text-xl font-black text-emerald-400 mt-1">{approvedQuotes.length} Approved</div>
          <span className="text-xs text-emerald-400/80 font-mono">Total: USD ${approvedVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-[#131b2e] border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Pending Quotations</span>
          <div className="text-xl font-black text-amber-400 mt-1">{pendingQuotes.length} Pending</div>
          <span className="text-xs text-amber-400/80 font-mono">Total: USD ${pendingVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-[#131b2e] border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Rejected Quotations</span>
          <div className="text-xl font-black text-rose-400 mt-1">{rejectedQuotes.length} Rejected</div>
          <span className="text-xs text-rose-400/80 font-mono">Total: USD ${rejectedVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Quotation Number, Customer, Product, or Country..."
          className="w-full bg-[#131b2e] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none pl-10"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
      </div>

      {/* Data Directory Container with Fixed Height & Vertical Scrollbar */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-[#0b0f17] border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-1.5 px-1.5 whitespace">Quotation No</th>
                <th className="py-1.5 px-1.5 whitespace">Customer Name</th>
                <th className="py-1.5 px-1.5 whitespace">Product Name</th>
                <th className="py-1.5 px-1.5 whitespace">Country</th>
                <th className="py-1.5 px-1.5 whitespace">Temp Specs</th>
                <th className="py-1.5 px-1.5 whitespace">Cargo</th>
                <th className="py-1.5 px-1.5 whitespace">Quantity</th>
                <th className="py-1.5 px-1.5 whitespace">Amount</th>
                <th className="py-1.5 px-1.5 whitespace">Status</th>
                <th className="py-1.5 px-1.5 text-center whitespace">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">Loading records from database...</td>
                </tr>
              ) : filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">No quotations found matching your criteria.</td>
                </tr>
              ) : (
                filteredQuotations.map((quote) => {
                  const currentStatus = quote.status || 'Pending';
                  return (
                    <tr key={quote.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-1.5 px-1.5 font-mono font-bold text-emerald-400 whitespace">{quote.quotation_number}</td>
                      <td className="py-1.5 px-1.5 font-semibold text-white whitespace" title={quote.customer_name}>
                        {quote.customer_name}
                      </td>
                      <td className="py-1.5 px-1.5 whitespace" title={quote.product_name}>
                        {quote.product_name}
                      </td>
                      <td className="py-2.5 px-3 whitespace">{quote.primary_country || 'N/A'}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace">{quote.optimal_temp_c || 'N/A'}</td>
                      <td className="py-2.5 px-3 whitespace">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          quote.cargo_type === 'AIR' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {quote.cargo_type || 'AIR'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono whitespace text-[11px]">
                        {quote.total_units} {quote.unit_of_measure}s / {quote.calculated_total_cbm} CBM
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400 whitespace">
                        {quote.currency || 'USD'} ${Number(quote.grand_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      {/* Interactive Status Dropdown Column */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(quote.id, e.target.value)}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition ${
                            currentStatus === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : currentStatus === 'Rejected'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          <option value="Pending" className="bg-[#131b2e] text-amber-400 font-bold">Pending</option>
                          <option value="Approved" className="bg-[#131b2e] text-emerald-400 font-bold">Approved</option>
                          <option value="Rejected" className="bg-[#131b2e] text-rose-400 font-bold">Rejected</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* KYQ Icon Button with Hover Tooltip */}
                          <button
                            onClick={() => router.push(`/quotations/${quote.id}`)}
                            title="Know Your Quotation (KYQ)"
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Button with Hover Tooltip */}
                          <button
                            onClick={() => handleOpenEdit(quote)}
                            title="Edit Quotation"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button with Hover Tooltip */}
                          <button
                            onClick={() => handleDelete(quote.id)}
                            title="Delete Quotation"
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
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

      {/* Modal Integration */}
      <QuotationFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuotation(null);
        }}
        initialData={editingQuotation}
        onSave={handleSaveQuotation}
      />
    </div>
  );
}
