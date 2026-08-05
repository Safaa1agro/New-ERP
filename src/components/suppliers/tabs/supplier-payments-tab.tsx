'use client';

import React, { useState } from 'react';
import { SupplierPayment } from '@/types/supplier.types';
import { DollarSign, Plus, CreditCard, Receipt } from 'lucide-react';

interface SupplierPaymentsTabProps {
  supplierId: string;
  payments: SupplierPayment[];
  onRefresh: () => void;
}

export function SupplierPaymentsTab({ supplierId, payments, onRefresh }: SupplierPaymentsTabProps) {
  const [isLogging, setIsLogging] = useState(false);
  const [newPayment, setNewPayment] = useState({
    payment_ref: `SAF-PAY-${Math.floor(1000 + Math.random() * 9000)}`,
    amount_paid: 0,
    payment_method: 'BANK_TRANSFER',
  });

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);

  const handleLogPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPayment,
          supplier_id: supplierId,
        }),
      });
      if (res.ok) {
        setIsLogging(false);
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to log payment:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold text-slate-100">Vendor Payment Ledger</h3>
          <p className="text-xs text-slate-400">Total Paid to Date: <strong className="text-emerald-400">${totalPaid.toLocaleString()}</strong></p>
        </div>
        <button
          onClick={() => setIsLogging(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Payment Slip
        </button>
      </div>

      {isLogging && (
        <form onSubmit={handleLogPayment} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Payment Ref</label>
              <input
                type="text"
                required
                value={newPayment.payment_ref}
                onChange={(e) => setNewPayment({ ...newPayment, payment_ref: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Amount Paid ($ USD)</label>
              <input
                type="number"
                required
                step="0.01"
                value={newPayment.amount_paid || ''}
                onChange={(e) => setNewPayment({ ...newPayment, amount_paid: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Payment Method</label>
              <select
                value={newPayment.payment_method}
                onChange={(e) => setNewPayment({ ...newPayment, payment_method: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-slate-100"
              >
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsLogging(false)} className="px-3 py-1 text-xs text-slate-400 bg-slate-800 rounded">
              Cancel
            </button>
            <button type="submit" className="px-3 py-1 text-xs font-semibold text-slate-950 bg-emerald-400 rounded">
              Record Payment
            </button>
          </div>
        </form>
      )}

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Payment Ref</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4 text-right">Amount Paid</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  No payment slips recorded for this supplier.
                </td>
              </tr>
            ) : (
              payments.map((pmt) => (
                <tr key={pmt.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono text-emerald-400 text-xs">{pmt.payment_ref}</td>
                  <td className="py-3 px-4 text-xs text-slate-400">{pmt.payment_date}</td>
                  <td className="py-3 px-4 text-xs text-slate-300">{pmt.payment_method}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-400 text-right">
                    ${Number(pmt.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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