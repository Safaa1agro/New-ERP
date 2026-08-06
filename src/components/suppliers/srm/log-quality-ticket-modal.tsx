'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface LogQualityTicketModalProps {
  isOpen: boolean;
  suppliers: any[];
  defaultSupplierId?: string | null;
  ticket?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function LogQualityTicketModal({
  isOpen,
  suppliers,
  defaultSupplierId,
  ticket,
  onClose,
  onSuccess,
}: LogQualityTicketModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplier_id: defaultSupplierId || '',
    issue_type: 'TEMPERATURE ABUSE',
    batch_po_no: '',
    claim_value: '',
    description: '',
  });

  useEffect(() => {
    if (ticket) {
      setFormData({
        supplier_id: ticket.supplier_id || defaultSupplierId || '',
        issue_type: ticket.issue_type || 'TEMPERATURE ABUSE',
        batch_po_no: ticket.batch_po_no || '',
        claim_value: ticket.claim_value ? String(ticket.claim_value) : '',
        description: ticket.description || '',
      });
    } else {
      setFormData({
        supplier_id: defaultSupplierId || '',
        issue_type: 'TEMPERATURE ABUSE',
        batch_po_no: '',
        claim_value: '',
        description: '',
      });
    }
  }, [ticket, defaultSupplierId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 4 Fix: Dynamic method & payload for Edit vs Create
      const method = ticket ? 'PUT' : 'POST';
      const payload = {
        ...(ticket && { id: ticket.id }),
        ...formData,
        claim_value: formData.claim_value ? Number(formData.claim_value) : 0,
      };

      const res = await fetch('/api/srm/quality-tickets', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert(ticket ? 'Failed to update claim ticket' : 'Failed to log claim ticket');
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
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-sm font-semibold text-slate-100">Log Supplier Quality & Non-Conformance Ticket</h2>
          </div>
          <button onClick={onClose} type="button" className="text-slate-400 hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Supplier</label>
            <select
              required
              value={formData.supplier_id}
              onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
            >
              <option value="">Select Supplier...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.company_name || s.company_or_farm_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Issue Type</label>
              <select
                value={formData.issue_type}
                onChange={(e) => setFormData({ ...formData, issue_type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              >
                <option value="TEMPERATURE ABUSE">TEMPERATURE ABUSE</option>
                <option value="PACKAGING DEFECT">PACKAGING DEFECT</option>
                <option value="DELAY DAMAGE">DELAY DAMAGE</option>
                <option value="SPECIFICATION MISMATCH">SPECIFICATION MISMATCH</option>
                <option value="WEIGHT SHORTAGE">WEIGHT SHORTAGE</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Container # / Batch PO #</label>
              <input
                type="text"
                placeholder="e.g. HLXU-882918-4"
                value={formData.batch_po_no}
                onChange={(e) => setFormData({ ...formData, batch_po_no: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Claim Value (USD)</label>
            <input
              type="number"
              placeholder="1250.00"
              value={formData.claim_value}
              onChange={(e) => setFormData({ ...formData, claim_value: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Issue Description & Remarks</label>
            <textarea
              rows={3}
              placeholder="Describe damage, temperature breach, or quality defect..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500 resize-none"
            />
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
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg"
            >
              {loading ? 'Logging...' : 'Log Claim Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}