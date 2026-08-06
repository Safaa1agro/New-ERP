'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  PlusCircle,
  AlertTriangle,
  RotateCw,
  MessageSquare,
  Building2,
  Filter,
  ExternalLink,
  X,
  ShieldAlert,
  Calendar,
  Pencil,
  Trash2,
} from 'lucide-react';

import { CreateRequirementModal } from '@/components/suppliers/srm/create-requirement-modal';
import { LogQualityTicketModal } from '@/components/suppliers/srm/log-quality-ticket-modal';
import { LogCommunicationModal } from '@/components/suppliers/srm/log-communication-modal';

const KANBAN_STAGES = [
  { id: 'NEW REQUIREMENT', label: 'NEW REQUIREMENT' },
  { id: 'QUALIFIED', label: 'QUALIFIED' },
  { id: 'RFQ SENT', label: 'RFQ SENT' },
  { id: 'QUOTATION RECEIVED', label: 'QUOTATION RECEIVED' },
  { id: 'SAMPLE RECEIVED', label: 'SAMPLE RECEIVED' },
  { id: 'CONTRACT SIGNED', label: 'CONTRACT SIGNED' },
];

export default function SRMPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supplierIdFilter = searchParams.get('supplierId');

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const supParam = supplierIdFilter ? `?supplier_id=${supplierIdFilter}` : '';
      
      const [supRes, reqRes, tktRes, logRes] = await Promise.all([
        fetch('/api/suppliers'),
        fetch(`/api/srm/requirements${supParam}`),
        fetch(`/api/srm/quality-tickets${supParam}`),
        fetch(`/api/srm/communication-logs${supParam}`),
      ]);

      if (supRes.ok) setSuppliers(await supRes.json());
      if (reqRes.ok) setRequirements(await reqRes.json());
      if (tktRes.ok) setTickets(await tktRes.json());
      if (logRes.ok) setLogs(await logRes.json());
    } catch (err) {
      console.error('Failed to load SRM data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [supplierIdFilter]);

  const handleStageChange = async (reqId: string, newStage: string) => {
    try {
      const res = await fetch('/api/srm/requirements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reqId, stage: newStage }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTicketStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/srm/quality-tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticketId, status: newStatus }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const selectedSupplierName = supplierIdFilter
    ? suppliers.find((s) => s.id === supplierIdFilter)?.company_name || 'Selected Supplier'
    : null;

const getStatusBadgeStyle = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'CLAIM APPROVED':
    case 'APPROVED':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'UNDER INVESTIGATION':
    case 'INVESTIGATING':
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    case 'RESOLVED':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'REJECTED':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    case 'LOGGED':
    default:
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }
};

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-100">
      {/* SRM Top Header with CRM-Style Filter Pill */}
<div className="bg-slate-900/60 p-4 border border-slate-800 rounded-xl space-y-3">
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <Link
        href="/suppliers"
        className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg inline-flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Suppliers
      </Link>
      <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        SRM & Procurement Engine
      </h1>
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={() => setIsReqModalOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors"
      >
        <PlusCircle className="w-4 h-4" /> New Requirement
      </button>
      <button
        onClick={() => setIsTicketModalOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
      >
        <AlertTriangle className="w-4 h-4" /> Log Quality Claim
      </button>
      <button
        onClick={fetchData}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
        title="Sync Data"
      >
        <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync
      </button>
    </div>
  </div>

  {/* Active Supplier Filter Pill Badge (Matching CRM UI) */}
  {supplierIdFilter && (
    <div className="flex items-center gap-2 pt-1">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
          <Filter className="w-3.5 h-3.5" />
          Filtered: <span className="text-slate-100">{selectedSupplierName}</span>
        </span>

        <span className="text-slate-600">|</span>

        {/* 360° Profile Link */}
        <Link
          href={`/suppliers/${supplierIdFilter}`}
          className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline font-medium"
        >
          360° Profile <ExternalLink className="w-3 h-3" />
        </Link>

        {/* Clear Filter 'X' Button */}
        <button
          onClick={() => router.push('/suppliers/srm')}
          className="p-0.5 text-slate-400 hover:text-slate-100 rounded hover:bg-emerald-500/20 transition-colors ml-1"
          title="Clear Filter"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )}
</div>

      {/* Kanban Stage Pipeline Section */}
<div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2 w-full">
  
  {/* Stage Headers Row */}
  <div className="grid grid-cols-6 gap-1.5 pb-2 border-b border-slate-800 w-full">
    {KANBAN_STAGES.map((stage) => {
      const stageReqs = requirements.filter((r) => r.stage === stage.id);
      const stageTotal = stageReqs.reduce(
        (acc, curr) => acc + (Number(curr.est_value || curr.estimated_value) || 0),
        0
      );
      return (
        <div key={stage.id} className="bg-slate-800/40 border border-slate-800 rounded-lg p-1.5 min-w-0">
          <div className="flex items-center justify-between gap-1 min-w-0">
            <span className="text-[10px] font-bold tracking-wider text-slate-200 uppercase truncate min-w-0">
              {stage.label}
            </span>
            <span className="text-[9px] font-semibold px-1 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
              {stageReqs.length}
            </span>
          </div>
          <p className="text-[10px] font-semibold text-emerald-400 mt-0.5 truncate">
            Total: PKR: {stageTotal.toLocaleString()}
          </p>
        </div>
      );
    })}
  </div>

  {/* Single Vertical Scrollbar Controls All Columns */}
  <div className="max-h-[380px] overflow-y-auto mt-2 pr-1.5 scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-slate-800/60">
    <div className="grid grid-cols-6 gap-1.5 items-start w-full">
      {KANBAN_STAGES.map((stage) => {
        const stageReqs = requirements.filter((r) => r.stage === stage.id);

        return (
          <div key={stage.id} className="space-y-1.5 min-w-0">
            {stageReqs.length === 0 ? (
              <div className="py-4 flex items-center justify-center border border-dashed border-slate-800/80 rounded-lg bg-slate-900/30">
                <span className="text-[10px] text-slate-500 font-medium">Empty</span>
              </div>
            ) : (
              stageReqs.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 rounded-lg p-2 transition-all space-y-1.5 shadow-sm min-w-0"
                >
                  <h4 className="text-[11px] font-bold text-slate-100 leading-tight line-clamp-2 break-words">
                    {req.title}
                  </h4>

                  {req.suppliers?.company_name && (
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium min-w-0">
                      <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate min-w-0">{req.suppliers.company_name}</span>
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-700/50 text-[10px]">
                    <span className="font-semibold text-emerald-400 truncate">
                      PKR {Number(req.est_value || req.estimated_value || 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-500 shrink-0">
                      {req.created_at ? new Date(req.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>

                  {/* Stage Selector */}
                  <div className="pt-0.5 min-w-0">
                    <select
                      value={req.stage}
                      onChange={(e) => handleStageChange(req.id, e.target.value)}
                      className="w-full text-[9px] bg-slate-900 border border-slate-700 text-slate-300 rounded px-1 py-0.5 focus:outline-none focus:border-emerald-500 truncate"
                    >
                      {KANBAN_STAGES.map((s) => (
                        <option key={s.id} value={s.id}>
                          Move: {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      })}
    </div>
  </div>

</div>

      {/* 2. QUALITY & NON-CONFORMANCE TICKETS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        {/* Header Row */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Supplier Quality & Non-Conformance Tickets
            </h3>
            <p className="text-xs text-slate-400">Track quality breaches, temperature logs, packaging defects, and claims.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
              Total: {tickets.length}
            </span>
            <button
              onClick={() => {
                setSelectedTicket(null);
                setIsTicketModalOpen(true);
              }}
              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors flex items-center gap-1"
            >
              + Log Quality Claim
            </button>
          </div>
        </div>

        {/* Tickets List Container */}
        <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-slate-800/60">
          {tickets.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-6 bg-slate-950/40 rounded-lg border border-dashed border-slate-800">
              No quality tickets logged.
            </div>
          ) : (
            tickets.map((tkt) => {
              // Bug 3 Fix: Format as Supplier ID + CMP + Numbers
              const suppId = tkt.supplier_id || tkt.suppliers?.supplier_code || 'SUP';
              const rawCode = tkt.ticket_code || tkt.id;
              const formattedTicketCode = rawCode.includes('CMP')
                ? rawCode
                : `${suppId}-CMP-${rawCode}`;

              return (
                <div
                  key={tkt.id}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all"
                >
                  {/* Left Side: Ticket Code, Supplier Name, Issue Type Tag, Batch Code, Description */}
                  <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                    {/* Yellow/Amber Ticket ID Badge (Bug 3 Fix) */}
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                      {formattedTicketCode}
                    </span>

                    {/* Supplier Name */}
                    <span className="font-bold text-slate-100 truncate max-w-[180px]">
                      {tkt.suppliers?.company_name || tkt.suppliers?.company_or_farm_name || 'abcd Farams'}
                    </span>

                    {/* Category / Issue Type Tag */}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-rose-950/80 text-rose-400 border border-rose-800 shrink-0">
                      {tkt.issue_type}
                    </span>

                    {/* Batch / PO Code */}
                    {tkt.batch_po_no && (
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                        <ShieldAlert className="w-3 h-3 text-slate-500" />
                        {tkt.batch_po_no}
                      </span>
                    )}

                    {/* Description Subtext */}
                    {tkt.description && (
                      <p className="w-full text-xs text-slate-300 italic truncate mt-0.5">
                        {tkt.description}
                      </p>
                    )}
                  </div>

                  {/* Right Side: PKR Amount, Status Badge + Selector, Date Icon, Edit & Delete */}
                  <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0">
                    {/* Claim Amount in PKR */}
                    <span className="font-mono text-xs font-bold text-rose-400">
                      PKR {Number(tkt.claim_value || 0).toLocaleString()}
                    </span>

                    {/* NEW DYNAMIC COLOR BADGE */}
<span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border shrink-0 ${getStatusBadgeStyle(tkt.status)}`}>
  {tkt.status || 'LOGGED'}
</span>

                    {/* Status Dropdown Selector */}
                    <select
                      value={tkt.status || 'LOGGED'}
                      onChange={(e) => handleTicketStatusChange(tkt.id, e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                    >
                      <option value="LOGGED">Set Status: LOGGED</option>
                      <option value="CLAIM APPROVED">Set Status: APPROVED</option>
                      <option value="RESOLVED">Set Status: RESOLVED</option>
                      <option value="REJECTED">Set Status: REJECTED</option>
                    </select>

                    {/* Calendar Icon + Date */}
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {tkt.created_at ? new Date(tkt.created_at).toLocaleDateString() : ''}
                    </span>

                    {/* Edit & Delete Actions */}
                    <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                      <button
                        onClick={() => {
                          setSelectedTicket(tkt);
                          setIsTicketModalOpen(true);
                        }}
                        title="Edit Ticket"
                        className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      
                      {/* Bug 1 Fix: Corrected endpoint path to /api/srm/quality-tickets */}
                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this ticket?')) {
                            const res = await fetch(`/api/srm/quality-tickets?id=${tkt.id}`, {
                              method: 'DELETE',
                            });
                            if (res.ok) {
                              setTickets((prev) => prev.filter((item) => item.id !== tkt.id));
                            } else {
                              alert('Failed to delete ticket from database.');
                            }
                          }
                        }}
                        title="Delete Ticket"
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
        
      
      {/* 3. COMMUNICATION & ACTIVITY LOGS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Supplier Communication & Activity Logs
            </h3>
            <p className="text-xs text-slate-400">Track price discussions, WhatsApp interactions, and contract updates.</p>
          </div>
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg"
          >
            <PlusCircle className="w-4 h-4" /> Log Activity
          </button>
        </div>

        <div className="space-y-2">
          {logs.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-6 bg-slate-950/40 rounded-lg border border-dashed border-slate-800">
              No activity logs recorded.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-slate-100">
                      {log.suppliers?.company_name || log.suppliers?.company_or_farm_name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/80 text-blue-400 border border-blue-800">
                      {log.direction.includes('Inbound') ? '↙ SUPPLIER REPLY' : '↗ SAFAA RESPONSE'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">[{log.channel}]</span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2">
                    <span>👤 {log.created_by}</span>
                    <span>{new Date(log.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 pl-6">{log.notes}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateRequirementModal
        isOpen={isReqModalOpen}
        suppliers={suppliers}
        defaultSupplierId={supplierIdFilter}
        onClose={() => setIsReqModalOpen(false)}
        onSuccess={fetchData}
      />
      <LogQualityTicketModal
          isOpen={isTicketModalOpen}
          suppliers={suppliers}
          defaultSupplierId={supplierIdFilter}
          ticket={selectedTicket}
          onClose={() => {
            setIsTicketModalOpen(false);
            setSelectedTicket(null);
          }}
          onSuccess={fetchData}
        />
      <LogCommunicationModal
        isOpen={isLogModalOpen}
        suppliers={suppliers}
        defaultSupplierId={supplierIdFilter}
        onClose={() => setIsLogModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}