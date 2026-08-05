'use client';

import React from 'react';
import { SupplierSample } from '@/types/supplier.types';
import { FlaskConical, Check, X, Clock } from 'lucide-react';

interface SupplierSamplesTabProps {
  samples: SupplierSample[];
  onRefresh: () => void;
}

export function SupplierSamplesTab({ samples }: SupplierSamplesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold text-slate-100">Lab Sample Dispatch & Collection Logs</h3>
          <p className="text-xs text-slate-400">Track raw produce testing, pesticide residual analysis & livestock health checks</p>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Sample Code</th>
              <th className="py-3 px-4">Item & Quantity</th>
              <th className="py-3 px-4">Dispatched / Collection Date</th>
              <th className="py-3 px-4">Safaa Officer</th>
              <th className="py-3 px-4">Lab Status</th>
              <th className="py-3 px-4">Report Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {samples.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No lab samples logged for this supplier yet.
                </td>
              </tr>
            ) : (
              samples.map((sample) => (
                <tr key={sample.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono text-emerald-400 text-xs">{sample.sample_code}</td>
                  <td className="py-3 px-4 font-medium text-slate-200">
                    {sample.item_type} <span className="text-xs text-slate-400">({sample.weight_or_quantity})</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400">
                    {sample.dispatched_date || 'N/A'} / {sample.collection_date || 'Pending'}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{sample.collected_by || '—'}</td>
                  <td className="py-3 px-4">
                    {sample.status === 'APPROVED' && (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded font-medium inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> Approved
                      </span>
                    )}
                    {sample.status === 'REJECTED' && (
                      <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs rounded font-medium inline-flex items-center gap-1">
                        <X className="w-3 h-3" /> Rejected
                      </span>
                    )}
                    {sample.status === 'UNDER_TESTING' && (
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs rounded font-medium inline-flex items-center gap-1">
                        <FlaskConical className="w-3 h-3" /> Testing
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400 max-w-xs truncate">
                    {sample.quality_report_notes || '—'}
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