'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, Edit, Trash2, CheckCircle, Clock, AlertTriangle, Building2, Star, ShieldCheck, ShieldAlert, Package, Workflow, Pencil } from 'lucide-react';

export interface Supplier {
  id: string;
  supplier_code: string;
  company_name?: string;
  company_or_farm_name?: string;
  category?: string | null;
  supplier_type?: string | null;
  status: string;
  city_region?: string | null;
  city_region_country?: string | null;
  default_payment_terms?: string | null;
  compliance_readiness?: string | null;
  rating?: number;
  products_count?: number;
}

export interface SupplierTableProps {
  suppliers: Supplier[];
  onEdit?: (supplier: Supplier) => void;
  onDelete?: (id: string) => void;
}

export function SupplierTable({ suppliers, onEdit, onDelete }: SupplierTableProps) {
  const getTypeBadge = (type?: string | null) => {
    const safeType = type || 'Unspecified';
    const colors: Record<string, string> = {
      'Cattle Farmer': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      Farmer: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      Broker: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      Facility: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      Organization: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      Factory: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      Exporter: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      'Self Produced': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      Shop: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    };

    const badgeStyle = colors[safeType] || 'bg-slate-800 text-slate-400 border-slate-700';

    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap border ${badgeStyle}`}>
        {safeType}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
            <CheckCircle className="w-3 h-3" /> Active
          </span>
        );
      case 'Pending Verification':
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
            <Clock className="w-3 h-3" /> Under Verification
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700 whitespace-nowrap">
            Inactive
          </span>
        );
      case 'Blocked':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 whitespace-nowrap">
            <AlertTriangle className="w-3 h-3" /> Blocked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700 whitespace-nowrap">
            {status}
          </span>
        );
    }
  };

  const getComplianceBadge = (readiness?: string | null) => {
    const isReady = readiness === 'YES' || readiness === 'CLEARED';
    return isReady ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
        <ShieldCheck className="w-3 h-3" /> Cleared
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
        <ShieldAlert className="w-3 h-3" /> Pending
      </span>
    );
  };

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
        <h3 className="text-sm font-medium text-slate-300">No suppliers found</h3>
        <p className="text-xs text-slate-500 mt-0.5">Get started by adding your first supplier or farm.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
  <tr>
    <th className="px-3 py-2.5 font-semibold">Code / Name</th>
    <th className="px-2.5 py-2.5 font-semibold">Category</th>
    <th className="px-2.5 py-2.5 font-semibold">Location</th>
    <th className="px-2 py-2.5 font-semibold">Rating</th>
    <th className="px-2.5 py-2.5 font-semibold">Terms</th>
    <th className="px-2.5 py-2.5 font-semibold">Status</th>
    <th className="px-2.5 py-2.5 font-semibold">Compliance</th>
    <th className="px-2 py-2.5 font-semibold text-center">Products</th>
    <th className="px-3 py-2.5 font-semibold text-right">Actions</th>
  </tr>
</thead>
          <tbody className="divide-y divide-slate-800/60">
            {suppliers.map((supplier) => {
              const name = supplier.company_name || supplier.company_or_farm_name || 'Unnamed Supplier';
              const location = supplier.city_region || supplier.city_region_country || 'N/A';
              const type = supplier.category || supplier.supplier_type;

              return (
                <tr key={supplier.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="font-mono text-[11px] font-bold text-emerald-400">
                      {supplier.supplier_code}
                    </div>
                    <div className="font-medium text-slate-100 text-xs truncate max-w-[160px]">{name}</div>
                  </td>

                  <td className="px-2.5 py-2.5">{getTypeBadge(type)}</td>

                  <td className="px-2.5 py-2.5 text-slate-400 truncate max-w-[120px]">{location}</td>

                  <td className="px-2 py-2.5">
                    <div className="inline-flex items-center gap-0.5 font-semibold text-amber-400 text-[11px]">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {Number(supplier.rating || 5.0).toFixed(1)}
                    </div>
                  </td>

                  <td className="px-2.5 py-2.5 font-mono text-slate-300 truncate max-w-[120px]">
                    {supplier.default_payment_terms || 'Cash on Delivery'}
                  </td>

                  <td className="px-2.5 py-2.5">{getStatusBadge(supplier.status || 'Pending')}</td>

                  <td className="px-2.5 py-2.5">{getComplianceBadge(supplier.compliance_readiness)}</td>

                  <td className="px-2 py-2.5 text-center">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-slate-300 rounded">
                      <Package className="w-3 h-3 text-blue-400" />
                      {supplier.products_count || 0}
                    </span>
                  </td>

<td className="px-3 py-2.5 text-right whitespace-nowrap">
  <div className="flex items-center justify-end gap-1">
    {/* SRM & Procurement Engine Icon */}
    <Link
      href={`/suppliers/srm?supplierId=${supplier.id}`}
      title="SRM & Procurement Engine"
      className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
    >
      <Workflow className="w-3.5 h-3.5" />
    </Link>

    {/* 360° KYS Profile Icon */}
    <Link
      href={`/suppliers/${supplier.id}`}
      title="360° KYS Profile"
      className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
    >
      <Eye className="w-3.5 h-3.5" />
    </Link>

    {/* Edit Supplier Icon */}
    {onEdit && (
      <button
        onClick={() => onEdit(supplier)}
        title="Edit Supplier"
        className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
      >
        <Edit className="w-3.5 h-3.5" />
      </button>
    )}

    {/* Delete Supplier Icon */}
    {onDelete && (
      <button
        onClick={() => onDelete(supplier.id)}
        title="Delete Supplier"
        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SupplierTable;