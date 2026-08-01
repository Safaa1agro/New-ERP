'use client';

import { CustomerComplaint } from '@/types/customer.types';
import { AlertTriangle, Container, DollarSign, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

interface Props {
  complaints: CustomerComplaint[];
  onRefresh?: () => void;
}

const TICKET_STATUSES = [
  { key: 'LOGGED', label: 'LOGGED' },
  { key: 'UNDER_INVESTIGATION', label: 'UNDER INVESTIGATION' },
  { key: 'CLAIM_APPROVED', label: 'CLAIM APPROVED' },
  { key: 'REJECTED', label: 'REJECTED' },
  { key: 'RESOLVED', label: 'RESOLVED' },
];

export function CustomerComplaintsList({ complaints = [], onRefresh }: Props) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (claimId: string, newStatus: string) => {
    setUpdatingId(claimId);
    try {
      const supabase = createClient();
      const { error } = await (supabase.from('customer_complaints') as any)
        .update({ status: newStatus })
        .eq('id', claimId);

      if (error) throw error;
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert('Failed to update ticket status: ' + (err.message || 'Error'));
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LOGGED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'UNDER_INVESTIGATION':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'CLAIM_APPROVED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'RESOLVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-400" /> Customer Quality & Non-Conformance Tickets
        </h3>
        <p className="text-[11px] text-slate-400">
          Export shipment issues, temperature breaches, weight claims & financial resolutions
        </p>
      </div>

      <div className="space-y-3">
        {complaints.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
            No active claims or quality tickets logged.
          </div>
        ) : (
          complaints.map((cmp) => (
            <div
              key={cmp.id}
              className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl text-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                    {cmp.complaint_code}
                  </span>
                  <span className="text-white font-semibold">{cmp.customers?.company_name}</span>
                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase border border-slate-700">
                    {(cmp.issue_type || 'GENERAL').replace('_', ' ')}
                  </span>
                  {cmp.container_no && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Container className="h-3 w-3" /> {cmp.container_no}
                    </span>
                  )}
                </div>

                {/* Status Updater */}
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusBadge(cmp.status)}`}>
                    {cmp.status.replace('_', ' ')}
                  </span>
                  <select
                    value={cmp.status}
                    disabled={updatingId === cmp.id}
                    onChange={(e) => handleStatusChange(cmp.id, e.target.value)}
                    className="bg-slate-800 text-slate-200 text-[10px] border border-slate-700 rounded p-1 outline-none font-medium"
                  >
                    {TICKET_STATUSES.map((s) => (
                      <option key={s.key} value={s.key}>
                        Set Status: {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed">{cmp.description}</p>

              <div className="flex justify-between items-center text-[11px] pt-1 text-slate-400 font-mono">
                <span className="flex items-center text-rose-400 font-bold">
                  Claim: ${Number(cmp.claim_amount_usd || 0).toLocaleString()}
                </span>
                <span>Logged: {new Date(cmp.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}