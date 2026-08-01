'use client';

import { useEffect, useState } from 'react';
import { ExecutiveKPIs, ColdStorageLog, ExportShipmentSummary } from '@/types/dashboard.types';
import { KPIMetricCards } from '@/components/dashboard/kpi-metric-cards';
import { ColdChainStatusWidget } from '@/components/dashboard/cold-chain-status-widget';
import { ActiveShipmentsTable } from '@/components/dashboard/active-shipments-table';
import { LayoutDashboard, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [kpis, setKpis] = useState<ExecutiveKPIs | null>(null);
    const [coldStorageLogs, setColdStorageLogs] = useState<ColdStorageLog[]>([]);
      const [shipments, setShipments] = useState<ExportShipmentSummary[]>([]);
        const [loading, setLoading] = useState(true);

          const fetchDashboardData = async () => {
              setLoading(true);
                  const res = await fetch('/api/dashboard/kpis');
                      const data = await res.json();
                          setKpis(data.kpis);
                              setColdStorageLogs(data.coldStorageLogs);
                                  setShipments(data.shipments);
                                      setLoading(false);
                                        };

                                          useEffect(() => {
                                              fetchDashboardData();
                                                }, []);

                                                  return (
                                                      <div className="space-y-6">
                                                            {/* Dashboard Top Header */}
                                                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
                                                                          <div>
                                                                                    <h1 className="text-xl font-black text-white flex items-center gap-2">
                                                                                                <LayoutDashboard className="h-6 w-6 text-green-500" /> Safaa Agro Farms — Executive Command Center
                                                                                                          </h1>
                                                                                                                    <p className="text-xs text-slate-400 mt-0.5">Real-time telemetry, revenue velocity, cold chain alerts, and active international shipments</p>
                                                                                                                            </div>

                                                                                                                                    <button
                                                                                                                                              onClick={fetchDashboardData}
                                                                                                                                                        disabled={loading}
                                                                                                                                                                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                                                                                                                                                                          >
                                                                                                                                                                                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-green-500' : ''}`} /> Sync Metrics
                                                                                                                                                                                            </button>
                                                                                                                                                                                                  </div>

                                                                                                                                                                                                        {/* KPI Metric Cards */}
                                                                                                                                                                                                              <KPIMetricCards kpis={kpis} />

                                                                                                                                                                                                                    {/* Main Operational Split Section */}
                                                                                                                                                                                                                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                                                                                                                                                                                                  <div className="lg:col-span-2 space-y-6">
                                                                                                                                                                                                                                            <ActiveShipmentsTable shipments={shipments} />
                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                            <div>
                                                                                                                                                                                                                                                                      <ColdChainStatusWidget logs={coldStorageLogs} />
                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                          );
                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                          