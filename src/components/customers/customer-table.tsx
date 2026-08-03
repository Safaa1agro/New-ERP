'use client';

import { useState } from 'react';
import { Customer, CustomerBusinessType, PaymentTerms } from '@/types/customer.types';
import Link from 'next/link';
import {
  Clock,
  ShieldCheck,
  AlertCircle,
  Edit,
  UserCheck,
  Kanban,
  X,
  Loader2,
  Save,
} from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
  loading?: boolean;
  onRefresh?: () => void;
}

export function CustomerTable({ customers, loading, onRefresh }: CustomerTableProps) {
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status badge styling helper
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'OUTREACHED':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'UNDER_VERIFICATION':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'NEGOTIATIONS':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'UNDER_COMPLIANCE':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'INACTIVE':
        return 'bg-slate-700/50 text-slate-400 border-slate-600';
      case 'BLOCKED':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  // Handle Update Customer submission
const handleUpdateCustomer = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingCustomer) return;

  setIsSubmitting(true);
  try {
    // 1. Extract SAF-CR reference
    const complianceRef =
      editingCustomer.compliance_reg_no ||
      editingCustomer.sfda_registration_no ||
      editingCustomer.permit_ref ||
      '';

    const isCleared =
      editingCustomer.trade_compliance === 'Compliance Cleared' ||
      editingCustomer.compliance_cleared === true ||
      Boolean(complianceRef);

    // 2. EXPLICIT payload (Only exact Supabase table column names allowed)
    const payload = {
      id: editingCustomer.id,
      company_name: editingCustomer.company_name || editingCustomer.name || '',
      customer_code: editingCustomer.customer_code || '',
      primary_country: editingCustomer.primary_country || editingCustomer.country || '',
      destination_port: editingCustomer.destination_port || editingCustomer.port || '',
      business_type: editingCustomer.business_type || editingCustomer.business_category || 'Wholesaler',
      payment_terms: editingCustomer.payment_terms || '100% Advance TT',
      credit_limit_usd: Number(editingCustomer.credit_limit_usd) || 0,
      tax_vat_number: editingCustomer.tax_vat_number || editingCustomer.reg_number || '',
      status: editingCustomer.status || 'Active',

      // Standardize SAF-CR compliance fields across all columns
      compliance_reg_no: isCleared ? complianceRef : null,
      sfda_registration_no: isCleared ? complianceRef : null,
      permit_ref: isCleared ? complianceRef : null,
      trade_compliance: isCleared ? 'Compliance Cleared' : 'Pending Compliance',
      compliance_cleared: isCleared,
    };

    const res = await fetch(`/api/customers/${editingCustomer.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseData = await res.json().catch(() => ({}));

    if (res.ok) {
      setEditingCustomer(null);
      if (onRefresh) onRefresh();
    } else {
      const errMsg =
        responseData.message ||
        responseData.error ||
        responseData.details ||
        'Failed to update customer details.';
      alert(`Update Failed: ${errMsg}`);
      console.error('Update Customer API Error:', responseData);
    }
  } catch (err) {
    console.error('Error updating customer:', err);
    alert('An unexpected error occurred while saving changes.');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-3.5">Customer Code / Company</th>
                <th className="p-3.5">Country & Destination Port</th>
                <th className="p-3.5">Business Type</th>
                <th className="p-3.5">Payment Terms</th>
                <th className="p-3.5">Credit Limit (USD)</th>
                <th className="p-3.5">Trade Compliance</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Loading buyer database...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No customers found. Register a new buyer to get started.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const isCompliant = Boolean(
                    c.sfda_registration_no || (c as any).is_compliance_ready || (c as any).compliance_cleared
                  );

                  return (
                    <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Customer Code / Company */}
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-emerald-400 block">
                          {c.customer_code}
                        </span>
                        <p className="font-bold text-white text-sm mt-0.5">{c.company_name || (c as any).name}</p>
                      </td>

                      {/* Country & Destination Port */}
                      <td className="p-3.5 text-slate-300">
                        <span className="font-semibold text-white block">
                          {c.primary_country || (c as any).country || 'N/A'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {c.destination_port || (c as any).port || 'Not Specified'}
                        </span>
                      </td>

                      {/* Business Type */}
                      <td className="p-3.5">
                        <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[10px] font-semibold border border-slate-700 uppercase">
                          {(c.business_type || (c as any).business_category || 'GENERAL').replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Payment Terms */}
                      <td className="p-3.5 font-mono text-slate-200">
                        {c.payment_terms || 'N/A'} ({(c as any).preferred_currency || 'USD'})
                      </td>

                      {/* Credit Limit (USD) */}
                      <td className="p-3.5 font-mono text-emerald-400 font-bold">
                        ${(c.credit_limit_usd ?? (c as any).credit_limit ?? 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      {/* Trade Compliance */}
          <td className="p-3.5">
            {isCompliant ? (
              <div className="flex flex-col gap-0.5">
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Compliance Cleared
                </span>
                {((c as any).permit_ref || (c as any).compliance_reg_no || c.sfda_registration_no) && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    Ref: {(c as any).permit_ref || (c as any).compliance_reg_no || c.sfda_registration_no}
                  </span>
                )}
              </div>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-400 text-[11px] font-semibold">
                <Clock className="h-3.5 w-3.5 text-amber-400" /> Pending Compliance
              </span>
            )}
          </td>

                      {/* Status Badge */}
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${getStatusBadge(
                            c.status
                          )}`}
                        >
                          {c.status ? String(c.status).replace(/_/g, ' ') : 'OUTREACHED'}
                        </span>
                      </td>

                      {/* Management & Navigation Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingCustomer(c)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Manage & Edit Buyer Details"
                          >
                            <Edit className="h-4 w-4 text-emerald-400" />
                          </button>

                          <Link
                            href={`/customers/crm?customerId=${c.id}`}
                            className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="View in CRM Pipeline"
                          >
                            <Kanban className="h-4 w-4" />
                          </Link>

                          <Link
                            href={`/customers/${c.id}`}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Open 360° Customer View"
                          >
                            <UserCheck className="h-4 w-4" />
                          </Link>
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

      {/* EDIT CUSTOMER MODAL */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl p-6 shadow-xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Edit Customer Details</h3>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateCustomer}>
              {/* EDIT CUSTOMER MODAL FORM BODY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                {/* Row 1: Company Name & Customer Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={editingCustomer?.company_name || editingCustomer?.name || ''}
                    onChange={(e) =>
                      setEditingCustomer((prev: any) => ({
                        ...prev,
                        name: e.target.value,
                        company_name: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Gulf Food Wholesalers LLC"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Status *</label>
                  <select
                    value={editingCustomer?.status || 'OUTREACHED'}
                    onChange={(e) =>
                      setEditingCustomer((prev: any) => ({ ...prev, status: e.target.value }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="OUTREACHED">Outreached</option>
                    <option value="ACTIVE">Active</option>
                    <option value="UNDER_VERIFICATION">Under Verification</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </div>

                {/* Row 2: Country & Destination Port */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Country *</label>
                  <input
                    type="text"
                    value={editingCustomer?.primary_country || editingCustomer?.country || ''}
                    onChange={(e) =>
                      setEditingCustomer((prev: any) => ({
                        ...prev,
                        primary_country: e.target.value,
                        country: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Saudi Arabia, UAE, UK, USA"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Destination Port *</label>
                  <input
                    type="text"
                    value={editingCustomer?.destination_port || editingCustomer?.port || ''}
                    onChange={(e) =>
                      setEditingCustomer((prev: any) => ({
                        ...prev,
                        destination_port: e.target.value,
                        port: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Jubail port"
                  />
                </div>

                {/* Row 3: Business Category & Payment Terms */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Business Category</label>
                  <select
                    value={editingCustomer?.business_category || editingCustomer?.business_type || 'WHOLESALER'}
                    onChange={(e) =>
                      setEditingCustomer((prev: any) => ({
                        ...prev,
                        business_category: e.target.value,
                        business_type: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="WHOLESALER">Wholesaler</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                    <option value="HOTEL_CATERING">Hotel / Catering</option>
                    <option value="SUPERMARKET">Supermarket Chain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Terms</label>
                  <select
                    value={editingCustomer?.payment_terms || 'ADVANCE_100'}
                    onChange={(e) =>
                      setEditingCustomer((prev: any) => ({ ...prev, payment_terms: e.target.value }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ADVANCE_100">100% Advance TT</option>
                    <option value="LC_SIGHT">Letter of Credit (LC Sight)</option>
                    <option value="CAD">Cash Against Documents (CAD)</option>
                    <option value="NET_30">Net 30 Days</option>
                  </select>
                </div>

                {/* Row 4: Approved Credit Limit & Tax/VAT Reg Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Approved Credit Limit (USD)</label>
                  <input
                    type="number"
                    value={editingCustomer?.credit_limit_usd ?? editingCustomer?.credit_limit ?? 0}
                    onChange={(e) =>
                      setEditingCustomer((prev: any) => ({
                        ...prev,
                        credit_limit_usd: parseFloat(e.target.value) || 0,
                        credit_limit: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
  <label className="block text-xs font-semibold text-slate-300 mb-1">Reg. Number</label>
  <input
    type="text"
    value={
      editingCustomer?.tax_vat_number ||
      editingCustomer?.tax_id ||
      editingCustomer?.vat_number ||
      editingCustomer?.cr_number ||
      editingCustomer?.reg_number ||
      ''
    }
    onChange={(e) => {
      const val = e.target.value;
      setEditingCustomer((prev: any) => ({
        ...prev,
        tax_vat_number: val,
        tax_id: val,
        vat_number: val,
        cr_number: val,
        reg_number: val,
      }));
    }}
    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
    placeholder="e.g. CRN-10029384"
  />
</div>

                {/* Row 5: Trade Compliance & Safaa Agro Compliance Ref */}
<div>
  <label className="block text-xs font-semibold text-slate-300 mb-1">
    Trade Compliance Cleared? *
  </label>
  <select
    value={
      editingCustomer?.trade_compliance === 'Compliance Cleared' || editingCustomer?.compliance_cleared
        ? 'true'
        : 'false'
    }
    onChange={(e) => {
      const isCleared = e.target.value === 'true';
      const existingRef =
        editingCustomer?.compliance_reg_no ||
        editingCustomer?.sfda_registration_no ||
        editingCustomer?.permit_ref ||
        '';
      
      // Keep existing code if present, otherwise auto-generate SAF-CR-xxxx when cleared
      const updatedRef = isCleared
        ? existingRef || `SAF-CR-${Math.floor(1000 + Math.random() * 9000)}`
        : '';

      setEditingCustomer((prev: any) => ({
        ...prev,
        compliance_cleared: isCleared,
        trade_compliance: isCleared ? 'Compliance Cleared' : 'Pending Compliance',
        compliance_reg_no: updatedRef,
        sfda_registration_no: updatedRef,
        permit_ref: updatedRef,
      }));
    }}
    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
  >
    <option value="false">No (Pending Compliance)</option>
    <option value="true">Yes (Compliance Cleared)</option>
  </select>
</div>

<div>
  <label className="block text-xs font-semibold text-slate-300 mb-1">
    Compliance Ref (SAF-CR-xxxx)
  </label>
  <input
    type="text"
    value={
      editingCustomer?.compliance_reg_no ||
      editingCustomer?.sfda_registration_no ||
      editingCustomer?.permit_ref ||
      ''
    }
    onChange={(e) => {
      const val = e.target.value;
      setEditingCustomer((prev: any) => ({
        ...prev,
        compliance_reg_no: val,
        sfda_registration_no: val,
        permit_ref: val,
        compliance_cleared: Boolean(val),
        trade_compliance: val ? 'Compliance Cleared' : 'Pending Compliance',
      }));
    }}
    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
    placeholder="e.g. SAF-CR-1234"
  />
</div>
              </div>

              {/* MODAL FOOTER ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}