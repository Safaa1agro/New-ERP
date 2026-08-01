'use client';

import { ColdStorageLog } from '@/types/dashboard.types';
import { Thermometer, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ColdChainStatusWidgetProps {
  logs?: ColdStorageLog[];
}

export function ColdChainStatusWidget({ logs = [] }: ColdChainStatusWidgetProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-cyan-400 shrink-0" /> Live Cold Storage Telemetry
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time room temperature, power source & thermal compliance
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
          No active telemetry logs available.
        </div>
      ) : (
        /* Single column grid stops narrow-container crushing */
        <div className="grid grid-cols-1 gap-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`p-3.5 rounded-xl border transition ${
                log.is_alert
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-200'
              }`}
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">{log.zone_name}</h4>
                  <span className="text-[11px] text-slate-400 block truncate">{log.facility_name}</span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    log.is_alert
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {log.is_alert ? (
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                  )}
                  {log.is_alert ? 'TEMP DEVIATION' : 'NOMINAL'}
                </span>
              </div>

              {/* Flex row with space-between prevents horizontal collisions */}
              <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-700/40 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Target / Actual
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      log.is_alert ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {log.target_temp_c}°C / {log.current_temp_c}°C
                  </span>
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Humidity
                  </span>
                  <span className="font-mono font-bold text-white">
                    {log.humidity_percentage}%
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Power
                  </span>
                  <span className="font-semibold text-blue-400 inline-flex items-center gap-1">
                    <Zap className="h-3 w-3 shrink-0" /> {log.power_status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}