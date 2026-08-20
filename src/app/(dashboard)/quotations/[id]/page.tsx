'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, ShieldCheck, Loader2, Calendar, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function QuotationDossierPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const quotationId = params?.id as string;
  const [quote, setQuote] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quotationId) return;

    async function fetchDossierData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('quotations')
          .select('*')
          .eq('id', quotationId)
          .maybeSingle();

        if (error) throw error;
        setQuote(data);
      } catch (err) {
        console.error('Error loading KYQ Dossier:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDossierData();
  }, [quotationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-xs">Loading Know Your Quotation (KYQ) Dossier...</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-[#0b0f17] p-8 text-slate-100 flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold text-rose-400">Quotation Record Not Found</h2>
        <p className="text-xs text-slate-400">The requested quotation ID parameter is invalid or missing from the database.</p>
        <button
          onClick={() => router.push('/quotations')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const baseProductTotal = (quote.total_units || 0) * (quote.product_price || 0);
  const currentStatus = quote.status || 'Pending';

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div id="kyq-printable-dossier" className="p-6 space-y-6 bg-[#0b0f17] min-h-screen text-slate-100">
      
      {/* Print CSS Isolation Rules */}
      <style jsx global>{`
        @media print {
          /* Hide everything in the body including parent layouts and sidebars */
          body * {
            visibility: hidden !important;
          }
          
          /* Make only the KYQ dossier and its children visible */
          #kyq-printable-dossier,
          #kyq-printable-dossier * {
            visibility: visible !important;
          }

          /* Position the dossier to cover the whole printable page */
          #kyq-printable-dossier {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background-color: #0b0f17 !important;
            color: #f8fafc !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide UI controls during print */
          .print-hide {
            display: none !important;
          }

          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>
      
      {/* Dossier Header */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/quotations')}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition print-hide"
            title="Back to Directory"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black text-white font-mono">{quote.quotation_number}</h1>
              
              <span className={`px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1 uppercase ${
                currentStatus === 'Approved'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : currentStatus === 'Rejected'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {currentStatus}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-1">
              Know Your Quotation Dossier — Safaa Agro Farms Commercial Export System
            </p>
          </div>
        </div>

        {/* Date Meta & Download Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 text-xs bg-[#0b0f17] border border-slate-800 px-3 py-2 rounded-xl">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span><strong>Issued:</strong> {formatDate(quote.created_at)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300 border-l border-slate-800 pl-3">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span><strong>Valid Until:</strong> {formatDate(quote.valid_until)}</span>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/10 print-hide"
          >
            <Download className="w-4 h-4" /> Download Commercial PDF
          </button>
        </div>
      </div>

      {/* Grid Summary Dossier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tab 1 Card */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            Tab 1: Customer Profile
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Customer Name</span>
              <span className="font-bold text-white text-sm">{quote.customer_name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Registration No</span>
                <span className="font-mono text-slate-300">{quote.registration_number || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Business Category</span>
                <span className="text-slate-300">{quote.business_category || 'N/A'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Primary Country</span>
                <span className="text-slate-300">{quote.primary_country || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Destination Port</span>
                <span className="text-slate-300">{quote.destination_port || 'N/A'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-slate-800/60 pt-2">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Quotation Issue Date</span>
                <span className="font-mono text-slate-200">{formatDate(quote.created_at)}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Validity Expiry Date</span>
                <span className="font-mono text-amber-400 font-bold">{formatDate(quote.valid_until)}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Export Payment Terms</span>
              <span className="px-2.5 py-1 bg-slate-800 text-emerald-400 font-bold rounded-md inline-block mt-1">
                {quote.payment_terms}
              </span>
            </div>
          </div>
        </div>

        {/* Tab 2 & 3 Card */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            Tab 2 & 3: Product Master & Cold Chain
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Export Trade Name</span>
              <span className="font-bold text-white text-sm">{quote.product_name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">WebOC HS Code</span>
                <span className="font-mono text-emerald-400">{quote.hs_code || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Product Category</span>
                <span className="text-slate-300">{quote.product_category || 'N/A'}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Origin Region</span>
              <span className="text-slate-300">{quote.origin_region || 'Punjab, Pakistan'}</span>
            </div>
            <div className="p-3 bg-[#0b0f17] border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 uppercase">Cold-Chain Profile</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">
                  {quote.storage_type || 'CHILLED'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                <div>
                  <span className="text-[10px] text-slate-500 block">Optimal Temp</span>
                  <span className="font-mono text-slate-200">{quote.optimal_temp_c || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Shelf Life</span>
                  <span className="font-mono text-slate-200">{quote.shelf_life_days} Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 4 Card */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            Tab 4: Packing & Cargo Configuration
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Packing Configuration Name</span>
              <span className="font-bold text-white">{quote.configuration_name || 'Standard Export Packaging'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Cargo Transport Mode</span>
                <span className="px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold rounded-md inline-block mt-1">
                  {quote.cargo_type}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Base Unit</span>
                <span className="text-slate-300">{quote.unit_of_measure}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#0b0f17] rounded-xl text-center">
              <div>
                <span className="text-[9px] text-slate-500 block">Net Wt</span>
                <span className="font-mono font-bold text-slate-200">{quote.net_weight_kg} KG</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block">Gross Wt</span>
                <span className="font-mono font-bold text-slate-200">{quote.gross_weight_kg} KG</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block">CBM/Unit</span>
                <span className="font-mono font-bold text-emerald-400">{quote.cbm_per_unit}</span>
              </div>
            </div>
            <div className="p-3 bg-[#0b0f17] border border-slate-800 rounded-xl grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block">Total Units Quantity</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {quote.total_units} {quote.unit_of_measure}s
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Calculated Volume</span>
                <span className="font-mono font-bold text-slate-200 text-sm">
                  {quote.calculated_total_cbm} CBM
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Tab 5 Pricing Table */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            Tab 5: Complete Export Pricing & Financial Breakdown
          </h2>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
            Incoterm Selected: {quote.incoterm}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0b0f17] text-slate-400 uppercase font-semibold">
                <th className="p-3">Cost Component Description</th>
                <th className="p-3">Rate / Basis</th>
                <th className="p-3">Applicable Status</th>
                <th className="p-3 text-right">Calculated Amount ({quote.currency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="p-3 font-semibold">Base Product Price ({quote.total_units} {quote.unit_of_measure}s)</td>
                <td className="p-3 font-mono">${quote.product_price} / {quote.unit_of_measure}</td>
                <td className="p-3 text-emerald-400">Included</td>
                <td className="p-3 text-right font-mono font-bold">${baseProductTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Freight Shipping Charge</td>
                <td className="p-3">Spot Carrier Rate</td>
                <td className="p-3 text-slate-400">{quote.freight_cost > 0 ? 'Applied' : 'Excluded'}</td>
                <td className="p-3 text-right font-mono">${Number(quote.freight_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Marine / Cargo Export Insurance</td>
                <td className="p-3">Commercial Coverage</td>
                <td className="p-3 text-slate-400">{quote.insurance_cost > 0 ? 'Applied' : 'Excluded'}</td>
                <td className="p-3 text-right font-mono">${Number(quote.insurance_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Customs Clearance & Documentation</td>
                <td className="p-3">Terminal Fee</td>
                <td className="p-3 text-slate-400">{quote.custom_cost > 0 ? 'Applied' : 'Excluded'}</td>
                <td className="p-3 text-right font-mono">${Number(quote.custom_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Other Inspections & Certifications</td>
                <td className="p-3">{quote.other_cost_details || 'Regulatory Charges'}</td>
                <td className="p-3 text-slate-400">{quote.other_costs > 0 ? 'Applied' : 'Excluded'}</td>
                <td className="p-3 text-right font-mono">${Number(quote.other_costs || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-emerald-400">Target Profit Margin Applied</td>
                <td className="p-3 font-mono text-emerald-400">{quote.target_margin_pct}% Margin</td>
                <td className="p-3 text-emerald-400 font-bold">Applied</td>
                <td className="p-3 text-right font-mono font-bold text-emerald-400">+ Margin Included</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-[#0b0f17] p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 mt-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Calculated Shipment Grand Total Value
            </span>
            <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
              {quote.currency} ${Number(quote.grand_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Commercial Offer Terms Verified — Generated by Safaa Agro Farms ERP Quotation Engine
          </span>
        </div>
      </div>

    </div>
  );
}
