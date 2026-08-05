'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { SupplierProductModal } from '../supplier-product-modal';

interface SupplierProductsTabProps {
  supplierId: string;
}

export function SupplierProductsTab({ supplierId }: SupplierProductsTabProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/supplier-products?supplier_id=${supplierId}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch supplier products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supplierId) fetchProducts();
  }, [supplierId]);

  const handleAdd = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: any) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product item?')) return;
    try {
      const res = await fetch(`/api/supplier-products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Failed to delete product item.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-400" /> Supplier Product Catalog
          </h3>
          <p className="text-xs text-slate-400">Manage products, capacities, compliance, and testing status.</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product Item
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Product Name / Category</th>
                <th className="px-4 py-3">Capacity & Unit</th>
                <th className="px-4 py-3">Delivery</th>
                <th className="px-4 py-3">Contract No.</th>
                <th className="px-4 py-3">Sample Status</th>
                <th className="px-4 py-3">Test Spec / No.</th>
                <th className="px-4 py-3">Compliance</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No product items added yet. Click "+ Add Product Item" to create one.
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-100">{item.product_name}</div>
                      <div className="text-[10px] text-slate-400">{item.product_category}</div>
                      {item.short_description && (
    <div className="text-[11px] text-slate-300 italic mt-0.5 max-w-xs truncate" title={item.short_description}>
      {item.short_description}
    </div>
  )}
                    </td>
                    <td className="px-4 py-3">
                      {item.supplier_capacity ? `${item.supplier_capacity} ${item.measurement}` : item.measurement}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{item.delivery}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-emerald-400 font-medium">
                        {item.contract_number || '—'}
                      </span>
                      <div className="text-[10px] text-slate-400">{item.contract}</div>
                    </td>
                    <td className="px-4 py-3">{item.sample_requirements}</td>
                    <td className="px-4 py-3">
                      <div className="text-slate-200">{item.test_specification}</div>
                      {item.test_number && (
                        <div className="font-mono text-[10px] text-emerald-400">{item.test_number}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {item.product_compliance}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SupplierProductModal
        isOpen={isModalOpen}
        supplierId={supplierId}
        onClose={() => {
          setIsModalOpen(false);
          setProductToEdit(null);
        }}
        onSuccess={fetchProducts}
        productToEdit={productToEdit}
      />
    </div>
  );
}