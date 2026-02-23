import React, { useState, useEffect } from 'react';
import { Radio, Loader2, DollarSign, Gamepad2, Users, Clock } from 'lucide-react';
import { getLive } from '../api';

export function LiveMonitorView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const res = await getLive(50);
      if (res.ok) setData(res);
    } catch (e) {
      console.error('Live data error:', e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-ruby animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Live Header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-emerald-400">{data?.active_now || 0} Online Now</span>
        </div>
        <span className="text-xs text-zinc-500">Auto-refreshes every 5s</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bets */}
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter overflow-hidden">
          <div className="px-4 py-3 border-b border-charcoal-lighter flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-ruby" />
            <span className="text-sm font-semibold text-white">Recent Bets</span>
          </div>
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            {(data?.recent_bets || []).map((b: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-charcoal-lighter/50 hover:bg-charcoal-lighter/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-ruby/10 flex items-center justify-center text-xs font-bold text-ruby shrink-0">
                    {(b.username || b.first_name || '?')[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-white truncate">{b.username || b.first_name || `#${b.user_id}`}</div>
                    <div className="text-[10px] text-zinc-500">{b.game} · {b.bet_type}</div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className={`text-sm font-medium ${b.win_amount > b.bet_amount ? 'text-emerald-400' : b.win_amount > 0 ? 'text-zinc-300' : 'text-red-400'}`}>
                    {b.win_amount > 0 ? `+${b.win_amount}` : `-${b.bet_amount}`}
                  </div>
                  <div className="text-[10px] text-zinc-600">{b.created_at ? new Date(b.created_at).toLocaleTimeString() : ''}</div>
                </div>
              </div>
            ))}
            {(!data?.recent_bets || data.recent_bets.length === 0) && (
              <div className="px-4 py-12 text-center text-zinc-500 text-sm">No bets yet</div>
            )}
          </div>
        </div>

        {/* Recent Deposits */}
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter overflow-hidden">
          <div className="px-4 py-3 border-b border-charcoal-lighter flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white">Recent Deposits</span>
          </div>
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            {(data?.recent_deposits || []).map((d: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-charcoal-lighter/50 hover:bg-charcoal-lighter/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-400/10 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                    {(d.username || d.first_name || '?')[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-white truncate">{d.username || d.first_name || `#${d.user_id}`}</div>
                    <div className="text-[10px] text-zinc-500">{d.method}</div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className="text-sm font-medium text-emerald-400">+${(d.amount_usd || 0).toFixed(2)}</div>
                  <div className="text-[10px] text-zinc-600">{d.created_at ? new Date(d.created_at).toLocaleTimeString() : ''}</div>
                </div>
              </div>
            ))}
            {(!data?.recent_deposits || data.recent_deposits.length === 0) && (
              <div className="px-4 py-12 text-center text-zinc-500 text-sm">No deposits yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
