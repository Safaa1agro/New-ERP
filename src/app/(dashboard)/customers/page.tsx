'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Customer } from '@/types/customer.types';
import { CustomerTable } from '@/components/customers/customer-table';
import { CustomerFormModal } from '@/components/customers/customer-form-modal';
import { Users, Globe, ShieldCheck, DollarSign, Kanban, Clock, Plus, Search } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
const [searchTerm, setSearchTerm] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomers(data);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // ==========================================
  // BULLETPROOF SUPABASE SCHEMALESS HELPERS
  // ==========================================

  // Extract Status
  const getStatus = (c: any) => {
    const val = c?.status ?? c?.customer_status ?? c?.stage ?? '';
    return String(val).toUpperCase().trim();
  };

  // Get raw compliance text
  const getComplianceText = (c: any) => {
    return String(c?.trade_compliance ?? c?.compliance_status ?? c?.compliance ?? '').toUpperCase().trim();
  };

  // Check if Compliance is Cleared / Verified
  const isComplianceCleared = (c: any) => {
    const text = getComplianceText(c);
    if (text.includes('CLEARED') || text.includes('VERIFIED') || text.includes('APPROVED')) return true;
    return c?.compliance_cleared === true || c?.compliance_cleared === 'true' || c?.compliance_cleared === 1;
  };

  // Check if Compliance is Pending Verification
  const isPendingCompliance = (c: any) => {
    if (isComplianceCleared(c)) return false;
    const text = getComplianceText(c);
    if (text.includes('PENDING') || text.includes('VERIF') || text.includes('UNDER')) return true;
    return c?.compliance_cleared === false || c?.compliance_cleared === 'false';
  };

  // Parse Credit Limit safely across numeric/string fields
  const parseCredit = (c: any) => {
    const val = c?.credit_limit_usd ?? c?.credit_limit ?? c?.approved_credit_limit ?? c?.creditLimit ?? 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^0-9.-]+/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // ==========================================
  // EXACT KPI CALCULATIONS FOR YOUR 5 RECORDS
  // ==========================================

  // CARD 1: Customer Status
  const activeCount = customers.filter(c => getStatus(c) === 'ACTIVE').length;
  const inactiveCount = customers.filter(c => getStatus(c) === 'INACTIVE').length;
  const blockedCount = customers.filter(c => getStatus(c) === 'BLOCKED').length;

  // CARD 2: Pipeline & Onboarding
  const outreachedCount = customers.filter(c => getStatus(c) === 'OUTREACHED').length;
  const underVerificationCount = customers.filter(c => 
    getStatus(c) === 'UNDER VERIFICATION' || getStatus(c) === 'UNDER_VERIFICATION'
  ).length;
  const pendingComplianceCount = customers.filter(c => isPendingCompliance(c)).length;
  const totalPipelineCount = customers.filter(c => 
  ['OUTREACHED', 'UNDER VERIFICATION', 'UNDER_VERIFICATION', 'LEAD'].includes(getStatus(c)) || isPendingCompliance(c)
).length;

  // CARD 3: Credit Limit
  const totalCreditLimit = customers.reduce((sum, c) => sum + parseCredit(c), 0);

  // CARD 4: Trade Readiness (Must be ACTIVE AND Compliance Cleared)
  const readyForTradeCount = customers.filter(c => getStatus(c) === 'ACTIVE' && isComplianceCleared(c)).length;
  const notReadyForTradeCount = customers.length - readyForTradeCount;

// === ADD FILTER LOGIC HERE (Right before Line 103) ===
  const filteredCustomers = customers.filter((customer) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();

    return (
      customer.customer_code?.toLowerCase().includes(query) ||
      customer.company_name?.toLowerCase().includes(query) ||
      customer.primary_country?.toLowerCase().includes(query) ||
      customer.destination_port?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Users className="w-7 h-7 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Importers & Global Customer Directory
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            International buyer registry, trade compliance status, credit terms & port destinations
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/customers/crm"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition"
          >
            <Kanban className="w-4 h-4 text-emerald-400" />
            CRM Sales Engine
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-sm font-bold rounded-xl transition shadow-lg shadow-emerald-500/20" cursor-pointer
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Register Importer
          </button>
        </div>
      </div>

      {/* TOP KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: CUSTOMER STATUS */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Customer Status
              </span>
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {activeCount} <span className="text-xs font-normal text-slate-400">Active</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] pt-2 border-t border-slate-800/80">
            <span className="text-emerald-400 font-medium">Active: {activeCount}</span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-400 font-medium">Inactive: {inactiveCount}</span>
            <span className="text-slate-500">|</span>
            <span className="text-rose-400 font-medium">Blocked: {blockedCount}</span>
          </div>
        </div>

        {/* CARD 2: PIPELINE & ONBOARDING */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Pipeline & Onboarding
              </span>
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-400 mb-2">
              {totalPipelineCount} <span className="text-xs font-normal text-slate-400">Importers</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] pt-2 border-t border-slate-800/80 text-slate-400">
            <span>Outreach: <b className="text-slate-200">{outreachedCount}</b></span>
            <span>•</span>
            <span>Verify: <b className="text-amber-400">{underVerificationCount}</b></span>
            <span>•</span>
            <span>Compliance: <b className="text-amber-400">{pendingComplianceCount}</b></span>
          </div>
        </div>

        {/* CARD 3: TOTAL CREDIT LIMIT */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Credit Limit
              </span>
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-400 mb-2">
              ${totalCreditLimit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
            Approved Commercial Risk
          </div>
        </div>

        {/* CARD 4: TRADE READINESS */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Trade Readiness
              </span>
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-emerald-400">{readyForTradeCount}</span>
              <span className="text-xs text-slate-400">Ready for Trade</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-800/80">
            <span className="text-emerald-400 font-semibold">Ready: {readyForTradeCount}</span>
            <span className="text-slate-500">|</span>
            <span className="text-rose-400 font-semibold">Not Ready: {notReadyForTradeCount}</span>
          </div>
        </div>

      </div>

{/* Search Bar & Counter */}
<div className="flex items-center justify-between gap-4 mb-4">
  <div className="relative flex-1 max-w-md">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
    <input
      type="text"
      placeholder="Search by Customer Code (e.g. SAF-IMP), Company, or Port..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
    />
    {searchTerm && (
      <button
        onClick={() => setSearchTerm('')}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
      >
        Clear
      </button>
    )}
  </div>

  <div className="text-xs text-slate-400 font-mono">
    Showing <span className="text-emerald-400 font-bold">{filteredCustomers.length}</span> of {customers.length} Importers
  </div>
</div>

      {/* ISOLATED TABLE WRAPPER (PREVENTS PAGE DISTORTION) */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
        <CustomerTable customers={filteredCustomers} loading={loading} onRefresh={loadCustomers} />
      </div>

      {/* MODAL FOR REGISTERING NEW IMPORTER */}
{isModalOpen && (
  <CustomerFormModal
  onClose={() => setIsModalOpen(false)}
    onSuccess={() => {
      setIsModalOpen(false);
      loadCustomers();
    }}
  />
)}
    </div>
  );
}