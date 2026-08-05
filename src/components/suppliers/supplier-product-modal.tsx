'use client';

import React, { useState, useEffect } from 'react';
import { X, Package, Save } from 'lucide-react';

interface SupplierProductModalProps {
  isOpen: boolean;
  supplierId: string;
  onClose: () => void;
  onSuccess: () => void;
  productToEdit?: any | null;
}

const generateContractNumber = () => `SAF-SUP-CO-${Math.floor(1000 + Math.random() * 9000)}`;
const generateTestNumber = () => `SAF-SUP-TST-${Math.floor(1000 + Math.random() * 9000)}`;

export function SupplierProductModal({
  isOpen,
  supplierId,
  onClose,
  onSuccess,
  productToEdit,
}: SupplierProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    product_category: '',
    short_description: '',
    measurement: 'KG',
    supplier_capacity: '',
    delivery: 'Pick Up Supplier Facility',
    contract: 'N/A',
    contract_number: '',
    sample_requirements: 'Required on Po',
    test_specification: 'N/A',
    test_number: '',
    product_compliance: 'N/A',
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        product_name: productToEdit.product_name || '',
        product_category: productToEdit.product_category || '',
        short_description: productToEdit.short_description || '',
        measurement: productToEdit.measurement || 'KG',
        supplier_capacity: productToEdit.supplier_capacity || '',
        delivery: productToEdit.delivery || 'Pick Up Supplier Facility',
        contract: productToEdit.contract || 'N/A',
        contract_number: productToEdit.contract_number || '',
        sample_requirements: productToEdit.sample_requirements || 'Required on Po',
        test_specification: productToEdit.test_specification || 'N/A',
        test_number: productToEdit.test_number || '',
        product_compliance: productToEdit.product_compliance || 'N/A',
      });
    } else {
      setFormData({
        product_name: '',
        product_category: '',
        short_description: '',
        measurement: 'KG',
        supplier_capacity: '',
        delivery: 'Pick Up Supplier Facility',
        contract: 'N/A',
        contract_number: '',
        sample_requirements: 'Required on Po',
        test_specification: 'N/A',
        test_number: '',
        product_compliance: 'N/A',
      });
    }
  }, [productToEdit, isOpen]);

  // Handler 7 & 8: Auto-generate Contract Number if "Available" is selected
  const handleContractChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      contract: val,
      contract_number: val === 'Available' ? (prev.contract_number || generateContractNumber()) : '',
    }));
  };

  // Handler 10 & 11: Auto-generate Test Number if "Passed" or "Failed" is selected
  const handleTestSpecChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const requiresTestNo = val === 'Passed' || val === 'Failed';
    setFormData((prev) => ({
      ...prev,
      test_specification: val,
      test_number: requiresTestNo ? (prev.test_number || generateTestNumber()) : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isEdit = !!productToEdit;
      const url = '/api/supplier-products';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        ...(isEdit ? { id: productToEdit.id } : {}),
        supplier_id: supplierId,
        ...formData,
        supplier_capacity: formData.supplier_capacity ? Number(formData.supplier_capacity) : 0,
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
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to save product'}`);
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
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-slate-100">
              {productToEdit ? 'Edit Product Item' : 'Add New Product Item'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Product Name */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Chilled Beef Carcass"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 2. Product Category */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
                Product Category *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Meat / Livestock"
                value={formData.product_category}
                onChange={(e) => setFormData({ ...formData, product_category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 3. Short Description */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
                Short Description
              </label>
              <textarea
                rows={2}
                placeholder="Specify product details, specs, or operational notes..."
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {/* 4. Measurement */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
                Measurement *
              </label>
              <select
                value={formData.measurement}
                onChange={(e) => setFormData({ ...formData, measurement: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Head">Head</option>
                <option value="Units">Units</option>
                <option value="KG">KG</option>
                <option value="Batch">Batch</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* 5. Supplier Capacity */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
                Supplier Capacity
              </label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={formData.supplier_capacity}
                onChange={(e) => setFormData({ ...formData, supplier_capacity: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 6. Delivery */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
                Delivery *
              </label>
              <select
                value={formData.delivery}
                onChange={(e) => setFormData({ ...formData, delivery: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Pick Up Supplier Facility">Pick Up Supplier Facility</option>
                <option value="Delivery Safaa Facility">Delivery Safaa Facility</option>
              </select>
            </div>

            {/* 7. Contract */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
                Contract *
              </label>
              <select
                value={formData.contract}
                onChange={handleContractChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
                <option value="Expired">Expired</option>
                <option value="N/A">N/A</option>
              </select>
            </div>

            {/* 8. Contract Number (Auto-generated if Available, Editable) */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
                Contract Number
              </label>
              <input
                type="text"
                placeholder={formData.contract === 'Available' ? 'SAF-SUP-CO-XXXX' : 'N/A'}
                value={formData.contract_number}
                onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 9. Sample Requirements */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
                Sample Requirements *
              </label>
              <select
                value={formData.sample_requirements}
                onChange={(e) => setFormData({ ...formData, sample_requirements: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Required on Po">Required on Po</option>
                <option value="Under Verification">Under Verification</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* 10. Test Specification */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
                Test Specification *
              </label>
              <select
                value={formData.test_specification}
                onChange={handleTestSpecChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Passed">Passed</option>
                <option value="Before Delivery">Before Delivery</option>
                <option value="After Delivery">After Delivery</option>
                <option value="Failed">Failed</option>
                <option value="N/A">N/A</option>
              </select>
            </div>

            {/* 11. Test Number (Auto-generated if Passed/Failed, Editable) */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
                Test Number
              </label>
              <input
                type="text"
                placeholder={['Passed', 'Failed'].includes(formData.test_specification) ? 'SAF-SUP-TST-XXXX' : 'N/A'}
                value={formData.test_number}
                onChange={(e) => setFormData({ ...formData, test_number: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 12. Product Compliance */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
                Product Compliance *
              </label>
              <select
                value={formData.product_compliance}
                onChange={(e) => setFormData({ ...formData, product_compliance: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Ready By Supplier">Ready By Supplier</option>
                <option value="Ready By Safaa">Ready By Safaa</option>
                <option value="Ready By Safaa & Supplier">Ready By Safaa & Supplier</option>
                <option value="Pending">Pending</option>
                <option value="N/A">N/A</option>
              </select>
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
              {loading ? 'Saving...' : productToEdit ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}