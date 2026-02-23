import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Gamepad2, Loader2, TrendingUp, Users, Trophy, DollarSign } from 'lucide-react';
import { getGames } from '../api';

const COLORS = ['#E31E24', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

export function GamesView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await getGames();
      if (res.ok) setData(res);
    } catch (e) {
      console.error('Games data error:', e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-ruby animate-spin" />
    </div>
  );

  const games = data?.games || [];
  const totalWagered = games.reduce((s: number, g: any) => s + (g.wagered || 0), 0);
  const totalGGR = games.reduce((s: number, g: any) => s + (g.ggr || 0), 0);
  const totalPlayers = games.reduce((s: number, g: any) => s + (g.unique_players || 0), 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Total Games</span>
            <Gamepad2 className="w-4 h-4 text-ruby" />
          </div>
          <div className="text-2xl font-bold text-white">{games.length}</div>
        </div>
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Total GGR</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{totalGGR.toLocaleString()}</div>
        </div>
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Unique Players</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalPlayers.toLocaleString()}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GGR by Game */}
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">GGR by Game</h3>
          {games.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={games.map((g: any) => ({ name: g.game, value: Math.max(0, g.ggr || 0) }))} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name }) => name}>
                  {games.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-zinc-500 text-sm py-8 text-center">No game data yet</p>}
        </div>

        {/* Wagered by Game */}
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Total Wagered by Game</h3>
          {games.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={games} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" tick={{ fill: '#999', fontSize: 11 }} />
                <YAxis dataKey="game" type="category" tick={{ fill: '#999', fontSize: 11 }} width={100} />
                <RechartsTooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="wagered" fill="#E31E24" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-zinc-500 text-sm py-8 text-center">No game data yet</p>}
        </div>
      </div>

      {/* Games Table */}
      <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal-lighter">
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Game</th>
                <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Total Bets</th>
                <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Players</th>
                <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Wagered</th>
                <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Won</th>
                <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase">GGR</th>
                <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Avg Bet</th>
                <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Biggest Win</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-lighter">
              {games.map((g: any, i: number) => (
                <tr key={i} className="hover:bg-charcoal-lighter/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-white font-medium">{g.game}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-300">{(g.total_bets || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-zinc-300">{(g.unique_players || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-white font-medium">{(g.wagered || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-zinc-300">{(g.won || 0).toLocaleString()}</td>
                  <td className={`px-4 py-3 text-right font-medium ${(g.ggr || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{(g.ggr || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-zinc-400">{Math.round(g.avg_bet || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-amber-400">{(g.biggest_win || 0).toLocaleString()}</td>
                </tr>
              ))}
              {games.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-zinc-500">No game data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
