'use client';

import { useState } from 'react';
import { CustomerBusinessType, PaymentTerms, PreferredCurrency } from '@/types/customer.types';
import { Plus, X } from 'lucide-react';

interface CustomerFormModalProps {
  onSuccess: () => void;
}

export function CustomerFormModal({ onSuccess }: CustomerFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '',
    customer_code: '',
    primary_country: 'United Arab Emirates',
    destination_port: '',
    business_type: 'DISTRIBUTOR' as CustomerBusinessType,
    tax_vat_number: '',
    sfda_registration_no: '',
    halal_import_permit_no: '',
    credit_limit_usd: 50000,
    payment_terms: 'ADVANCE_100' as PaymentTerms,
    preferred_currency: 'USD' as PreferredCurrency,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setIsOpen(false);
      onSuccess();
    } else {
      alert('Error creating customer record');
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-lg"
      >
        <Plus className="h-4 w-4" /> Register Importer
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Register New Global Importer / Buyer</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                    placeholder="e.g. Gulf Food Wholesalers LLC"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Customer Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.customer_code}
                    onChange={(e) => setFormData({ ...formData, customer_code: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                    placeholder="e.g. IMP-UAE-009"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Primary Country *</label>
                  <input
                    type="text"
                    required
                    value={formData.primary_country}
                    onChange={(e) => setFormData({ ...formData, primary_country: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Destination Port *</label>
                  <input
                    type="text"
                    required
                    value={formData.destination_port}
                    onChange={(e) => setFormData({ ...formData, destination_port: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                    placeholder="e.g. Jebel Ali Port / Jeddah Islamic Port"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Business Category</label>
                  <select
                    value={formData.business_type}
                    onChange={(e) => setFormData({ ...formData, business_type: e.target.value as CustomerBusinessType })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="SUPERMARKET_CHAIN">Supermarket Chain</option>
                    <option value="WHOLESALER">Wholesaler</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                    <option value="MEAT_PROCESSOR">Meat Processor</option>
                    <option value="HOTEL_CATERING">Hotel Catering</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Payment Terms</label>
                  <select
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value as PaymentTerms })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="ADVANCE_100">100% Advance TT</option>
                    <option value="LC_AT_SIGHT">Irrevocable LC at Sight</option>
                    <option value="CAD">Cash Against Documents (CAD)</option>
                    <option value="DP_30_DAYS">DP 30 Days</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Credit Limit (USD)</label>
                  <input
                    type="number"
                    value={formData.credit_limit_usd}
                    onChange={(e) => setFormData({ ...formData, credit_limit_usd: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">SFDA Reg Number (If Saudi Arabia)</label>
                  <input
                    type="text"
                    value={formData.sfda_registration_no}
                    onChange={(e) => setFormData({ ...formData, sfda_registration_no: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                    placeholder="SFDA-KSA-XXXXX"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Halal Import Permit Reference</label>
                  <input
                    type="text"
                    value={formData.halal_import_permit_no}
                    onChange={(e) => setFormData({ ...formData, halal_import_permit_no: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                >
                  {loading ? 'Saving...' : 'Save Importer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}