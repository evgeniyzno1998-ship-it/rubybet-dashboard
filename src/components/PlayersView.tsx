import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Search, Users, DollarSign, TrendingUp, Percent, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPlayers } from '../api';

const segments = [
  { id: 'all', name: 'All Players' },
  { id: 'vip', name: 'VIP Players' },
  { id: 'depositors', name: 'Depositors' },
  { id: 'new', name: 'New Players' },
  { id: 'churn_risk', name: 'Churn Risk' },
];

export function PlayersView() {
  const [segment, setSegment] = useState('all');
  const [search, setSearch] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('created_at');
  const limit = 25;

  useEffect(() => {
    loadPlayers();
  }, [segment, offset, sort]);

  async function loadPlayers() {
    setLoading(true);
    try {
      const res = await getPlayers({ limit, offset, sort, search, segment });
      if (res.ok) {
        setPlayers(res.users || []);
        setTotal(res.total || 0);
      }
    } catch (e) {
      console.error('Failed to load players:', e);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setOffset(0);
    loadPlayers();
  }

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-6">
      {/* Search + Segments */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by username, name or ID..."
              className="w-full bg-charcoal-light border border-charcoal-lighter rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-ruby/50"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-ruby text-white rounded-lg text-sm font-medium hover:bg-ruby/90">Search</button>
        </form>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setOffset(0); }}
          className="bg-charcoal-light border border-charcoal-lighter rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
        >
          <option value="created_at">Newest</option>
          <option value="last_login">Last Active</option>
          <option value="total_wagered">Most Wagered</option>
          <option value="total_deposited_usd">Top Depositors</option>
          <option value="total_spins">Most Spins</option>
        </select>
      </div>

      {/* Segment Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {segments.map((s) => (
          <button
            key={s.id}
            onClick={() => { setSegment(s.id); setOffset(0); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${segment === s.id ? 'bg-ruby/10 text-ruby border border-ruby/30' : 'bg-charcoal-light text-zinc-400 border border-charcoal-lighter hover:text-white'
              }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Players" value={total.toLocaleString()} icon={<Users className="w-4 h-4" />} />
        <StatCard title="Page" value={`${currentPage} / ${totalPages || 1}`} icon={<TrendingUp className="w-4 h-4" />} />
      </div>

      {/* Table */}
      <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-ruby animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-charcoal-lighter">
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase">ID</th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Player</th>
                  <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Balance</th>
                  <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Wagered</th>
                  <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Deposited</th>
                  <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Spins</th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Last Active</th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-lighter">
                {players.map((p) => (
                  <tr key={p.user_id} className="hover:bg-charcoal-lighter/50 transition-colors">
                    <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{p.user_id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-ruby/10 flex items-center justify-center text-xs font-bold text-ruby">
                          {(p.username || p.first_name || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium">{p.username || p.first_name || `Player`}</div>
                          {p.is_premium ? <span className="text-[10px] text-amber-400">⭐ Premium</span> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white font-medium">{(p.coins || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-zinc-300">{(p.total_wagered || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-emerald-400">${(p.total_deposited_usd || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-zinc-400">{(p.total_spins || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{p.last_login ? new Date(p.last_login).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
                {players.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-zinc-500">No players found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-charcoal-lighter">
            <span className="text-xs text-zinc-500">{total} players total</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="p-1.5 rounded-lg bg-charcoal border border-charcoal-lighter hover:border-ruby/30 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-zinc-400">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg bg-charcoal border border-charcoal-lighter hover:border-ruby/30 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-500 uppercase tracking-wide">{title}</span>
        <div className="text-ruby">{icon}</div>
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}
