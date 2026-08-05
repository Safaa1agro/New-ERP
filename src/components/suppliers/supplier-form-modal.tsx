'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, Save } from 'lucide-react';

const CATEGORY_SHORTCODES: Record<string, string> = {
  'Cattle Farmer': 'CFM',
  Broker: 'BRK',
  Farmer: 'FAR',
  Facility: 'FAC',
  Organization: 'ORG',
  Factory: 'FCT',
  Exporter: 'EXP',
  'Self Produced': 'SLF',
  Shop: 'SHP',
};

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supplierToEdit?: any | null;
}

export function SupplierFormModal({
  isOpen,
  onClose,
  onSuccess,
  supplierToEdit,
}: SupplierFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplier_code: '',
    company_name: '',
    category: 'Broker',
    status: 'Active',
    tax_id: '',
    city_region_country: '',
    primary_contact_name: '',
    phone: '',
    email: '',
    default_payment_terms: 'Accept All Contract',
    compliance_readiness: 'YES (Compliance Cleared)',
    internal_compliance_ref: '',
  });

  const generateSupplierCode = (category: string) => {
    const shortcode = CATEGORY_SHORTCODES[category] || 'SUP';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `SAF-SUP-${shortcode}-${randomNum}`;
  };

  // 1. Updated Helper Generator (SAF-SCR- prefix)
const generateComplianceRef = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `SAF-SCR-${randomNum}`;
};

// 2. Compliance Readiness Handler (Auto-generates code on YES, clears on NO)
const handleComplianceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const value = e.target.value;
  setFormData((prev) => ({
    ...prev,
    compliance_readiness: value,
    internal_compliance_ref:
      value === 'YES (Compliance Cleared)'
        ? prev.internal_compliance_ref || generateComplianceRef()
        : '',
  }));
};

  useEffect(() => {
  if (supplierToEdit) {
    const isCleared =
      supplierToEdit.compliance_readiness === 'YES' ||
      supplierToEdit.compliance_readiness === 'YES (Compliance Cleared)';

    setFormData({
      supplier_code: supplierToEdit.supplier_code || generateSupplierCode('Broker'),
      company_name: supplierToEdit.company_name || supplierToEdit.company_or_farm_name || '',
      category: supplierToEdit.category || supplierToEdit.supplier_type || 'Broker',
      status: supplierToEdit.status || 'Active',
      tax_id: supplierToEdit.tax_id || '',
      city_region_country: supplierToEdit.city_region || supplierToEdit.city_region_country || '',
      primary_contact_name: supplierToEdit.primary_contact_name || '',
      phone: supplierToEdit.phone || '',
      email: supplierToEdit.email || '',
      default_payment_terms: supplierToEdit.default_payment_terms || 'Accepted All Contract',
      compliance_readiness: isCleared ? 'YES (Compliance Cleared)' : 'NO (Compliance Pending)',
      internal_compliance_ref: isCleared
        ? supplierToEdit.internal_compliance_ref || generateComplianceRef()
        : '',
    });
  } else {
    setFormData({
      supplier_code: generateSupplierCode('Broker'),
      company_name: '',
      category: 'Broker',
      status: 'Active',
      tax_id: '',
      city_region_country: '',
      primary_contact_name: '',
      phone: '',
      email: '',
      default_payment_terms: 'Accepted All Contract',
      compliance_readiness: 'YES (Compliance Cleared)',
      internal_compliance_ref: generateComplianceRef(),
    });
  }
}, [supplierToEdit, isOpen]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCat = e.target.value;
    setFormData((prev) => ({
      ...prev,
      category: newCat,
      supplier_code: supplierToEdit ? prev.supplier_code : generateSupplierCode(newCat),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isEdit = !!supplierToEdit;
      const url = '/api/suppliers';
      const method = isEdit ? 'PUT' : 'POST';

      const isCompliant = formData.compliance_readiness.includes('YES');

      const payload = {
        ...(isEdit ? { id: supplierToEdit.id } : {}),
        ...formData,
        compliance_readiness: isCompliant ? 'YES' : 'NO',
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.error || 'Failed to save supplier'}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-slate-100">
              {supplierToEdit ? 'Edit Supplier / Farm' : 'Add New Supplier / Farm'}
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-100 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 12-Section Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Supplier Code (Editable & Auto-Generated) */}
<div>
  <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
    Supplier Code
  </label>
  <input
    type="text"
    value={formData.supplier_code}
    onChange={(e) => setFormData({ ...formData, supplier_code: e.target.value })}
    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
  />
</div>

            {/* 2. Company / Farm Name */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
                Company / Farm Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. xyz Company / Abc Farams / Name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 3. Supplier Category */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
                Supplier Category *
              </label>
              <select
                value={formData.category}
                onChange={handleCategoryChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Broker">Broker/Indviual</option>
                <option value="Cattle Farmer">Cattle Farmer</option>
                <option value="Farmer">General Farmer</option>
                <option value="Facility">Facility</option>
                <option value="Organization">Organization</option>
                <option value="Factory">Factory</option>
                <option value="Exporter">Exporter</option>
                <option value="Self Produced">Self Produced</option>
                <option value="Shop">Shop</option>
              </select>
            </div>

            {/* 4. Status */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Active">Active</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Inactive">Inactive</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

            {/* 5. CNIC / Reg No / NTN No */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
                CNIC / Reg No / NTN No
              </label>
              <input
                type="text"
                placeholder="e.g. CNIC 35356689756"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 6. City / Region / Country */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
                City / Region / Country
              </label>
              <input
                type="text"
                placeholder="e.g. Lahore Pakistan"
                value={formData.city_region_country}
                onChange={(e) => setFormData({ ...formData, city_region_country: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 7. Primary Contact Name */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
                Primary Contact Name
              </label>
              <input
                type="text"
                placeholder="e.g. Ahmed Husain"
                value={formData.primary_contact_name}
                onChange={(e) => setFormData({ ...formData, primary_contact_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 8. Phone Number */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. +92 354 7659874"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 9. Email Address */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g.ahmed@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 10. Default Commercial Terms */}
<div>
  <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
    Default Commercial Terms
  </label>
  <select
    value={formData.default_payment_terms}
    onChange={(e) => setFormData({ ...formData, default_payment_terms: e.target.value })}
    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
  >
    <option value="Accepted All Contract">Accepted All Contract</option>
    <option value="Cash on Delivery">Cash on Delivery</option>
    <option value="Advanced Contract">Advanced Contract</option>
    <option value="Credit Contract">Credit Contract</option>
  </select>
</div>

{/* 11. Compliance Readiness */}
<div>
  <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
    Compliance Readiness
  </label>
  <select
    value={formData.compliance_readiness}
    onChange={handleComplianceChange}
    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
  >
    <option value="YES (Compliance Cleared)">YES (Compliance Cleared)</option>
    <option value="NO (Compliance Pending)">NO (Compliance Pending)</option>
  </select>
</div>

{/* 12. Compliance Ref Code (Editable & Conditional) */}
<div>
  <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
    Compliance Ref Code
  </label>
  <input
    type="text"
    placeholder={formData.compliance_readiness.includes('YES') ? 'SAF-SCR-XXXX' : 'Pending Clearance'}
    value={formData.internal_compliance_ref}
    onChange={(e) => setFormData({ ...formData, internal_compliance_ref: e.target.value })}
    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
  />
</div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-100 bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : supplierToEdit ? 'Update Supplier' : 'Save Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}