import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Gift, Loader2, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import { getBonusStats } from '../api';

const COLORS = ['#E31E24', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

export function BonusAnalyticsView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res = await getBonusStats();
      if (res.ok) setData(res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-ruby animate-spin" /></div>;
  if (!data) return null;

  const byType = data.by_type || [];
  // Group by bonus_type for chart
  const typeAgg: Record<string, number> = {};
  byType.forEach((b: any) => { typeAgg[b.bonus_type] = (typeAgg[b.bonus_type] || 0) + (b.cnt || 0); });
  const chartData = Object.entries(typeAgg).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Active Bonuses</span>
            <Gift className="w-4 h-4 text-ruby" />
          </div>
          <div className="text-2xl font-bold text-white">{(data.active_count || 0).toLocaleString()}</div>
        </div>
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Claimed</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{(data.claimed_count || 0).toLocaleString()}</div>
        </div>
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Total Claimed Value</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">${(data.claimed_total || 0).toFixed(2)}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Type */}
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Bonuses by Type</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-zinc-500 text-sm py-8 text-center">No bonus data yet</p>}
        </div>

        {/* Breakdown Table */}
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Breakdown by Type & Status</h3>
          <div className="space-y-2">
            {byType.map((b: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-charcoal-lighter last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <div>
                    <span className="text-sm text-white">{b.bonus_type}</span>
                    <span className={`ml-2 text-xs ${b.status === 'active' ? 'text-emerald-400' : 'text-zinc-500'}`}>({b.status})</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-white">{b.cnt}</span>
                  <span className="text-xs text-zinc-500 ml-2">(${(b.total_amount || 0).toFixed(0)})</span>
                </div>
              </div>
            ))}
            {byType.length === 0 && <p className="text-zinc-500 text-sm py-4 text-center">No bonus data</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
