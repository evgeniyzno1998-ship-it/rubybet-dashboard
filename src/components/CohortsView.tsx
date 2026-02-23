import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { LineChart as LineChartIcon, Loader2, Users, DollarSign, TrendingUp, Percent } from 'lucide-react';
import { getCohorts } from '../api';

export function CohortsView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res = await getCohorts();
      if (res.ok) setData(res.cohorts || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-ruby animate-spin" /></div>;

  const totalSize = data.reduce((s, c) => s + (c.size || 0), 0);
  const totalLTV = data.reduce((s, c) => s + (c.total_ltv || 0), 0);
  const avgRetention = data.length > 0 ? data.reduce((s, c) => s + ((c.retained_7d || 0) / Math.max(c.size, 1)) * 100, 0) / data.length : 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Cohorts (8 weeks)</span>
            <Users className="w-4 h-4 text-ruby" />
          </div>
          <div className="text-2xl font-bold text-white">{totalSize.toLocaleString()} players</div>
        </div>
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Total LTV</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">${(totalLTV || 0).toFixed(2)}</div>
        </div>
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Avg 7d Retention</span>
            <Percent className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{avgRetention.toFixed(1)}%</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">Cohort Size & Depositors</h3>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="cohort" tick={{ fill: '#999', fontSize: 10 }} />
              <YAxis tick={{ fill: '#999', fontSize: 11 }} />
              <RechartsTooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
              <Legend />
              <Bar dataKey="size" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Cohort Size" />
              <Bar dataKey="depositors" fill="#10b981" radius={[4, 4, 0, 0]} name="Depositors" />
              <Bar dataKey="retained_7d" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Retained 7d" />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-zinc-500 text-sm py-8 text-center">No cohort data yet</p>}
      </div>

      {/* Cohort Table */}
      <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-charcoal-lighter">
              <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Cohort</th>
              <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Size</th>
              <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Depositors</th>
              <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Avg Wagered</th>
              <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Avg Deposit</th>
              <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Total LTV</th>
              <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase">7d Retention</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-lighter">
            {data.map((c, i) => (
              <tr key={i} className="hover:bg-charcoal-lighter/50">
                <td className="px-4 py-3 text-white font-medium">{c.cohort}</td>
                <td className="px-4 py-3 text-right text-zinc-300">{(c.size || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-emerald-400">{c.depositors || 0}</td>
                <td className="px-4 py-3 text-right text-zinc-300">{Math.round(c.avg_wagered || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-zinc-300">${(c.avg_deposit || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-amber-400">${(c.total_ltv || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`${c.size > 0 && (c.retained_7d / c.size) > 0.5 ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    {c.size > 0 ? ((c.retained_7d / c.size) * 100).toFixed(1) : 0}%
                  </span>
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-zinc-500">No cohort data yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
