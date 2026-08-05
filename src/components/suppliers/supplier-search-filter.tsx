'use client';

import React from 'react';
import { SupplierFilterState, SupplierType, SupplierStatus } from '@/types/supplier.types';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface SupplierSearchFilterProps {
  filters: SupplierFilterState;
  onFilterChange: (filters: SupplierFilterState) => void;
  onReset: () => void;
}

const CATEGORY_OPTIONS: { label: string; value: 'ALL' | SupplierType }[] = [
  { label: 'All Categories', value: 'ALL' },
  { label: 'Farmers', value: 'FARMER' },
  { label: 'Livestock', value: 'LIVESTOCK' },
  { label: 'Produce', value: 'PRODUCE' },
  { label: 'Contract Growers', value: 'CONTRACT_GROWER' },
  { label: 'General', value: 'GENERAL' },
];

const STATUS_OPTIONS: { label: string; value: 'ALL' | SupplierStatus }[] = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Under KYC', value: 'UNDER_KYC' },
  { label: 'Compliance Pending', value: 'COMPLIANCE_PENDING' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Blocked', value: 'BLOCKED' },
];

export function SupplierSearchFilter({ filters, onFilterChange, onReset }: SupplierSearchFilterProps) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-6 backdrop-blur-sm space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full lg:w-1/2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Supplier Code (SAF-SUP-...), Name, City, CNIC/NTN..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>

        {/* Dropdowns & Reset */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filters.category}
              onChange={(e) => onFilterChange({ ...filters, category: e.target.value as 'ALL' | SupplierType })}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value as 'ALL' | SupplierStatus })}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                {opt.label}
              </option>
            ))}
          </select>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}