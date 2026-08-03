'use client';

import { useState } from 'react';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  FileText, 
  PlusCircle, 
  User, 
  X, 
  ArrowDownLeft, 
  ArrowUpRight,
  Calendar
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export interface CommLog {
  id: string;
  customer_name: string;
  channel: 'WHATSAPP' | 'CALL' | 'EMAIL' | 'MEETING' | string;
  direction?: 'INBOUND' | 'OUTBOUND';
  summary: string;
  logged_by?: string;
  created_at: string;
}

interface CustomerOption {
  id: string;
  company_name: string;
}

interface CommLogsProps {
  logs?: CommLog[];
  customers?: CustomerOption[];
  selectedCustomerId?: string | null;
  onLogAdded?: () => void;
}

export function CustomerCommLogs({ 
  logs = [], 
  customers = [], 
  selectedCustomerId, 
  onLogAdded 
}: CommLogsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [channel, setChannel] = useState<'WHATSAPP' | 'CALL' | 'EMAIL' | 'MEETING'>('WHATSAPP');
  const [direction, setDirection] = useState<'INBOUND' | 'OUTBOUND'>('INBOUND');
  const [summary, setSummary] = useState('');
  const [targetCustomerId, setTargetCustomerId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeCustomerId = selectedCustomerId || targetCustomerId;
    
    if (!activeCustomerId) {
      return alert('Please select a customer.');
    }
    if (!summary.trim()) {
      return alert('Please enter log summary notes.');
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      
      const payload: Record<string, any> = {
        customer_id: activeCustomerId,
        channel: channel,
        direction: direction,
        summary: summary,
        logged_by: 'System Administrator',
      };

      const { error } = await supabase
        .from('customer_comm_logs')
        .insert([payload] as any);

      // Automatic fallback if PostgREST cache rejects the 'direction' key
      if (error) {
        if (error.message?.includes('direction') || error.message?.includes('schema cache')) {
          delete payload.direction;
          const { error: fallbackErr } = await supabase
            .from('customer_comm_logs')
            .insert([payload] as any);
            
          if (fallbackErr) throw fallbackErr;
        } else {
          throw error;
        }
      }

      setIsModalOpen(false);
      setSummary('');
      setTargetCustomerId('');
      setDirection('INBOUND');
      
      if (onLogAdded) onLogAdded();
    } catch (err: any) {
      console.error('Failed to insert comm log:', err);
      alert('Failed to save log: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'WHATSAPP':
        return <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />;
      case 'CALL':
        return <Phone className="h-3.5 w-3.5 text-sky-400" />;
      case 'EMAIL':
        return <Mail className="h-3.5 w-3.5 text-amber-400" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <div>
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-emerald-400" /> Customer Communication & Activity Logs
          </h3>
          <p className="text-[10px] text-slate-400">
            Track price discussions, WhatsApp interactions, customer replies, and contract updates
          </p>
        </div>
        <button
          onClick={() => {
            if (selectedCustomerId) setTargetCustomerId(selectedCustomerId);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded text-xs font-semibold transition-colors"
        >
          <PlusCircle className="h-3.5 w-3.5 text-emerald-400" /> Log Activity
        </button>
      </div>

      {/* Timeline Feed - Fixed Height Scroll Container */}
      {logs.length === 0 ? (
        <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800/80 rounded-lg">
          No activity logged yet. Click "+ Log Activity" to record a conversation.
        </div>
      ) : (
        <div className="max-h-[260px] overflow-y-auto space-y-1.5 pr-1">
          {logs.map((log) => {
            const isInbound = log.direction === 'INBOUND';

            return (
              <div 
                key={log.id} 
                className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 p-2.5 rounded-lg text-xs space-y-1 transition-colors"
              >
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-slate-900 rounded border border-slate-800 shrink-0">
                      {getChannelIcon(log.channel)}
                    </div>
                    <span className="font-bold text-white text-[11px]">{log.customer_name}</span>

                    {/* Direction Badge */}
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border ${
                        isInbound
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                      }`}
                    >
                      {isInbound ? (
                        <>
                          <ArrowDownLeft className="h-2.5 w-2.5" /> Customer Reply
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="h-2.5 w-2.5" /> Safaa Response
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono shrink-0">
                    <span className="flex items-center gap-0.5">
                      <User className="h-2.5 w-2.5 text-slate-500" /> {log.logged_by || 'System Admin'}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Calendar className="h-2.5 w-2.5 text-slate-500" /> {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 text-[11px] leading-snug bg-slate-900/60 p-2 rounded border border-slate-800/50 line-clamp-2">
                  {log.summary}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add Communication Log */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-400" /> Log Customer Interaction
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              {!selectedCustomerId && (
                <div>
                  <label className="block text-slate-400 mb-1">Select Customer</label>
                  <select
                    value={targetCustomerId}
                    onChange={(e) => setTargetCustomerId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                    required
                  >
                    <option value="">Choose Customer...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Communication Channel */}
              <div>
                <label className="block text-slate-400 mb-1">Communication Channel</label>
                <select
                  value={channel}
                  onChange={(e: any) => setChannel(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                >
                  <option value="WHATSAPP">WhatsApp Message</option>
                  <option value="CALL">Phone Call</option>
                  <option value="EMAIL">Email</option>
                  <option value="MEETING">In-Person / Virtual Meeting</option>
                </select>
              </div>

              {/* Interaction Direction */}
              <div>
                <label className="block text-slate-400 mb-1">Interaction Flow / Direction</label>
                <select
                  value={direction}
                  onChange={(e: any) => setDirection(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="INBOUND">📥 Inbound (Customer Reply / Inquiry)</option>
                  <option value="OUTBOUND">📤 Outbound (Our Response / Quote Sent)</option>
                </select>
              </div>

              {/* Discussion Summary */}
              <div>
                <label className="block text-slate-400 mb-1">Notes / Discussion Summary</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="e.g. Discussed air-freight rates for chilled mutton, customer requested revised quote for 5 tons."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none resize-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}