import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { HeartPulse, Loader2, AlertTriangle, Users, Clock } from 'lucide-react';
import { getPlayers } from '../api';

export function ComplianceView() {
  const [churnRisk, setChurnRisk] = useState<any[]>([]);
  const [heavyPlayers, setHeavyPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [churn, heavy] = await Promise.all([
        getPlayers({ segment: 'churn_risk', limit: 20, sort: 'total_wagered' }),
        getPlayers({ limit: 15, sort: 'total_wagered' }),
      ]);
      if (churn.ok) setChurnRisk(churn.users || []);
      if (heavy.ok) setHeavyPlayers(heavy.users || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-ruby animate-spin" /></div>;

  // High-risk: players with high wagered AND high loss
  const highRisk = heavyPlayers.filter((p: any) => p.total_wagered > 0 && (p.total_wagered - p.total_won) / p.total_wagered > 0.6);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Churn Risk</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{churnRisk.length}</div>
          <div className="text-xs text-zinc-500 mt-1">Inactive 14+ days</div>
        </div>
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">High Loss Players</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400">{highRisk.length}</div>
          <div className="text-xs text-zinc-500 mt-1">60%+ loss rate</div>
        </div>
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Heavy Wagerers</span>
            <Users className="w-4 h-4 text-ruby" />
          </div>
          <div className="text-2xl font-bold text-white">{heavyPlayers.length}</div>
          <div className="text-xs text-zinc-500 mt-1">Top 15 by wagered</div>
        </div>
      </div>

      {/* Heavy Wagerers Chart */}
      {heavyPlayers.length > 0 && (
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Top Players by Total Wagered</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={heavyPlayers.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" tick={{ fill: '#999', fontSize: 11 }} />
              <YAxis dataKey="username" type="category" tick={{ fill: '#999', fontSize: 11 }} width={100}
                tickFormatter={v => v || 'anon'} />
              <RechartsTooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="total_wagered" fill="#E31E24" radius={[0, 4, 4, 0]} name="Wagered" />
              <Bar dataKey="total_won" fill="#10b981" radius={[0, 4, 4, 0]} name="Won" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Churn Risk Table */}
      <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter overflow-hidden">
        <div className="px-4 py-3 border-b border-charcoal-lighter flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">Churn Risk Players (Inactive 14+ days)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal-lighter">
                <th className="text-left px-4 py-3 text-xs text-zinc-500 uppercase">Player</th>
                <th className="text-right px-4 py-3 text-xs text-zinc-500 uppercase">Balance</th>
                <th className="text-right px-4 py-3 text-xs text-zinc-500 uppercase">Wagered</th>
                <th className="text-right px-4 py-3 text-xs text-zinc-500 uppercase">Deposited</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 uppercase">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-lighter">
              {churnRisk.map((p: any) => (
                <tr key={p.user_id} className="hover:bg-charcoal-lighter/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400">
                        {(p.username || p.first_name || '?')[0]?.toUpperCase()}
                      </div>
                      <span className="text-white">{p.username || p.first_name || `#${p.user_id}`}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-white">{(p.coins || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-zinc-300">{(p.total_wagered || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-emerald-400">${(p.total_deposited_usd || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-amber-400 text-xs">{p.last_login ? new Date(p.last_login).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
              {churnRisk.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-zinc-500">No churn risk players</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
