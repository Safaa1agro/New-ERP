'use client';

import React from 'react';
import { SupplierKpiSummary } from '@/types/supplier.types';
import { Users, ShieldAlert, Wheat, DollarSign, CheckCircle2 } from 'lucide-react';

interface SupplierKpiCardsProps {
  summary: SupplierKpiSummary;
}

export function SupplierKpiCards({ summary }: SupplierKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Vendor Overview */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Vendors</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">{summary.total_vendors}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <span className="text-emerald-400 font-semibold">{summary.active_vendors} Active</span>
          <span>•</span>
          <span className="text-amber-400">{summary.kyc_pending_count} Under KYC</span>
          <span>•</span>
          <span className="text-rose-400">{summary.blocked_vendors} Blocked</span>
        </div>
      </div>

      {/* Card 2: Agri & Livestock Breakdown */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agri Pipeline</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">
              {summary.farmers_count + summary.livestock_count + summary.produce_count + summary.contract_growers_count}
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
            <Wheat className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>Farmers: <strong className="text-slate-200">{summary.farmers_count}</strong></span>
          <span>Livestock: <strong className="text-slate-200">{summary.livestock_count}</strong></span>
          <span>Growers: <strong className="text-slate-200">{summary.contract_growers_count}</strong></span>
        </div>
      </div>

      {/* Card 3: Procurement Volume */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Procurement Spend</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">
              ${summary.total_procurement_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Cumulative PO volume issued across active suppliers
        </p>
      </div>

      {/* Card 4: Compliance & Readiness */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Compliance Cleared</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">{summary.compliance_cleared_count}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>{summary.kyc_pending_count} pending verification</span>
        </div>
      </div>
    </div>
  );
}