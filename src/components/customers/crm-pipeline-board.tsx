'use client';

import { CRMOpportunity } from '@/types/customer.types';
import { DollarSign, Building2, Calendar, ArrowRightLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

interface Props {
  opportunities: CRMOpportunity[];
  onRefresh?: () => void;
}

const STAGES = [
  { key: 'NEW_LEAD', label: 'NEW LEADS', color: 'border-slate-700' },
  { key: 'QUALIFIED', label: 'QUALIFIED', color: 'border-sky-500/40' },
  { key: 'RFQ_RECEIVED', label: 'RFQ RECEIVED', color: 'border-amber-500/40' },
  { key: 'QUOTATION_SENT', label: 'QUOTATION SENT', color: 'border-indigo-500/40' },
  { key: 'SAMPLE_SENT', label: 'SAMPLE SENT', color: 'border-purple-500/40' },
  { key: 'CONTRACT_SIGNED', label: 'CONTRACT SIGNED', color: 'border-emerald-500/40' },
];

export function CRMPipelineBoard({ opportunities = [], onRefresh }: Props) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStageChange = async (oppId: string, newStage: string) => {
    setUpdatingId(oppId);
    try {
      const supabase = createClient();
      const { error } = await (supabase.from('crm_opportunities') as any)
        .update({ stage: newStage })
        .eq('id', oppId);

      if (error) throw error;
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert('Failed to update deal stage: ' + (err.message || 'Error'));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 overflow-x-auto">
      {/* SINGLE Scroll Container for the Entire Board */}
      <div className="max-h-[420px] overflow-y-auto pr-1">
        {/* 6-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5 min-w-[950px] align-start">
          {STAGES.map((stage) => {
            const stageOpps = opportunities.filter((o) => o.stage === stage.key);
            const totalValue = stageOpps.reduce(
              (acc, curr) =>
                acc + (Number(curr.estimated_value_usd || curr.estimated_annual_value_usd) || 0),
              0
            );

            return (
              <div
                key={stage.key}
                className="bg-slate-950/60 rounded-lg p-2 border border-slate-800/80 flex flex-col h-full"
              >
                {/* Column Header - Fixed Wrapping to stop cropping */}
                <div className={`border-b-2 ${stage.color} pb-1.5 mb-1.5 flex justify-between items-start gap-1 min-h-[32px]`}>
                  <span className="text-[10px] font-black tracking-wider text-slate-300 leading-tight">
                    {stage.label}
                  </span>
                  <span className="text-[9px] bg-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded-full shrink-0">
                    {stageOpps.length}
                  </span>
                </div>

                {/* Total USD Value */}
                <div className="text-[9px] text-slate-500 mb-2 font-mono truncate">
                  Total: <span className="text-emerald-400 font-semibold">${totalValue.toLocaleString()}</span>
                </div>

                {/* Deal Cards Container (Full width, no individual scrollbar) */}
                <div className="space-y-2 flex-1">
                  {stageOpps.length === 0 ? (
                    <div className="h-16 border border-dashed border-slate-800/60 rounded-md flex items-center justify-center text-[10px] text-slate-600">
                      Empty Stage
                    </div>
                  ) : (
                    stageOpps.map((opp) => (
                      <div
                        key={opp.id}
                        className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-2.5 rounded-lg text-xs space-y-2 transition-all shadow-sm"
                      >
                        <div className="font-bold text-white leading-tight text-[11px]">{opp.title}</div>

                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-slate-500 shrink-0" />
                          <span className="truncate">{opp.customers?.company_name || 'General Account'}</span>
                        </div>

                        <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-800/60 text-slate-400">
                          <span className="text-emerald-400 font-bold flex items-center">
                            <DollarSign className="h-3 w-3" />
                            {(
                              Number(opp.estimated_value_usd || opp.estimated_annual_value_usd) || 0
                            ).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-0.5 text-slate-500 text-[9px]">
                            <Calendar className="h-2.5 w-2.5" />
                            {new Date(opp.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Interactive Stage Selector */}
                        <div className="pt-1.5 border-t border-slate-800/60 flex items-center gap-1">
                          <ArrowRightLeft className="h-3 w-3 text-amber-400 shrink-0" />
                          <select
                            value={opp.stage}
                            disabled={updatingId === opp.id}
                            onChange={(e) => handleStageChange(opp.id, e.target.value)}
                            className="w-full bg-slate-800 text-[9px] text-slate-200 border border-slate-700 rounded p-1 outline-none font-medium cursor-pointer hover:bg-slate-750"
                          >
                            {STAGES.map((s) => (
                              <option key={s.key} value={s.key}>
                                Move to: {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
