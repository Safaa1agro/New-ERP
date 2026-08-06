'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Building2,
  ShieldCheck,
  Package,
  FileCheck,
} from 'lucide-react';

import { SupplierTable } from '@/components/suppliers/supplier-table';
import { SupplierFormModal } from '@/components/suppliers/supplier-form-modal';
import Link from 'next/link';

export default function SuppliersDirectoryPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/suppliers');
      if (res.ok) {
        const data = await res.json();
        setSuppliers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setSupplierToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier: any) => {
    setSupplierToEdit(supplier);
    setIsModalOpen(true);
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;

    try {
      const res = await fetch(`/api/suppliers?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSuppliers();
      } else {
        alert('Failed to delete supplier');
      }
    } catch (err) {
      console.error('Error deleting supplier:', err);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter((s: any) => {
    const matchesSearch =
      !searchTerm ||
      (s.company_name || s.company_or_farm_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.supplier_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.primary_contact_name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const category = s.category || s.supplier_type || '';
    const matchesCategory =
      selectedCategory === 'ALL' || category.toUpperCase() === selectedCategory.toUpperCase();

    return matchesSearch && matchesCategory;
  });

  // KPI Calculations
  const totalVendors = suppliers.length;
  const activeVendors = suppliers.filter((s) => s.status === 'Active').length;
  const pendingVendors = suppliers.filter((s) => s.status === 'Pending Verification' || s.status === 'Pending' || !s.status).length;
  const inactiveVendors = suppliers.filter((s) => s.status === 'Inactive').length;
  const blockedVendors = suppliers.filter((s) => s.status === 'Blocked').length;

  const complianceReady = suppliers.filter(
    (s) => s.compliance_readiness === 'YES' || s.compliance_readiness === 'CLEARED'
  ).length;
  const compliancePending = totalVendors - complianceReady;

  const totalProducts = suppliers.reduce((acc, s) => acc + (s.products_count || 0), 0);
  const clearedProducts = suppliers.reduce((acc, s) => acc + (s.cleared_products_count || 0), 0);
  const pendingProducts = totalProducts - clearedProducts;

  const totalPOs = suppliers.reduce((acc, s) => acc + (s.total_pos || 0), 0);
  const activePOs = suppliers.reduce((acc, s) => acc + (s.active_pos || 0), 0);
  const completedPOs = suppliers.reduce((acc, s) => acc + (s.completed_pos || 0), 0);
  const canceledPOs = suppliers.reduce((acc, s) => acc + (s.canceled_pos || 0), 0);

  return (
    <div className="p-5 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Supplier & Farm Directory</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage vendor profiles, cattle farm origins, compliance readiness, and catalog items.
          </p>
        </div>

<Link
  href="/suppliers/srm"
  className="px-3 py-2 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg inline-flex items-center gap-1.5"
>
  SRM & Procurement Engine
</Link>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-md shadow-emerald-500/10"
        >
          <Plus className="w-4 h-4" />
          Add New Supplier
        </button>
      </div>

      {/* 4 Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Vendors
              </p>
              <p className="text-2xl font-bold text-slate-100 mt-0.5">{totalVendors}</p>
            </div>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-1 text-[10px]">
            <span className="text-emerald-400">Active: <b>{activeVendors}</b></span>
            <span className="text-amber-400">Pending: <b>{pendingVendors}</b></span>
            <span className="text-slate-400">Inactive: <b>{inactiveVendors}</b></span>
            <span className="text-rose-400">Blocked: <b>{blockedVendors}</b></span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Vendor Compliance
              </p>
              <p className="text-2xl font-bold text-emerald-400 mt-0.5">{complianceReady}</p>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex justify-between text-[10px]">
            <span className="text-emerald-400">Cleared: <b>{complianceReady}</b></span>
            <span className="text-amber-400">Pending: <b>{compliancePending}</b></span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Products
              </p>
              <p className="text-2xl font-bold text-indigo-400 mt-0.5">{totalProducts}</p>
            </div>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex justify-between text-[10px]">
            <span className="text-emerald-400">Cleared: <b>{clearedProducts}</b></span>
            <span className="text-amber-400">Pending: <b>{pendingProducts}</b></span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Total POs Issued
              </p>
              <p className="text-2xl font-bold text-purple-400 mt-0.5">{totalPOs}</p>
            </div>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-1 text-[10px]">
            <span className="text-blue-400">Active: <b>{activePOs}</b></span>
            <span className="text-emerald-400">Done: <b>{completedPOs}</b></span>
            <span className="text-rose-400 col-span-2">Canceled/Rejected: <b>{canceledPOs}</b></span>
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code, name, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Cattle Farmer">Cattle Farmer</option>
              <option value="Farmer">General Farmer</option>
              <option value="Broker">Broker</option>
              <option value="Facility">Facility</option>
              <option value="Organization">Organization</option>
              <option value="Factory">Factory</option>
              <option value="Exporter">Exporter</option>
              <option value="Self Produced">Self Produced</option>
              <option value="Shop">Shop</option>
            </select>
          </div>

          <button
            onClick={fetchSuppliers}
            className="p-1.5 text-slate-400 hover:text-slate-100 bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Directory Table */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
          Loading suppliers directory...
        </div>
      ) : (
        <SupplierTable
          suppliers={filteredSuppliers}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteSupplier}
        />
      )}

      {/* Supplier Form Modal (Handles Create & Edit) */}
      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSupplierToEdit(null);
        }}
        onSuccess={fetchSuppliers}
        supplierToEdit={supplierToEdit}
      />
    </div>
  );
}