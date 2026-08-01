'use client';

import { useEffect, useState } from 'react';
import { Customer } from '@/types/customer.types';
import { CustomerTable } from '@/components/customers/customer-table';
import { CustomerFormModal } from '@/components/customers/customer-form-modal';
import { Users, Globe2, ShieldCheck, DollarSign } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

      const loadCustomers = async () => {
          setLoading(true);
              const res = await fetch('/api/customers');
                  const data = await res.json();
                      setCustomers(data);
                          setLoading(false);
                            };

                              useEffect(() => {
                                  loadCustomers();
                                    }, []);

                                      const totalCreditLimit = customers.reduce((acc, curr) => acc + (curr.credit_limit_usd || 0), 0);

                                        return (
                                            <div className="space-y-6">
                                                  {/* Header */}
                                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
                                                                <div>
                                                                          <h1 className="text-xl font-black text-white flex items-center gap-2">
                                                                                      <Users className="h-6 w-6 text-emerald-500" /> Importers & Global Customer Directory
                                                                                                </h1>
                                                                                                          <p className="text-xs text-slate-400 mt-0.5">International buyer registry, SFDA registrations, credit terms & port destinations</p>
                                                                                                                  </div>

                                                                                                                          <CustomerFormModal onSuccess={loadCustomers} />
                                                                                                                                </div>

                                                                                                                                      {/* Summary KPI Band */}
                                                                                                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                                                                                                                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                                                                                                                                                              <div>
                                                                                                                                                                          <span className="text-[10px] uppercase text-slate-400 font-bold">Active Importers</span>
                                                                                                                                                                                      <p className="text-xl font-black text-white">{customers.filter(c => c.status === 'ACTIVE').length}</p>
                                                                                                                                                                                                </div>
                                                                                                                                                                                                          <Globe2 className="h-8 w-8 text-blue-500/40" />
                                                                                                                                                                                                                  </div>

                                                                                                                                                                                                                          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                                                                                                                                                                                                                                    <div>
                                                                                                                                                                                                                                                <span className="text-[10px] uppercase text-slate-400 font-bold">Total Approved Credit Exposure</span>
                                                                                                                                                                                                                                                            <p className="text-xl font-black text-emerald-400">${totalCreditLimit.toLocaleString('en-US')}</p>
                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                <DollarSign className="h-8 w-8 text-emerald-500/40" />
                                                                                                                                                                                                                                                                                        </div>

                                                                                                                                                                                                                                                                                                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                                                                                                                                                                                                                                                                                                          <div>
                                                                                                                                                                                                                                                                                                                      <span className="text-[10px] uppercase text-slate-400 font-bold">SFDA Certified Importers</span>
                                                                                                                                                                                                                                                                                                                                  <p className="text-xl font-black text-cyan-400">{customers.filter(c => c.sfda_registration_no).length}</p>
                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                      <ShieldCheck className="h-8 w-8 text-cyan-500/40" />
                                                                                                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                                                                                                    </div>

                                                                                                                                                                                                                                                                                                                                                                          {/* Customer Directory Table */}
                                                                                                                                                                                                                                                                                                                                                                                <CustomerTable customers={customers} />
                                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                                      );
                                                                                                                                                                                                                                                                                                                                                                                      }