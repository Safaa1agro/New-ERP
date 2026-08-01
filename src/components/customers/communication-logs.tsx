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
  ArrowUpRight 
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
      
      // Clean payload strictly matching table columns
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

      // Automatic fallback if PostgREST cache still rejects the 'direction' key
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
      
      // Refresh parent dataset
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
        return <MessageSquare className="h-4 w-4 text-emerald-400" />;
      case 'CALL':
        return <Phone className="h-4 w-4 text-sky-400" />;
      case 'EMAIL':
        return <Mail className="h-4 w-4 text-amber-400" />;
      default:
        return <FileText className="h-4 w-4 text-purple-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-emerald-400" /> Customer Communication & Activity Logs
          </h3>
          <p className="text-[11px] text-slate-400">
            Track price discussions, WhatsApp interactions, customer replies, and contract updates
          </p>
        </div>
        <button
          onClick={() => {
            if (selectedCustomerId) setTargetCustomerId(selectedCustomerId);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
        >
          <PlusCircle className="h-3.5 w-3.5 text-emerald-400" /> Log Activity
        </button>
      </div>

      {/* Timeline Feed */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
            No activity logged yet. Click "+ Log Activity" to record a conversation.
          </div>
        ) : (
          logs.map((log) => {
            const isInbound = log.direction === 'INBOUND';

            return (
              <div key={log.id} className="bg-slate-800/40 border border-slate-800 p-3 rounded-lg text-xs flex items-start gap-3 hover:border-slate-700 transition-colors">
                <div className="p-2 bg-slate-800 rounded-md mt-0.5 border border-slate-700 shrink-0">
                  {getChannelIcon(log.channel)}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{log.customer_name}</span>

                      {/* Direction Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          isInbound
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                        }`}
                      >
                        {isInbound ? (
                          <>
                            <ArrowDownLeft className="h-3 w-3" /> Customer Reply
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="h-3 w-3" /> Safaa Response
                          </>
                        )}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-slate-300 mt-1 leading-relaxed bg-slate-900/40 p-2 rounded border border-slate-800/50">
                    {log.summary}
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                    <User className="h-3 w-3 text-slate-500" /> Logged by: {log.logged_by || 'System Administrator'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

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
                  <option value="CALL font-medium">Phone Call</option>
                  <option value="EMAIL">Email</option>
                  <option value="MEETING">In-Person / Virtual Meeting</option>
                </select>
              </div>

              {/* Interaction Direction / Flow */}
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