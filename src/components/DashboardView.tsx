import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Users, DollarSign, TrendingUp, Zap, Trophy, ArrowDown, ArrowUp, Loader2 } from 'lucide-react';
import { getStats } from '../api';

export function DashboardView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const res = await getStats();
      if (res.ok) setData(res);
      else setError(res.error || 'Failed to load');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-ruby animate-spin" />
    </div>
  );
  if (error) return (
    <div className="text-center text-red-400 py-16">
      <p className="text-lg mb-2">Failed to load dashboard</p>
      <p className="text-sm text-zinc-500">{error}</p>
      <button onClick={() => { setLoading(true); setError(''); loadData(); }} className="mt-4 px-4 py-2 bg-ruby/20 text-ruby rounded-lg hover:bg-ruby/30">Retry</button>
    </div>
  );
  if (!data) return null;

  const stats = [
    { title: 'Total Players', value: (data.users?.total || 0).toLocaleString(), change: `+${data.users?.new_today || 0} today`, icon: <Users className="w-5 h-5" /> },
    { title: 'Active Today', value: (data.users?.active_today || 0).toLocaleString(), change: `${data.users?.active_week || 0} this week`, icon: <Zap className="w-5 h-5" /> },
    { title: 'GGR (All Time)', value: `$${((data.bets?.ggr || 0) / 100).toLocaleString()}`, change: `$${((data.bets?.today_ggr || 0) / 100).toFixed(0)} today`, icon: <DollarSign className="w-5 h-5" /> },
    { title: 'Total Deposits', value: `$${(data.deposits?.usd || 0).toLocaleString()}`, change: `${data.deposits?.total || 0} transactions`, icon: <TrendingUp className="w-5 h-5" /> },
  ];

  const COLORS = ['#E31E24', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* Revenue + Registrations Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Daily GGR (14 days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.revenue_daily || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" tick={{ fill: '#999', fontSize: 11 }} tickFormatter={(v) => v?.slice(5)} />
              <YAxis tick={{ fill: '#999', fontSize: 11 }} />
              <RechartsTooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="ggr" stroke="#E31E24" fill="#E31E24" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Registrations Chart */}
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Daily Registrations (14 days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.registrations_daily || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" tick={{ fill: '#999', fontSize: 11 }} tickFormatter={(v) => v?.slice(5)} />
              <YAxis tick={{ fill: '#999', fontSize: 11 }} />
              <RechartsTooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="cnt" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Total Wagered</span>
            <TrendingUp className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-white">${((data.bets?.wagered || 0) / 100).toLocaleString()}</div>
          <div className="text-xs text-zinc-500 mt-1">{(data.bets?.total || 0).toLocaleString()} bets</div>
        </div>
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Total Payouts</span>
            <ArrowDown className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-white">${((data.bets?.won || 0) / 100).toLocaleString()}</div>
          <div className="text-xs text-zinc-500 mt-1">Withdrawals: ${(data.withdrawals?.usd || 0).toFixed(2)}</div>
        </div>
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Net Revenue</span>
            <ArrowUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">${(data.net_revenue || 0).toFixed(2)}</div>
          <div className="text-xs text-zinc-500 mt-1">{data.referrals || 0} referrals</div>
        </div>
      </div>

      {/* Top Winners & Depositors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-400" /> Top Winners</h3>
          <div className="space-y-2">
            {(data.top_winners || []).slice(0, 5).map((w: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-charcoal-lighter last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-charcoal-lighter flex items-center justify-center text-xs font-bold text-zinc-300">{i + 1}</span>
                  <span className="text-sm text-white">{w.username || w.first_name || `#${w.user_id}`}</span>
                </div>
                <span className="text-sm font-semibold text-emerald-400">{(w.total_won || 0).toLocaleString()} coins</span>
              </div>
            ))}
            {(!data.top_winners || data.top_winners.length === 0) && <p className="text-zinc-500 text-sm">No data yet</p>}
          </div>
        </div>
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-400" /> Top Depositors</h3>
          <div className="space-y-2">
            {(data.top_depositors || []).slice(0, 5).map((d: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-charcoal-lighter last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-charcoal-lighter flex items-center justify-center text-xs font-bold text-zinc-300">{i + 1}</span>
                  <span className="text-sm text-white">{d.username || d.first_name || `#${d.user_id}`}</span>
                </div>
                <span className="text-sm font-semibold text-amber-400">${(d.total_deposited_usd || 0).toFixed(2)}</span>
              </div>
            ))}
            {(!data.top_depositors || data.top_depositors.length === 0) && <p className="text-zinc-500 text-sm">No data yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon }: { title: string, value: string, change: string, icon: React.ReactNode }) {
  return (
    <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5 hover:border-ruby/20 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{title}</span>
        <div className="text-ruby">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-zinc-400">{change}</div>
    </div>
  );
}
