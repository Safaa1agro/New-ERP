'use client';

import { FinancialSummaryView, CompanyProfile } from '@/types/company.types';
import { Wallet, Landmark, TrendingUp, Building2, ShieldAlert, Award } from 'lucide-react';

interface FinancialMetricsGridProps {
  summary: FinancialSummaryView | null;
    profile: CompanyProfile | null;
    }

    export function FinancialMetricsGrid({ summary, profile }: FinancialMetricsGridProps) {
      const formatPKR = (val: number | undefined) => {
          if (!val) return 'PKR 0.00';
              return `PKR ${val.toLocaleString('en-PK', { maximumFractionDigits: 2 })}`;
                };

                  return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                                    <div className="flex justify-between items-center text-slate-400 mb-2">
                                              <span className="text-xs uppercase font-semibold">Total Company Worth</span>
                                                        <Award className="h-5 w-5 text-green-500" />
                                                                </div>
                                                                        <p className="text-2xl font-black text-white">{formatPKR(summary?.net_company_worth)}</p>
                                                                                <span className="text-[11px] text-slate-500 mt-1 block">Assets + Liquid Cash - Liabilities</span>
                                                                                      </div>

                                                                                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                                                                                                    <div className="flex justify-between items-center text-slate-400 mb-2">
                                                                                                              <span className="text-xs uppercase font-semibold">Total Liquid Cash (Bank Accounts)</span>
                                                                                                                        <Landmark className="h-5 w-5 text-blue-500" />
                                                                                                                                </div>
                                                                                                                                        <p className="text-2xl font-black text-white">{formatPKR(summary?.total_cash_in_banks)}</p>
                                                                                                                                                <span className="text-[11px] text-emerald-400 mt-1 block">Verified across all active bank accounts</span>
                                                                                                                                                      </div>

                                                                                                                                                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                                                                                                                                                                    <div className="flex justify-between items-center text-slate-400 mb-2">
                                                                                                                                                                              <span className="text-xs uppercase font-semibold">Total Capital Investment</span>
                                                                                                                                                                                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                                                                                                                                                                                                </div>
                                                                                                                                                                                                        <p className="text-2xl font-black text-white">{formatPKR(summary?.total_investment)}</p>
                                                                                                                                                                                                                <span className="text-[11px] text-slate-500 mt-1 block">Paid-up capital & shareholder funds</span>
                                                                                                                                                                                                                      </div>

                                                                                                                                                                                                                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                                                                                                                                                                                                                                    <div className="flex justify-between items-center text-slate-400 mb-2">
                                                                                                                                                                                                                                              <span className="text-xs uppercase font-semibold">Total Liabilities</span>
                                                                                                                                                                                                                                                        <ShieldAlert className="h-5 w-5 text-red-500" />
                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                        <p className="text-2xl font-black text-white">{formatPKR(summary?.total_liabilities)}</p>
                                                                                                                                                                                                                                                                                <span className="text-[11px] text-red-400 mt-1 block">Pending financial commitments</span>
                                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                            );
                                                                                                                                                                                                                                                                                            }