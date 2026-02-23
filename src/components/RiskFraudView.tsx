import React, { useState, useEffect } from 'react';
import { ShieldAlert, Loader2, AlertTriangle, Ban, Eye } from 'lucide-react';
import { getPlayers, getStats } from '../api';

export function RiskFraudView() {
  const [suspiciousPlayers, setSuspicious] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [playersRes, statsRes] = await Promise.all([
        getPlayers({ limit: 100, sort: 'total_wagered' }),
        getStats(),
      ]);
      if (playersRes.ok) {
        // Flag suspicious: high wagered but no deposits, or extreme win ratio
        const flagged = (playersRes.users || []).filter((p: any) => {
          const winRate = p.total_won > 0 && p.total_wagered > 0 ? p.total_won / p.total_wagered : 0;
          const noDeposit = p.total_wagered > 1000 && p.total_deposited_usd === 0;
          const highWinRate = winRate > 0.9 && p.total_wagered > 500;
          const multiAccount = false; // Would need IP-based detection
          return noDeposit || highWinRate;
        });
        setSuspicious(flagged);
      }
      if (statsRes.ok) setStats(statsRes);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-ruby animate-spin" /></div>;

  const totalBets = stats?.bets?.total || 0;
  const ggr = stats?.bets?.ggr || 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Flagged Players</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{suspiciousPlayers.length}</div>
          <div className="text-xs text-zinc-500 mt-1">Suspicious activity detected</div>
        </div>
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">House Edge</span>
            <ShieldAlert className="w-4 h-4 text-ruby" />
          </div>
          <div className={`text-2xl font-bold ${ggr >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalBets > 0 ? ((ggr / (stats?.bets?.wagered || 1)) * 100).toFixed(2) : '0'}%
          </div>
          <div className="text-xs text-zinc-500 mt-1">GGR / Total Wagered</div>
        </div>
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Total Bets</span>
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalBets.toLocaleString()}</div>
          <div className="text-xs text-zinc-500 mt-1">All time</div>
        </div>
      </div>

      {/* Risk Rules */}
      <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">Active Detection Rules</h3>
        <div className="space-y-2">
          {[
            { rule: 'High wagered, zero deposits', desc: 'Players who wagered >1000 coins but never deposited real money', severity: 'high' },
            { rule: 'Extreme win rate', desc: 'Players with >90% win rate and >500 wagered', severity: 'critical' },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-charcoal-lighter last:border-0">
              <div>
                <div className="text-sm text-white">{r.rule}</div>
                <div className="text-xs text-zinc-500">{r.desc}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>{r.severity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Flagged Players */}
      <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter overflow-hidden">
        <div className="px-4 py-3 border-b border-charcoal-lighter flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">Flagged Players</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal-lighter">
                <th className="text-left px-4 py-3 text-xs text-zinc-500 uppercase">Player</th>
                <th className="text-right px-4 py-3 text-xs text-zinc-500 uppercase">Wagered</th>
                <th className="text-right px-4 py-3 text-xs text-zinc-500 uppercase">Won</th>
                <th className="text-right px-4 py-3 text-xs text-zinc-500 uppercase">Win Rate</th>
                <th className="text-right px-4 py-3 text-xs text-zinc-500 uppercase">Deposited</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 uppercase">Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-lighter">
              {suspiciousPlayers.map((p: any) => {
                const winRate = p.total_wagered > 0 ? (p.total_won / p.total_wagered * 100) : 0;
                const flags: string[] = [];
                if (p.total_wagered > 1000 && p.total_deposited_usd === 0) flags.push('No deposits');
                if (winRate > 90 && p.total_wagered > 500) flags.push('High win rate');
                return (
                  <tr key={p.user_id} className="hover:bg-charcoal-lighter/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center text-xs font-bold text-red-400">
                          {(p.username || p.first_name || '?')[0]?.toUpperCase()}
                        </div>
                        <span className="text-white">{p.username || p.first_name || `#${p.user_id}`}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white font-medium">{(p.total_wagered || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-zinc-300">{(p.total_won || 0).toLocaleString()}</td>
                    <td className={`px-4 py-3 text-right font-medium ${winRate > 90 ? 'text-red-400' : 'text-zinc-300'}`}>{winRate.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right text-zinc-400">${(p.total_deposited_usd || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {flags.map((f, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">{f}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {suspiciousPlayers.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-zinc-500">No suspicious activity detected ✅</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
