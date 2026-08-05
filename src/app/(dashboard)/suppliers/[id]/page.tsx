'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Supplier } from '@/types/supplier.types';
import { Supplier360Header } from '@/components/suppliers/supplier-360-header';
import { SupplierProductsTab } from '@/components/suppliers/tabs/supplier-products-tab';
import { SupplierSamplesTab } from '@/components/suppliers/tabs/supplier-samples-tab';
import { SupplierOrdersTab } from '@/components/suppliers/tabs/supplier-orders-tab';
import { SupplierPaymentsTab } from '@/components/suppliers/tabs/supplier-payments-tab';
import { SupplierDocumentsTab } from '@/components/suppliers/tabs/supplier-documents-tab';
import { SupplierComplaintsTab } from '@/components/suppliers/tabs/supplier-complaints-tab';

export default function Supplier360Page() {
  const params = useParams();
  const supplierId = params.id as string;

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'samples' | 'orders' | 'payments' | 'documents' | 'complaints'
  >('overview');
  const [loading, setLoading] = useState(true);

  const fetchSupplierDetails = async () => {
    try {
      const res = await fetch(`/api/suppliers/${supplierId}`);
      if (res.ok) {
        const data = await res.json();
        setSupplier(data);
      }
    } catch (err) {
      console.error('Failed to load supplier details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supplierId) fetchSupplierDetails();
  }, [supplierId]);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading 360° Supplier Profile...</div>;
  }

  if (!supplier) {
    return <div className="p-8 text-center text-rose-400">Supplier not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      <Supplier360Header supplier={supplier} />

      <div className="border-b border-slate-800 flex gap-2 overflow-x-auto custom-scrollbar">
        {[
          { id: 'overview', label: 'Overview & Terms' },
          { id: 'products', label: 'Products & Catalog' },
          { id: 'samples', label: 'Sample Dispatches' },
          { id: 'orders', label: 'Purchase Orders' },
          { id: 'payments', label: 'Payments & Ledger' },
          { id: 'documents', label: 'KYC Documents' },
          { id: 'complaints', label: 'Quality Complaints' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-emerald-400 text-emerald-400 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-2">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Commercial & Payment Terms</h3>
              <p className="text-xs text-slate-400">Default Terms: <strong className="text-slate-200">{supplier.default_payment_terms || 'CASH_ON_DELIVERY'}</strong></p>
              <p className="text-xs text-slate-400">Compliance Ref: <strong className="text-slate-200">{supplier.internal_compliance_ref || 'N/A'}</strong></p>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <SupplierProductsTab
            supplierId={supplier.id}
            products={(supplier as any).supplier_products || []}
            onRefresh={fetchSupplierDetails}
          />
        )}

        {activeTab === 'samples' && (
          <SupplierSamplesTab
            samples={(supplier as any).supplier_samples || []}
            onRefresh={fetchSupplierDetails}
          />
        )}

        {activeTab === 'orders' && (
          <SupplierOrdersTab
            supplierId={supplier.id}
            orders={(supplier as any).purchase_orders || []}
            onRefresh={fetchSupplierDetails}
          />
        )}

        {activeTab === 'payments' && (
          <SupplierPaymentsTab
            supplierId={supplier.id}
            payments={(supplier as any).supplier_payments || []}
            onRefresh={fetchSupplierDetails}
          />
        )}

        {activeTab === 'documents' && (
          <SupplierDocumentsTab
            documents={(supplier as any).supplier_documents || []}
            onRefresh={fetchSupplierDetails}
          />
        )}

        {activeTab === 'complaints' && (
          <SupplierComplaintsTab complaints={(supplier as any).supplier_complaints || []} />
        )}
      </div>
    </div>
  );
}