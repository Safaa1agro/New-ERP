'use client';

import React, { useState } from 'react';
import { PurchaseOrder } from '@/types/supplier.types';
import { ShoppingBag, Plus, DollarSign } from 'lucide-react';

interface SupplierOrdersTabProps {
  supplierId: string;
  orders: PurchaseOrder[];
  onRefresh: () => void;
}

export function SupplierOrdersTab({ supplierId, orders, onRefresh }: SupplierOrdersTabProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newPo, setNewPo] = useState({
    po_number: `SAF-PO-${Math.floor(1000 + Math.random() * 9000)}`,
    total_amount_usd: 0,
    notes: '',
  });

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPo,
          supplier_id: supplierId,
          order_status: 'DRAFT',
          payment_status: 'UNPAID',
        }),
      });
      if (res.ok) {
        setIsCreating(false);
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to create PO:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold text-slate-100">Issued Purchase Orders</h3>
          <p className="text-xs text-slate-400">Historical procurement orders, fulfillment status, and contract values</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-lg text-xs font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Issue Purchase Order
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreatePo} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">PO Number</label>
              <input
                type="text"
                required
                value={newPo.po_number}
                onChange={(e) => setNewPo({ ...newPo, po_number: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Total Amount ($ USD)</label>
              <input
                type="number"
                required
                step="0.01"
                value={newPo.total_amount_usd || ''}
                onChange={(e) => setNewPo({ ...newPo, total_amount_usd: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Notes / Terms</label>
              <input
                type="text"
                placeholder="Order specifications..."
                value={newPo.notes}
                onChange={(e) => setNewPo({ ...newPo, notes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-slate-100"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsCreating(false)} className="px-3 py-1 text-xs text-slate-400 bg-slate-800 rounded">
              Cancel
            </button>
            <button type="submit" className="px-3 py-1 text-xs font-semibold text-slate-950 bg-emerald-400 rounded">
              Save PO
            </button>
          </div>
        </form>
      )}

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">PO Code</th>
              <th className="py-3 px-4">Order Date</th>
              <th className="py-3 px-4">Total USD</th>
              <th className="py-3 px-4">Fulfillment Status</th>
              <th className="py-3 px-4">Payment Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No purchase orders recorded for this supplier.
                </td>
              </tr>
            ) : (
              orders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono text-emerald-400 font-semibold text-xs">{po.po_number}</td>
                  <td className="py-3 px-4 text-xs text-slate-400">{po.order_date}</td>
                  <td className="py-3 px-4 font-semibold text-slate-100">${Number(po.total_amount_usd).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700">
                      {po.order_status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 text-xs rounded font-medium border ${
                        po.payment_status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {po.payment_status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}