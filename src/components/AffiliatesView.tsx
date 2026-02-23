import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Network, Loader2, Users, DollarSign, TrendingUp } from 'lucide-react';
import { getAffiliates } from '../api';

export function AffiliatesView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res = await getAffiliates();
      if (res.ok) setData(res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-ruby animate-spin" /></div>;
  if (!data) return null;

  const topRefs = data.top_referrers || [];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Total Referrals</span>
            <Users className="w-4 h-4 text-ruby" />
          </div>
          <div className="text-2xl font-bold text-white">{(data.total_referrals || 0).toLocaleString()}</div>
        </div>
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Active Referrers</span>
            <Network className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{(data.total_referrers || 0).toLocaleString()}</div>
        </div>
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Avg per Referrer</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {data.total_referrers > 0 ? (data.total_referrals / data.total_referrers).toFixed(1) : '0'}
          </div>
        </div>
      </div>

      {/* Chart */}
      {topRefs.length > 0 && (
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Top Referrers</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topRefs.slice(0, 15)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" tick={{ fill: '#999', fontSize: 11 }} />
              <YAxis dataKey="username" type="category" tick={{ fill: '#999', fontSize: 11 }} width={100} tickFormatter={v => v || 'anon'} />
              <RechartsTooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="referrals_count" fill="#E31E24" radius={[0, 4, 4, 0]} name="Referrals" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-charcoal-lighter">
              <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase">#</th>
              <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Player</th>
              <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Referrals</th>
              <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Deposits (USD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-lighter">
            {topRefs.map((r: any, i: number) => (
              <tr key={i} className="hover:bg-charcoal-lighter/50">
                <td className="px-4 py-3 text-zinc-500">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-ruby/10 flex items-center justify-center text-xs font-bold text-ruby">
                      {(r.username || r.first_name || '?')[0]?.toUpperCase()}
                    </div>
                    <span className="text-white">{r.username || r.first_name || `#${r.user_id}`}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-white font-medium">{r.referrals_count}</td>
                <td className="px-4 py-3 text-right text-emerald-400">${(r.total_deposited_usd || 0).toFixed(2)}</td>
              </tr>
            ))}
            {topRefs.length === 0 && <tr><td colSpan={4} className="px-4 py-12 text-center text-zinc-500">No referral data yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
