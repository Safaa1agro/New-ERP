'use client';

import { Customer } from '@/types/customer.types';
import Link from 'next/link';
import { ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const getStatusBadge = (status: Customer['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'INACTIVE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'BLOCKED':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="p-3.5">Customer Code / Company</th>
              <th className="p-3.5">Country & Destination Port</th>
              <th className="p-3.5">Business Type</th>
              <th className="p-3.5">Payment Terms</th>
              <th className="p-3.5">Credit Limit (USD)</th>
              <th className="p-3.5">SFDA / Halal Compliance</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  {/* Customer Code / Company */}
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-emerald-400 block">
                      {c.customer_code}
                    </span>
                    <p className="font-bold text-white text-sm mt-0.5">{c.company_name}</p>
                  </td>

                  {/* Country & Destination Port */}
                  <td className="p-3.5 text-slate-300">
                    <span className="font-semibold text-white block">{c.primary_country}</span>
                    <span className="text-[11px] text-slate-400">{c.destination_port}</span>
                  </td>

                  {/* Business Type */}
                  <td className="p-3.5">
                    <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[10px] font-semibold border border-slate-700 uppercase">
                      {c.business_type.replace(/_/g, ' ')}
                    </span>
                  </td>

                  {/* Payment Terms */}
                  <td className="p-3.5 font-mono text-slate-200">
                    {c.payment_terms} ({c.preferred_currency})
                  </td>

                  {/* Credit Limit (USD) */}
                  <td className="p-3.5 font-mono text-emerald-400 font-bold">
                    ${c.credit_limit_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  {/* SFDA / Halal Compliance */}
                  <td className="p-3.5">
                    {c.sfda_registration_no ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                        <ShieldCheck className="h-3.5 w-3.5" /> SFDA Reg.
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 text-[11px]">
                        <AlertCircle className="h-3.5 w-3.5" /> Standard
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${getStatusBadge(
                        c.status
                      )}`}
                    >
                      {c.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 text-right">
                    <Link
                      href={`/customers/crm?customerId=${c.id}`}
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors font-medium"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
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
