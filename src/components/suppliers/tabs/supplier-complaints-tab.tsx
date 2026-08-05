'use client';

import React from 'react';
import { SupplierComplaint } from '@/types/supplier.types';
import { AlertTriangle, CheckCircle2, MessageSquare } from 'lucide-react';

interface SupplierComplaintsTabProps {
  complaints: SupplierComplaint[];
}

export function SupplierComplaintsTab({ complaints }: SupplierComplaintsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold text-slate-100">Quality Complaints & Non-Conformance Tickets</h3>
          <p className="text-xs text-slate-400">Documented weight discrepancies, temperature breaches, and rejected shipments</p>
        </div>
      </div>

      <div className="space-y-4">
        {complaints.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
            No active or historical quality complaints logged for this supplier.
          </div>
        ) : (
          complaints.map((ticket) => (
            <div key={ticket.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <h4 className="font-semibold text-slate-100">{ticket.issue_title}</h4>
                  <span className="text-xs font-mono text-slate-500">({ticket.ticket_number})</span>
                </div>
                <span className="text-xs px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded">
                  {ticket.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                {ticket.description}
              </p>

              {ticket.supplier_response && (
                <div className="pl-4 border-l-2 border-emerald-500/50 space-y-1">
                  <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Supplier Response ({ticket.supplier_response_date})
                  </p>
                  <p className="text-xs text-slate-400 italic">{ticket.supplier_response}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}