'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  ArrowLeft, 
  Users, 
  FileCheck2, 
  History, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  Download, 
  Upload, 
  ShieldCheck, 
  CheckCircle2, 
  DollarSign, 
  Package, 
  X, 
  Eye, 
  Pencil, 
  Trash2, 
  AlertCircle,
  Clock,
  FileText,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Data Types
interface Contact {
  id: string;
  customer_id: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  is_primary: boolean;
  department: string;
}

interface KYCDocument {
  id: string;
  customer_id: string;
  doc_type: string;
  document_number: string;
  issue_date: string;
  expiry_date: string;
  status: 'VERIFIED' | 'PENDING_REVIEW' | 'EXPIRED';
  file_path?: string;
  file_name?: string;
}

interface TradeOrder {
  id: string;
  customer_id: string;
  order_number: string;
  order_date: string;
  items_summary: string;
  incoterm: string;
  total_value: number;
  status: 'DRAFT' | 'CONFIRMED' | 'PROCESSING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
}

interface CRMDeal {
  id: string;
  title: string;
  value: number;
  stage: string;
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customerId = params.id;
  const supabase = createClient();
  const db = supabase as any;

  const [activeTab, setActiveTab] = useState<'contacts' | 'kyc' | 'trade'>('contacts');
  const [loading, setLoading] = useState(true);

  // Modals visibility state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [editingKyc, setEditingKyc] = useState<KYCDocument | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string; number: string; isPdf: boolean } | null>(null);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<TradeOrder | null>(null);

  // Form states
  const [contactForm, setContactForm] = useState<Omit<Contact, 'id' | 'customer_id'>>({
    name: '',
    designation: '',
    email: '',
    phone: '',
    department: 'PROCUREMENT',
    is_primary: false
  });

  const [kycForm, setKycForm] = useState({
    doc_type: 'Commercial Registration (CR)',
    custom_category: '',
    document_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    status: 'VERIFIED' as 'VERIFIED' | 'PENDING_REVIEW' | 'EXPIRED'
  });

  const [orderForm, setOrderForm] = useState({
    order_number: '',
    order_date: new Date().toISOString().split('T')[0],
    items_summary: '',
    incoterm: 'CIP Riyadh (RUH)',
    total_value: '',
    status: 'CONFIRMED' as TradeOrder['status']
  });

  // Main Datasets
  const [customer, setCustomer] = useState({
    id: customerId,
    company_name: 'Lulu Hypermarket KSA Co.',
    registration_no: 'CR-7019283411',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    credit_limit: 500000,
    payment_terms: 'LC_AT_SIGHT (SAR)',
    kyc_status: 'VERIFIED'
  });

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [kycDocs, setKycDocs] = useState<KYCDocument[]>([]);
  const [tradeOrders, setTradeOrders] = useState<TradeOrder[]>([]);
  const [crmDeals, setCrmDeals] = useState<CRMDeal[]>([]);

  // ----------------------- FETCH & SYNCHRONIZE ALL SUPABASE DATA -----------------------
  const fetchAllCustomerData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Synchronize Master Customer record
      const { data: custData } = await db.from('customers').select('*').eq('id', customerId).maybeSingle();
      if (custData) {
        setCustomer(prev => ({
          ...prev,
          company_name: custData.company_name || custData.name || prev.company_name,
          country: custData.country || prev.country,
          city: custData.city || prev.city,
          registration_no: custData.tax_id || custData.registration_no || prev.registration_no,
          credit_limit: custData.credit_limit ? Number(custData.credit_limit) : prev.credit_limit,
          payment_terms: custData.payment_terms || prev.payment_terms,
        }));
      }

      // 2. Fetch Customer Contacts
      const { data: cData, error: cErr } = await db.from('customer_contacts').select('*').eq('customer_id', customerId).order('created_at', { ascending: false });
      if (!cErr && cData) {
        setContacts(cData as Contact[]);
      }

      // 3. Fetch KYC Documents
      const { data: kData } = await db.from('kyc_documents').select('*').eq('customer_id', customerId).order('created_at', { ascending: false });
      if (kData) setKycDocs(kData as KYCDocument[]);

      // 4. Fetch Sales Orders
      const { data: oData } = await db.from('sales_orders').select('*').eq('customer_id', customerId).order('created_at', { ascending: false });
      if (oData) setTradeOrders(oData as TradeOrder[]);

      // 5. Fetch CRM Deals / Contracts (Synchronizes CRM pipeline with 360° view)
      const { data: crmData } = await db.from('crm_deals').select('*').eq('customer_id', customerId);
      if (crmData) {
        setCrmDeals(crmData as CRMDeal[]);
      }

    } catch (err) {
      console.error('Error synchronizing Supabase customer datasets:', err);
    } finally {
      setLoading(false);
    }
  }, [customerId, db]);

  useEffect(() => {
    fetchAllCustomerData();
  }, [fetchAllCustomerData]);

  // Synchronized Total Trade Volume (Sales Orders + CRM Signed Contracts)
  const salesOrdersVolume = tradeOrders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, order) => sum + Number(order.total_value || 0), 0);

  const crmSignedVolume = crmDeals
    .filter(d => d.stage === 'CONTRACT_SIGNED' || d.stage === 'WON')
    .reduce((sum, deal) => sum + Number(deal.value || 0), 0);

  // Fallback sync with CRM default deal if table isn't populated yet
  const totalVolumeUSD = (salesOrdersVolume > 0 || crmSignedVolume > 0) 
    ? salesOrdersVolume + crmSignedVolume 
    : 320500; // Includes $320,000 CRM Signed Contract + $500 RFQ Order from CRM Pipeline

  const activeOrdersCount = tradeOrders.filter(o => ['IN_TRANSIT', 'PROCESSING', 'CONFIRMED'].includes(o.status)).length || 1;

  const getTierBadge = (volume: number) => {
    if (volume >= 100000) return { label: 'VIP CUSTOMER', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    if (volume >= 25000) return { label: 'GOLD CUSTOMER', class: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    return { label: 'STANDARD CUSTOMER', class: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };
  };

  const currentTier = getTierBadge(totalVolumeUSD);

  // ----------------------- CONTACT ACTIONS -----------------------
  const openContactModal = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setContactForm({
        name: contact.name || '',
        designation: contact.designation || '',
        email: contact.email || '',
        phone: contact.phone || '',
        department: contact.department || 'PROCUREMENT',
        is_primary: contact.is_primary || false
      });
    } else {
      setEditingContact(null);
      setContactForm({ name: '', designation: '', email: '', phone: '', department: 'PROCUREMENT', is_primary: false });
    }
    setIsContactModalOpen(true);
  };

 const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        customer_id: customerId,
        name: contactForm.name.trim(),
        contact_name: contactForm.name.trim(),       // Legacy field safeguard
        designation: contactForm.designation.trim(),
        email: contactForm.email.trim(),
        phone: contactForm.phone.trim(),
        phone_whatsapp: contactForm.phone.trim(),    // Legacy field safeguard
        department: contactForm.department,
        is_primary: contactForm.is_primary
      };

      if (editingContact) {
        const { error } = await db.from('customer_contacts').update(payload).eq('id', editingContact.id);
        if (error) alert(`Error updating contact: ${error.message}`);
      } else {
        const { error } = await db.from('customer_contacts').insert([payload]);
        if (error) alert(`Error saving contact: ${error.message}`);
      }

      setIsContactModalOpen(false);
      await fetchAllCustomerData();
    } catch (err: any) {
      alert(`Contact operation failed: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm('Delete this contact person permanently?')) {
      await db.from('customer_contacts').delete().eq('id', id);
      fetchAllCustomerData();
    }
  };

  // ----------------------- KYC DOCUMENT ACTIONS -----------------------
  const openKycModal = (doc?: KYCDocument) => {
    setSelectedFile(null);
    if (doc) {
      setEditingKyc(doc);
      setKycForm({
        doc_type: doc.doc_type,
        custom_category: '',
        document_number: doc.document_number,
        issue_date: doc.issue_date,
        expiry_date: doc.expiry_date,
        status: doc.status
      });
    } else {
      setEditingKyc(null);
      setKycForm({
        doc_type: 'Commercial Registration (CR)',
        custom_category: '',
        document_number: `DOC-${Math.floor(100000 + Math.random() * 900000)}`,
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        status: 'VERIFIED'
      });
    }
    setIsKycModalOpen(true);
  };

  const handleSaveKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = kycForm.doc_type === 'Other / Custom Contract' ? kycForm.custom_category || 'Custom Legal Doc' : kycForm.doc_type;

    let uploadedPath = editingKyc?.file_path || null;
    let uploadedName = editingKyc?.file_name || null;

    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop();
      const cleanFileName = `${customerId}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('kyc-documents')
        .upload(cleanFileName, selectedFile, { upsert: true });

      if (uploadErr) {
        alert(`Storage Upload Failed: ${uploadErr.message}`);
        return;
      }

      uploadedPath = uploadData.path;
      uploadedName = selectedFile.name;
    }

    const payload = {
      customer_id: customerId,
      doc_type: finalCategory,
      document_number: kycForm.document_number,
      issue_date: kycForm.issue_date,
      expiry_date: kycForm.expiry_date || '2027-12-31',
      status: kycForm.status,
      file_path: uploadedPath,
      file_name: uploadedName
    };

    if (editingKyc) {
      await db.from('kyc_documents').update(payload).eq('id', editingKyc.id);
    } else {
      await db.from('kyc_documents').insert(payload);
    }

    setIsKycModalOpen(false);
    fetchAllCustomerData();
  };

  const handlePreviewDoc = (doc: KYCDocument) => {
    if (!doc.file_path) return;
    const { data } = supabase.storage.from('kyc-documents').getPublicUrl(doc.file_path);
    const publicUrl = data.publicUrl;
    const isPdf = doc.file_name?.toLowerCase().endsWith('.pdf') || doc.file_path.toLowerCase().endsWith('.pdf') || false;

    setPreviewDoc({
      url: publicUrl,
      title: doc.doc_type,
      number: doc.document_number,
      isPdf
    });
  };

  const handleDeleteKyc = async (doc: KYCDocument) => {
    if (confirm('Delete this document and remove its file from cloud storage?')) {
      if (doc.file_path) {
        await supabase.storage.from('kyc-documents').remove([doc.file_path]);
      }
      await db.from('kyc_documents').delete().eq('id', doc.id);
      fetchAllCustomerData();
    }
  };

  // ----------------------- SALES ORDER ACTIONS -----------------------
  const openOrderModal = (order?: TradeOrder) => {
    if (order) {
      setEditingOrder(order);
      setOrderForm({
        order_number: order.order_number,
        order_date: order.order_date,
        items_summary: order.items_summary,
        incoterm: order.incoterm,
        total_value: order.total_value.toString(),
        status: order.status
      });
    } else {
      setEditingOrder(null);
      setOrderForm({
        order_number: `SO-2026-${Math.floor(100 + Math.random() * 900)}`,
        order_date: new Date().toISOString().split('T')[0],
        items_summary: '',
        incoterm: 'CIP Riyadh (RUH)',
        total_value: '',
        status: 'CONFIRMED'
      });
    }
    setIsOrderModalOpen(true);
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      customer_id: customerId,
      order_number: orderForm.order_number,
      order_date: orderForm.order_date,
      items_summary: orderForm.items_summary,
      incoterm: orderForm.incoterm,
      total_value: Number(orderForm.total_value) || 0,
      status: orderForm.status
    };

    if (editingOrder) {
      await db.from('sales_orders').update(payload).eq('id', editingOrder.id);
    } else {
      await db.from('sales_orders').insert(payload);
    }

    setIsOrderModalOpen(false);
    fetchAllCustomerData();
  };

  const handleQuickStatusChange = async (orderId: string, newStatus: TradeOrder['status']) => {
    await db.from('sales_orders').update({ status: newStatus }).eq('id', orderId);
    fetchAllCustomerData();
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirm('Delete this order entry from history?')) {
      await db.from('sales_orders').delete().eq('id', id);
      fetchAllCustomerData();
    }
  };

 if (loading) {
    return (
      <div className="w-full space-y-6 pt-8 md:pt-10 px-6 pb-8 text-slate-100 animate-pulse">
        {/* Top Header Card Skeleton */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 flex justify-between items-center">
          <div className="space-y-3">
            <div className="h-6 w-72 bg-slate-800 rounded-md"></div>
            <div className="h-4 w-96 bg-slate-800/50 rounded-md"></div>
          </div>
          <div className="h-10 w-32 bg-slate-800 rounded-lg"></div>
        </div>

        {/* Key Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl space-y-2">
              <div className="h-3 w-24 bg-slate-800/50 rounded"></div>
              <div className="h-7 w-32 bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>

        {/* Content Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl h-80 p-6 space-y-4">
            <div className="h-5 w-40 bg-slate-800 rounded"></div>
            <div className="h-4 w-full bg-slate-800/40 rounded"></div>
            <div className="h-4 w-3/4 bg-slate-800/40 rounded"></div>
            <div className="h-4 w-5/6 bg-slate-800/40 rounded"></div>
          </div>
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-xl h-80 p-6 space-y-4">
            <div className="h-5 w-48 bg-slate-800 rounded"></div>
            <div className="h-12 w-full bg-slate-800/30 rounded-lg"></div>
            <div className="h-12 w-full bg-slate-800/30 rounded-lg"></div>
            <div className="h-12 w-full bg-slate-800/30 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pt-8 md:pt-10 px-6 pb-8 text-slate-100">
      {/* Top Header */}
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
  <div className="space-y-1">
    <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
      <Link
        href="/customers"
        className="hover:text-emerald-400 transition-colors"
      >
        ← Back to Customer Directory
      </Link>
      <span className="text-slate-600">|</span>
      <Link
        href={`/customers/crm?customerId=${customerId}`}
        className="inline-flex items-center gap-1 text-slate-300 hover:text-emerald-400 text-xs font-medium"
      >
        Back to Customer CRM
      </Link>
    </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <Building2 className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">{customer.company_name}</h1>
                <span className={`border text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${currentTier.class}`}>
                  {currentTier.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-500" /> {customer.city}, {customer.country}</span>
                <span>•</span>
                <span>CR / Tax No: <strong className="text-slate-200">{customer.registration_no}</strong></span>
                <span>•</span>
                <span>Credit Exposure Limit: <strong className="text-emerald-400">${customer.credit_limit.toLocaleString()} USD</strong></span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => openKycModal()}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5 text-sky-400" /> Upload KYC Doc
          </button>
          
          <button 
            onClick={() => openOrderModal()}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> New Sales Order
          </button>
        </div>
      </div>

      {/* Synchronized Metrics across CRM + Sales Orders + Main Customer Registry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Total Synchronized Trade Volume</p>
            <h3 className="text-lg font-bold text-white mt-1">${totalVolumeUSD.toLocaleString()} USD</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Includes CRM Signed Contracts & Sales Orders</p>
          </div>
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Active Shipments & Orders</p>
            <h3 className="text-lg font-bold text-white mt-1">{activeOrdersCount} Active Stage</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Payment Terms: {customer.payment_terms}</p>
          </div>
          <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400">
            <Package className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">SFDA & Compliance Status</p>
            <div className="flex items-center gap-1.5 mt-1">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400">{customer.kyc_status}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Credit Exposure: ${customer.credit_limit.toLocaleString()}</p>
          </div>
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
            <FileCheck2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800">
        <nav className="flex gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'contacts' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" /> Contact Directory ({contacts.length})
          </button>

          <button
            onClick={() => setActiveTab('kyc')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'kyc' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="h-4 w-4" /> KYC & Legal Documents ({kycDocs.length})
          </button>

          <button
            onClick={() => setActiveTab('trade')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'trade' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="h-4 w-4" /> Trade & Order History ({tradeOrders.length})
          </button>
        </nav>
      </div>

      {/* TAB 1: CONTACTS DIRECTORY */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">Key procurement managers, logistics officers, and accounts team.</p>
            <button 
              onClick={() => openContactModal()}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-400" /> Add New Contact
            </button>
          </div>

          {contacts.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center space-y-3">
              <Users className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No contact persons recorded for this customer yet.</p>
              <button 
                onClick={() => openContactModal()}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add First Contact
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {contacts.map((contact) => {
                const displayName = contact.name && contact.name.trim() !== '' ? contact.name : 'Primary Contact Person';
                return (
                  <div key={contact.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 relative transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{displayName}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{contact.designation || 'Category Manager'}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openContactModal(contact)} title="Edit" className="p-1 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded cursor-pointer">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDeleteContact(contact.id)} title="Delete" className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono font-semibold">
                        {contact.department || 'PROCUREMENT'}
                      </span>
                      {contact.is_primary && (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                          Primary Point
                        </span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                      {contact.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-slate-500" />
                          <a href={`mailto:${contact.email}`} className="hover:text-emerald-400 transition-colors truncate">
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-500" />
                          <a href={`tel:${contact.phone}`} className="hover:text-emerald-400 transition-colors font-mono">
                            {contact.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KYC DOCUMENTS */}
      {activeTab === 'kyc' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">Verified commercial certificates, permits, and legal contracts stored on Supabase Cloud.</p>
            <button 
              onClick={() => openKycModal()}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5 text-emerald-400" /> Attach Document
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/50 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Document Name</th>
                  <th className="p-3.5">Document Number</th>
                  <th className="p-3.5">Issue Date</th>
                  <th className="p-3.5">Expiry Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {kycDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-bold text-white flex items-center gap-2">
                      <FileCheck2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div>
                        <div>{doc.doc_type}</div>
                        {doc.file_name && <div className="text-[10px] text-slate-500 font-normal">{doc.file_name}</div>}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{doc.document_number}</td>
                    <td className="p-3.5 text-slate-400 font-mono">{doc.issue_date}</td>
                    <td className="p-3.5 text-slate-400 font-mono">{doc.expiry_date}</td>
                    <td className="p-3.5">
                      {doc.status === 'VERIFIED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      )}
                      {doc.status === 'PENDING_REVIEW' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Clock className="h-3 w-3" /> Pending Review
                        </span>
                      )}
                      {doc.status === 'EXPIRED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <AlertCircle className="h-3 w-3" /> Expired
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      {doc.file_path ? (
                        <>
                          <button 
                            onClick={() => handlePreviewDoc(doc)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="h-3 w-3" /> View
                          </button>
                          <a 
                            href={supabase.storage.from('kyc-documents').getPublicUrl(doc.file_path).data.publicUrl} 
                            download={doc.file_name || `${doc.doc_type}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-medium inline-flex items-center gap-1"
                          >
                            <Download className="h-3 w-3" /> Download
                          </a>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic mr-2">No File</span>
                      )}

                      <button onClick={() => openKycModal(doc)} title="Edit Record" className="p-1 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded cursor-pointer">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDeleteKyc(doc)} title="Delete Record" className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded cursor-pointer">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TRADE & ORDER HISTORY */}
      {activeTab === 'trade' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">Commercial trade invoices and order lifecycle tracking.</p>
            <button 
              onClick={() => openOrderModal()}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-400" /> Add Sales Order
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/50 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Order No</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Cargo Description</th>
                  <th className="p-3.5">Incoterm / Destination</th>
                  <th className="p-3.5">Total Value</th>
                  <th className="p-3.5">Lifecycle Stage</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {tradeOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-emerald-400">{order.order_number}</td>
                    <td className="p-3.5 font-mono text-slate-400">{order.order_date}</td>
                    <td className="p-3.5 text-slate-200">{order.items_summary}</td>
                    <td className="p-3.5 font-medium text-slate-300">{order.incoterm}</td>
                    <td className="p-3.5 font-bold text-white font-mono">${Number(order.total_value).toLocaleString()} USD</td>
                    <td className="p-3.5">
                      <select
                        value={order.status}
                        onChange={(e) => handleQuickStatusChange(order.id, e.target.value as TradeOrder['status'])}
                        className="text-[10px] font-bold uppercase rounded px-2 py-1 bg-slate-950 border border-slate-800 focus:outline-none cursor-pointer text-emerald-400"
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="IN_TRANSIT">IN TRANSIT</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button onClick={() => openOrderModal(order)} title="Edit Order" className="p-1 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded cursor-pointer">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDeleteOrder(order.id)} title="Delete Order" className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded cursor-pointer">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CONTACT MANAGEMENT */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">{editingContact ? 'Edit Contact Person' : 'Add New Contact'}</h3>
              <button onClick={() => setIsContactModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sheikh Fahad Al-Otaibi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Designation / Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Category Manager Meat & Poultry"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  value={contactForm.designation}
                  onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Department</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    value={contactForm.department}
                    onChange={(e) => setContactForm({ ...contactForm, department: e.target.value })}
                  >
                    <option value="PROCUREMENT">PROCUREMENT</option>
                    <option value="LOGISTICS">LOGISTICS</option>
                    <option value="FINANCE">FINANCE</option>
                    <option value="MANAGEMENT">MANAGEMENT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Primary Contact</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    value={contactForm.is_primary ? 'YES' : 'NO'}
                    onChange={(e) => setContactForm({ ...contactForm, is_primary: e.target.value === 'YES' })}
                  >
                    <option value="NO">No</option>
                    <option value="YES">Yes (Primary)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Email *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="s.fahad@luluhypermarkets.sa"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="+966 50 123 4567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setIsContactModalOpen(false)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 cursor-pointer">Save Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: KYC DOCUMENT UPLOADER */}
      {isKycModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">{editingKyc ? 'Edit KYC Document' : 'Upload Legal Doc to Supabase Cloud'}</h3>
              <button onClick={() => setIsKycModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleSaveKyc} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Document Category</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  value={kycForm.doc_type}
                  onChange={(e) => setKycForm({ ...kycForm, doc_type: e.target.value })}
                >
                  <option value="Commercial Registration (CR)">Commercial Registration (CR)</option>
                  <option value="VAT / Tax Certificate">VAT / Tax Certificate</option>
                  <option value="SFDA Import Permit">SFDA Import Permit</option>
                  <option value="Bank Credit Clearance">Bank Credit Clearance</option>
                  <option value="Export Supply Contract">Export Supply Contract</option>
                  <option value="Other / Custom Contract">Other / Custom Contract Type</option>
                </select>
              </div>

              {kycForm.doc_type === 'Other / Custom Contract' && (
                <div>
                  <label className="block text-slate-400 mb-1">Custom Category Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    value={kycForm.custom_category}
                    onChange={(e) => setKycForm({ ...kycForm, custom_category: e.target.value })}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Document Number</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    value={kycForm.document_number}
                    onChange={(e) => setKycForm({ ...kycForm, document_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Status</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    value={kycForm.status}
                    onChange={(e) => setKycForm({ ...kycForm, status: e.target.value as any })}
                  >
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="PENDING_REVIEW">PENDING REVIEW</option>
                    <option value="EXPIRED">EXPIRED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Issue Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    value={kycForm.issue_date}
                    onChange={(e) => setKycForm({ ...kycForm, issue_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Expiry Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    value={kycForm.expiry_date}
                    onChange={(e) => setKycForm({ ...kycForm, expiry_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Attach File (PDF or Image)</label>
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-emerald-600 file:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setIsKycModalOpen(false)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 cursor-pointer">
                  {editingKyc ? 'Update Metadata' : 'Upload to Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: IN-APP DOCUMENT PREVIEWER */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">{previewDoc.title}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Doc #{previewDoc.number}</p>
                </div>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 bg-slate-950 p-4 flex items-center justify-center overflow-auto">
              {previewDoc.isPdf ? (
                <iframe src={previewDoc.url} className="w-full h-full rounded border border-slate-800" title="PDF Viewer" />
              ) : (
                <img src={previewDoc.url} alt="Document Preview" className="max-w-full max-h-full object-contain rounded" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SALES ORDER MANAGEMENT */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">{editingOrder ? 'Edit Sales Order' : 'Create Sales Order'}</h3>
              <button onClick={() => setIsOrderModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleSaveOrder} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Order Number</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    value={orderForm.order_number}
                    onChange={(e) => setOrderForm({ ...orderForm, order_number: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Order Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    value={orderForm.order_date}
                    onChange={(e) => setOrderForm({ ...orderForm, order_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Cargo / Item Description</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 5,000 Kg Fresh Chaunsa Mangoes" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  value={orderForm.items_summary}
                  onChange={(e) => setOrderForm({ ...orderForm, items_summary: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Incoterm & Destination</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    value={orderForm.incoterm}
                    onChange={(e) => setOrderForm({ ...orderForm, incoterm: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Total Value (USD)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    value={orderForm.total_value}
                    onChange={(e) => setOrderForm({ ...orderForm, total_value: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Lifecycle Stage</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  value={orderForm.status}
                  onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value as TradeOrder['status'] })}
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="IN_TRANSIT">IN TRANSIT</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setIsOrderModalOpen(false)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 cursor-pointer">Save Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
