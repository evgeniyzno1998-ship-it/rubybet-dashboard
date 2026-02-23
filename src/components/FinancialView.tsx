import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { DollarSign, TrendingUp, ArrowDown, ArrowUp, Loader2, Calendar } from 'lucide-react';
import { getFinancial } from '../api';

const COLORS = ['#E31E24', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

export function FinancialView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => { loadData(); }, [days]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getFinancial(days);
      if (res.ok) setData(res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-ruby animate-spin" /></div>;
  if (!data) return null;

  const totals = data.totals || { deposits: 0, withdrawals: 0, net: 0 };

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex gap-2">
        {[7, 14, 30, 90].map(d => (
          <button key={d} onClick={() => setDays(d)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${days === d ? 'bg-ruby/10 text-ruby border border-ruby/30' : 'bg-charcoal-light text-zinc-400 border border-charcoal-lighter'}`}>
            {d}d
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Total Deposits</span>
            <ArrowUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">${totals.deposits.toLocaleString()}</div>
        </div>
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Total Withdrawals</span>
            <ArrowDown className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400">${totals.withdrawals.toLocaleString()}</div>
        </div>
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Net Revenue</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-2xl font-bold ${totals.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${totals.net.toLocaleString()}</div>
        </div>
      </div>

      {/* GGR Chart */}
      <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">Daily GGR (Wagered − Won)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data.ggr_daily || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="day" tick={{ fill: '#999', fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
            <YAxis tick={{ fill: '#999', fontSize: 11 }} />
            <RechartsTooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="ggr" stroke="#E31E24" fill="#E31E24" fillOpacity={0.15} strokeWidth={2} name="GGR" />
            <Area type="monotone" dataKey="wagered" stroke="#10b981" fill="none" strokeWidth={1} strokeDasharray="4 4" name="Wagered" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Deposits Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Deposits by Day</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.deposits_daily || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" tick={{ fill: '#999', fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
              <YAxis tick={{ fill: '#999', fontSize: 11 }} />
              <RechartsTooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="usd" fill="#10b981" radius={[4, 4, 0, 0]} name="USD" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Method */}
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Deposits by Method</h3>
          {(data.by_method || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={(data.by_method || []).map((m: any) => ({ name: m.method, value: m.usd || 0 }))} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name }) => name}>
                  {(data.by_method || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-zinc-500 text-sm py-8 text-center">No deposit data yet</p>}
        </div>
      </div>
    </div>
  );
}
