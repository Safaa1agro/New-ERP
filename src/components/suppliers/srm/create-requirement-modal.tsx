'use client';

import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';

interface CreateRequirementModalProps {
  isOpen: boolean;
  suppliers: any[];
  defaultSupplierId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateRequirementModal({
  isOpen,
  suppliers,
  defaultSupplierId,
  onClose,
  onSuccess,
}: CreateRequirementModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplier_id: defaultSupplierId || '',
    title: '',
    commodity: '',
    est_value: '',
    stage: 'NEW REQUIREMENT',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/srm/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          est_value: formData.est_value ? Number(formData.est_value) : 0,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert('Failed to save procurement requirement');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2 text-emerald-400">
            <PlusCircle className="w-5 h-5" />
            <h2 className="text-sm font-semibold text-slate-100">Create Procurement Requirement</h2>
          </div>
          <button onClick={onClose} type="button" className="text-slate-400 hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Target Supplier</label>
            <select
              required
              value={formData.supplier_id}
              onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select Supplier...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.company_name || s.company_or_farm_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Requirement Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Weekly Chilled Beef Carcass Supply"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Commodity</label>
              <input
                type="text"
                required
                placeholder="e.g. Chilled Mutton / Mangoes"
                value={formData.commodity}
                onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Est. Value (PKR)</label>
              <input
                type="number"
                placeholder="650000"
                value={formData.est_value}
                onChange={(e) => setFormData({ ...formData, est_value: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Pipeline Stage</label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="NEW REQUIREMENT">NEW REQUIREMENT</option>
              <option value="QUALIFIED">QUALIFIED</option>
              <option value="RFQ SENT">RFQ SENT</option>
              <option value="QUOTATION RECEIVED">QUOTATION RECEIVED</option>
              <option value="SAMPLE RECEIVED">SAMPLE RECEIVED</option>
              <option value="CONTRACT SIGNED">CONTRACT SIGNED</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg"
            >
              {loading ? 'Saving...' : 'Save Requirement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}