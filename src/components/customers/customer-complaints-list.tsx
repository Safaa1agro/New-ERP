'use client';

import { CustomerComplaint } from '@/types/customer.types';
import { AlertTriangle, Container, DollarSign, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

interface Props {
  complaints: CustomerComplaint[];
  onRefresh?: () => void;
}

const TICKET_STATUSES = [
  { key: 'LOGGED', label: 'LOGGED' },
  { key: 'UNDER_INVESTIGATION', label: 'INVESTIGATING' },
  { key: 'CLAIM_APPROVED', label: 'APPROVED' },
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
    <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-3">
      {/* Compact Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <div>
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-rose-400" /> Customer Quality & Non-Conformance Tickets
          </h3>
          <p className="text-[10px] text-slate-400">
            Export shipment issues, temperature breaches, weight claims & financial resolutions
          </p>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
          Total: {complaints.length}
        </span>
      </div>

      {/* Fixed Height Scroll Container */}
      {complaints.length === 0 ? (
        <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800/80 rounded-lg">
          No active claims or quality tickets logged.
        </div>
      ) : (
        <div className="max-h-[260px] overflow-y-auto space-y-1.5 pr-1">
          {complaints.map((cmp) => (
            <div
              key={cmp.id}
              className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 p-2.5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs transition-colors"
            >
              {/* Ticket Details */}
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    {cmp.complaint_code || cmp.ticket_number || 'TICKET'}
                  </span>
                  <span className="text-white font-bold">
                    {cmp.customers?.company_name || 'Customer'}
                  </span>
                  <span className="bg-slate-800 text-slate-300 text-[10px] uppercase border border-slate-700 px-1.5 py-0.5 rounded">
                    {(cmp.issue_type || cmp.complaint_type || 'GENERAL').replace('_', ' ')}
                  </span>
                  {cmp.container_no && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Container className="h-3 w-3 text-slate-500" /> {cmp.container_no}
                    </span>
                  )}
                </div>

                <p className="text-slate-300 text-[11px] line-clamp-1">
                  {cmp.description}
                </p>
              </div>

              {/* Status & Amount Controls */}
              <div className="flex items-center gap-3 shrink-0 justify-between md:justify-end border-t md:border-t-0 border-slate-800/80 pt-1.5 md:pt-0">
                <span className="text-rose-400 font-bold text-xs flex items-center gap-0.5 font-mono">
                  <DollarSign className="w-3 h-3" />
                  {Number(cmp.claim_amount_usd || 0).toLocaleString()}
                </span>

                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${getStatusBadge(cmp.status)}`}>
                    {cmp.status.replace('_', ' ')}
                  </span>

                  <select
                    value={cmp.status}
                    disabled={updatingId === cmp.id}
                    onChange={(e) => handleStatusChange(cmp.id, e.target.value)}
                    className="bg-slate-900 text-slate-200 text-[11px] border border-slate-700 rounded px-1.5 py-0.5 outline-none font-medium focus:border-amber-500"
                  >
                    {TICKET_STATUSES.map((s) => (
                      <option key={s.key} value={s.key}>
                        Set Status: {s.label}
                      </option>
                    ))}
                  </select>

                  <span className="text-[10px] text-slate-500 flex items-center gap-0.5 font-mono">
                    <Calendar className="w-2.5 h-2.5" />
                    {new Date(cmp.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}