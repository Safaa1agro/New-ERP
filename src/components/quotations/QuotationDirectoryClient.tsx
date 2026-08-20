'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Edit3, 
  Trash2, 
  Eye, 
  Plane, 
  Ship 
} from 'lucide-react';
import QuotationFormModal, { CustomerData, ProductData } from './QuotationFormModal';

interface QuotationItem {
  id: string;
  quotationNumber: string;
  customerName: string;
  productName: string;
  countryName: string;
  tempSpecs: string;
  cargoType: 'Air' | 'Sea';
  quantityDisplay: string;
  amountCurrency: number;
  currency: string;
  status: string;
}

interface Props {
  initialQuotations: QuotationItem[];
  customers: CustomerData[];
  products: ProductData[];
}

export default function QuotationDirectoryClient({
  initialQuotations,
  customers,
  products,
}: Props) {
  const [quotations, setQuotations] = useState<QuotationItem[]>(initialQuotations);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // KPI Calculations
  const totalCount = quotations.length;
  const totalAmount = quotations.reduce((acc, q) => acc + q.amountCurrency, 0);

  const approvedList = quotations.filter((q) => ['APPROVED', 'ACCEPTED'].includes(q.status.toUpperCase()));
  const approvedCount = approvedList.length;
  const approvedAmount = approvedList.reduce((acc, q) => acc + q.amountCurrency, 0);

  const pendingList = quotations.filter((q) => ['PENDING', 'DRAFT', 'SENT'].includes(q.status.toUpperCase()));
  const pendingCount = pendingList.length;
  const pendingAmount = pendingList.reduce((acc, q) => acc + q.amountCurrency, 0);

  const rejectedList = quotations.filter((q) => ['REJECTED', 'CANCELLED', 'EXPIRED'].includes(q.status.toUpperCase()));
  const rejectedCount = rejectedList.length;
  const rejectedAmount = rejectedList.reduce((acc, q) => acc + q.amountCurrency, 0);

  // Search Filter
  const filteredQuotations = quotations.filter((q) => {
    const term = searchTerm.toLowerCase();
    return (
      q.quotationNumber.toLowerCase().includes(term) ||
      q.customerName.toLowerCase().includes(term) ||
      q.productName.toLowerCase().includes(term) ||
      q.countryName.toLowerCase().includes(term)
    );
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this quotation?')) {
      setQuotations((prev) => prev.filter((q) => q.id !== id));
    }
  };

  // Handle saving new quotation from Modal
  const handleSaveQuotation = (formData: any) => {
    const newQuote: QuotationItem = {
      id: `tmp-${Date.now()}`,
      quotationNumber: formData.quotationNumber,
      customerName: formData.customerName || 'Selected Customer',
      productName: formData.productName || 'Selected Product',
      countryName: formData.primaryCountry || 'Pakistan',
      tempSpecs: formData.optimalTempC ? `${formData.optimalTempC}` : 'Chilled',
      cargoType: formData.cargoType === 'AIR' ? 'Air' : 'Sea',
      quantityDisplay: `${formData.totalUnits} ${formData.unitOfMeasure} / ${formData.totalCbm} CBM`,
      amountCurrency: formData.grandTotal,
      currency: formData.currency,
      status: 'DRAFT',
    };

    setQuotations((prev) => [newQuote, ...prev]);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto text-slate-100 space-y-6">
      {/* Header & New Quotation Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131b2e] p-6 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-emerald-400" /> Export Quotations Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage spot rate calculations, thermal compliance, and active customer commercial proposals.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-sm transition shadow-lg shadow-emerald-500/10"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> New Quotation
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#131b2e] p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>TOTAL QUOTATIONS</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalCount} <span className="text-xs font-normal text-slate-400">Records</span></div>
          <div className="text-xs text-emerald-400 font-medium">
            Total: USD ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-[#131b2e] p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>APPROVED QUOTATIONS</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{approvedCount} <span className="text-xs font-normal text-slate-400">Approved</span></div>
          <div className="text-xs text-emerald-400 font-medium">
            Total: USD ${approvedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-[#131b2e] p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>PENDING QUOTATIONS</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{pendingCount} <span className="text-xs font-normal text-slate-400">Pending</span></div>
          <div className="text-xs text-amber-400 font-medium">
            Total: USD ${pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-[#131b2e] p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>REJECTED QUOTATIONS</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white">{rejectedCount} <span className="text-xs font-normal text-slate-400">Rejected</span></div>
          <div className="text-xs text-rose-400 font-medium">
            Total: USD ${rejectedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#131b2e] p-4 rounded-xl border border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Quotation Number, Customer, Product, or Country..."
          className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Quotations Directory Table */}
      <div className="bg-[#131b2e] rounded-xl border border-slate-800 overflow-hidden">
        <div className="max-h-[520px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b0f17] text-slate-400 font-semibold sticky top-0 border-b border-slate-800 z-10 uppercase tracking-wider">
              <tr>
                <th className="p-4">Quotation No</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Country</th>
                <th className="p-4">Temp Specs</th>
                <th className="p-4">Cargo Type</th>
                <th className="p-4">Quantity</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredQuotations.length > 0 ? (
                filteredQuotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-4 font-mono font-bold text-emerald-400">{q.quotationNumber}</td>
                    <td className="p-4 font-medium text-slate-200">{q.customerName}</td>
                    <td className="p-4 text-slate-300">{q.productName}</td>
                    <td className="p-4 text-slate-300">{q.countryName}</td>
                    <td className="p-4 text-slate-300">
                      <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[11px] border border-slate-700">
                        {q.tempSpecs}
                      </span>
                    </td>
                    <td className="p-4">
                      {q.cargoType === 'Air' ? (
                        <span className="inline-flex items-center gap-1 bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded text-[11px] border border-sky-500/20">
                          <Plane className="w-3 h-3" /> Air
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-[11px] border border-indigo-500/20">
                          <Ship className="w-3 h-3" /> Sea
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-300">{q.quantityDisplay}</td>
                    <td className="p-4 text-right font-bold text-slate-100">
                      {q.currency} ${q.amountCurrency.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Actions Column */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={`/quotations/${q.id}`}
                          title="Know Your Quotation (KYQ)"
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition flex items-center gap-1 text-[11px] font-semibold px-2"
                        >
                          <Eye className="w-3.5 h-3.5" /> KYQ
                        </a>

                        <button
                          onClick={() => alert(`Edit quotation ${q.quotationNumber}`)}
                          title="Edit Quotation"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(q.id)}
                          title="Delete Quotation"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No quotations found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Linked Multi-Tab Quotation Modal */}
      <QuotationFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        customers={customers}
        products={products}
        onSave={handleSaveQuotation}
      />
    </div>
  );
}