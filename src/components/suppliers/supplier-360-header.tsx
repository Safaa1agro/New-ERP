'use client';

import React from 'react';
import Link from 'next/link';
import { Supplier } from '@/types/supplier.types';
import { ArrowLeft, Star, ShieldCheck, MapPin, Phone, Mail, Building } from 'lucide-react';

interface Supplier360HeaderProps {
  supplier: Supplier;
}

export function Supplier360Header({ supplier }: Supplier360HeaderProps) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4 backdrop-blur-sm">
      {/* Top Nav Back */}
      <div className="flex items-center justify-between">
        <Link href="/suppliers" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
        </Link>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          {supplier.supplier_code}
        </span>
      </div>

      {/* Supplier Title & Quick Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-100">{supplier.company_or_farm_name}</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {supplier.supplier_type}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {supplier.city_region}</span>
            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-500" /> {supplier.primary_phone || 'N/A'}</span>
            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-500" /> {supplier.email || 'N/A'}</span>
            <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5 text-slate-500" /> CNIC/NTN: {supplier.cnic_or_tax_id || 'N/A'}</span>
          </div>
        </div>

        {/* Readiness Badges */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Compliance Rating</div>
            <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
              <Star className="w-4 h-4 fill-amber-400" />
              {Number(supplier.rating || 0).toFixed(1)} / 5.0
            </div>
          </div>

          {supplier.compliance_cleared && (
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg" title="Compliance Cleared">
              <ShieldCheck className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}