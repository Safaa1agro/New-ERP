'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CRMOpportunity, CustomerComplaint } from '@/types/customer.types';
import { CRMPipelineBoard } from '@/components/customers/crm-pipeline-board';
import { CustomerComplaintsList } from '@/components/customers/customer-complaints-list';
import { CustomerCommLogs, CommLog } from '@/components/customers/communication-logs';
import { 
  Target, 
  RefreshCw, 
  PlusCircle, 
  AlertTriangle, 
  Filter, 
  X, 
  ArrowLeft, 
  ExternalLink 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface CustomerOption {
  id: string;
  company_name: string;
}

function CRMContent() {
  const searchParams = useSearchParams();
  const customerIdFilter = searchParams.get('customerId');

  const [opportunities, setOpportunities] = useState<CRMOpportunity[]>([]);
  const [complaints, setComplaints] = useState<CustomerComplaint[]>([]);
  const [commLogs, setCommLogs] = useState<CommLog[]>([]);
  const [customersList, setCustomersList] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState<string | null>(null);

  // Modal States
  const [isOppModalOpen, setIsOppModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States - Opportunity
  const [oppTitle, setOppTitle] = useState('');
  const [oppCommodity, setOppCommodity] = useState('');
  const [oppValue, setOppValue] = useState('');
  const [oppStage, setOppStage] = useState('NEW_LEAD');
  const [oppCustomerId, setOppCustomerId] = useState('');

  // Form States - Claim
  const [claimContainer, setClaimContainer] = useState('');
  const [claimIssueType, setClaimIssueType] = useState('TEMPERATURE_ABUSE');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimDescription, setClaimDescription] = useState('');
  const [claimCustomerId, setClaimCustomerId] = useState('');

  const loadCRMData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data: custs } = await supabase
        .from('customers')
        .select('id, company_name')
        .order('company_name');
      
      setCustomersList(custs || []);

      let oppQuery = supabase
        .from('crm_opportunities')
        .select('*, customers(company_name, primary_country)')
        .order('created_at', { ascending: false });

      let cmpQuery = supabase
        .from('customer_complaints')
        .select('*, customers(company_name)')
        .order('created_at', { ascending: false });

      let commQuery = supabase
        .from('customer_comm_logs')
        .select('*, customers(company_name)')
        .order('created_at', { ascending: false });

      if (customerIdFilter) {
        oppQuery = oppQuery.eq('customer_id', customerIdFilter);
        cmpQuery = cmpQuery.eq('customer_id', customerIdFilter);
        commQuery = commQuery.eq('customer_id', customerIdFilter);

        const { data: cust } = await supabase
          .from('customers')
          .select('company_name')
          .eq('id', customerIdFilter)
          .single<{ company_name: string }>();

        if (cust?.company_name) {
          setCustomerName(cust.company_name);
        }
      } else {
        setCustomerName(null);
      }

      const [{ data: opps }, { data: cmps }, { data: comms }] = await Promise.all([
        oppQuery, 
        cmpQuery, 
        commQuery
      ]);

      setOpportunities(opps || []);
      setComplaints(cmps || []);
      
      const formattedLogs: CommLog[] = (comms || []).map((c: any) => ({
        id: c.id,
        customer_name: c.customers?.company_name || 'General Inquiry',
        channel: c.channel || 'WHATSAPP',
        direction: c.direction || c.interaction_type || 'INBOUND',
        summary: c.summary || c.notes,
        logged_by: c.logged_by || 'System Administrator',
        created_at: c.created_at,
      }));
      setCommLogs(formattedLogs);

    } catch (err) {
      console.error('Failed to fetch CRM data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCRMData();
  }, [customerIdFilter]);

  useEffect(() => {
    if (customerIdFilter) {
      setOppCustomerId(customerIdFilter);
      setClaimCustomerId(customerIdFilter);
    }
  }, [customerIdFilter]);

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppCustomerId || !oppTitle) return alert('Please select a customer and enter a title.');

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const numericVal = parseFloat(oppValue) || 0;

      const { error } = await (supabase.from('crm_opportunities') as any).insert([
        {
          customer_id: oppCustomerId,
          title: oppTitle,
          target_commodity: oppCommodity,
          commodity: oppCommodity,
          estimated_annual_value_usd: numericVal,
          estimated_value_usd: numericVal,
          stage: oppStage,
        },
      ]);

      if (error) throw error;

      setIsOppModalOpen(false);
      setOppTitle('');
      setOppCommodity('');
      setOppValue('');
      loadCRMData();
    } catch (err: any) {
      console.error('Error creating opportunity:', err);
      alert(`Failed to save opportunity: ${err.message || err.details || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimCustomerId || !claimDescription) {
      return alert('Please select a customer and enter an issue description.');
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const numericAmount = parseFloat(claimAmount) || 0;
      
      const ticketCode = `CMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const { error } = await (supabase.from('customer_complaints') as any).insert([
        {
          customer_id: claimCustomerId,
          complaint_code: ticketCode,
          ticket_number: ticketCode,
          issue_type: claimIssueType,
          complaint_type: claimIssueType,
          container_no: claimContainer || null,
          shipment_container_no: claimContainer || null,
          claim_amount_usd: numericAmount,
          description: claimDescription,
          status: 'LOGGED',
        },
      ]);

      if (error) throw error;

      setIsClaimModalOpen(false);
      setClaimContainer('');
      setClaimAmount('');
      setClaimDescription('');
      loadCRMData();
    } catch (err: any) {
      console.error('Error logging quality claim:', err);
      alert(`Failed to log quality claim: ${err.message || err.details || 'Unknown database error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-full min-h-screen bg-slate-950 text-slate-100">
      
      {/* UNIFIED SINGLE HEADER BAR */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/customers"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Customers
            </Link>
            <h1 className="text-base font-black text-white flex items-center gap-1.5 ml-1">
              <Target className="h-5 w-5 text-amber-500" /> CRM & Export Sales Engine
            </h1>
          </div>

          {customerName && (
            <div className="inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
              <Filter className="h-3 w-3" />
              <span>Filtered: <strong className="text-white">{customerName}</strong></span>
              <Link href={`/customers/${customerIdFilter}`} className="hover:text-white underline ml-1 inline-flex items-center gap-0.5">
                360° Profile <ExternalLink className="w-3 h-3" />
              </Link>
              <Link href="/customers/crm" className="hover:text-white ml-1 text-slate-400">
                <X className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsOppModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" /> New Opportunity
          </button>

          <button
            onClick={() => setIsClaimModalOpen(true)}
            className="flex items-center gap-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            <AlertTriangle className="h-3.5 w-3.5" /> Log Quality Claim
          </button>

          <button
            onClick={loadCRMData}
            disabled={loading}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-amber-500' : ''}`} />
            Sync
          </button>
        </div>
      </div>

      {/* CRM Stage Kanban Board */}
      <CRMPipelineBoard 
        opportunities={opportunities} 
        onRefresh={loadCRMData} 
      />

      {/* Quality Complaints & Claims Management */}
      <CustomerComplaintsList 
        complaints={complaints} 
        onRefresh={loadCRMData} 
      />

      {/* Customer Communication & Interaction Logs */}
      <CustomerCommLogs 
        logs={commLogs} 
        customers={customersList}
        selectedCustomerId={customerIdFilter}
        onLogAdded={loadCRMData}
      />

      {/* MODAL: New Opportunity */}
      {isOppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-emerald-400" /> Create Export Opportunity
              </h2>
              <button onClick={() => setIsOppModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Customer</label>
                <select
                  value={oppCustomerId}
                  onChange={(e) => setOppCustomerId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                  required
                >
                  <option value="">Select Customer...</option>
                  {customersList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Opportunity / Deal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly Air-Freight Mutton Contract"
                  value={oppTitle}
                  onChange={(e) => setOppTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Commodity</label>
                  <input
                    type="text"
                    placeholder="e.g. Chilled Mutton / Mangoes"
                    value={oppCommodity}
                    onChange={(e) => setOppCommodity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Est. Value (USD)</label>
                  <input
                    type="number"
                    placeholder="650000"
                    value={oppValue}
                    onChange={(e) => setOppValue(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Pipeline Stage</label>
                <select
                  value={oppStage}
                  onChange={(e) => setOppStage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                >
                  <option value="NEW_LEAD">NEW LEAD</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="RFQ_RECEIVED">RFQ RECEIVED</option>
                  <option value="QUOTATION_SENT">QUOTATION SENT</option>
                  <option value="SAMPLE_SENT">SAMPLE SENT</option>
                  <option value="CONTRACT_SIGNED">CONTRACT SIGNED</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOppModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Log Quality Claim */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" /> Log Quality & Non-Conformance Ticket
              </h2>
              <button onClick={() => setIsClaimModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClaim} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Customer</label>
                <select
                  value={claimCustomerId}
                  onChange={(e) => setClaimCustomerId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-rose-500"
                  required
                >
                  <option value="">Select Customer...</option>
                  {customersList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Issue Type</label>
                  <select
                    value={claimIssueType}
                    onChange={(e) => setClaimIssueType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-rose-500"
                  >
                    <option value="TEMPERATURE_ABUSE">TEMPERATURE ABUSE</option>
                    <option value="WEIGHT_SHORTAGE">WEIGHT SHORTAGE</option>
                    <option value="PACKAGING_DEFECT">PACKAGING DEFECT</option>
                    <option value="DELAY_DAMAGE">DELAY / DAMAGE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Container # / AWB</label>
                  <input
                    type="text"
                    placeholder="HLXU-882918-4"
                    value={claimContainer}
                    onChange={(e) => setClaimContainer(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Claim Value (USD)</label>
                <input
                  type="number"
                  placeholder="1250.00"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Issue Description & Remarks</label>
                <textarea
                  rows={3}
                  placeholder="Describe damage, temperature breach, or customs delay..."
                  value={claimDescription}
                  onChange={(e) => setClaimDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-rose-500 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsClaimModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Log Claim Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CRMDashboardPage() {
  return (
    <Suspense fallback={<div className="p-4 text-slate-400 text-xs">Loading CRM Engine...</div>}>
      <CRMContent />
    </Suspense>
  );
}