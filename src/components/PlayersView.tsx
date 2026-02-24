import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Search, Users, DollarSign, TrendingUp, Percent, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPlayers } from '../api';
import { PlayerDetailModal } from './PlayerDetailModal';

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
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
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
      {selectedPlayerId && (
        <PlayerDetailModal
          userId={selectedPlayerId}
          onClose={() => setSelectedPlayerId(null)}
          onUpdate={loadPlayers}
        />
      )}

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
          <button type="submit" className="px-4 py-2 bg-ruby text-white rounded-lg text-sm font-medium hover:bg-ruby/90 transition-colors">Search</button>
        </form>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setOffset(0); }}
          className="bg-charcoal-light border border-charcoal-lighter rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-ruby/30"
        >
          <option value="created_at">Newest</option>
          <option value="last_login">Last Active</option>
          <option value="total_wagered">Most Wagered</option>
          <option value="total_deposited_usd">Top Depositors</option>
          <option value="total_spins">Most Spins</option>
          <option value="balance_usdt_cents">Balance (USDT)</option>
        </select>
      </div>

      {/* Segment Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {segments.map((s) => (
          <button
            key={s.id}
            onClick={() => { setSegment(s.id); setOffset(0); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${segment === s.id ? 'bg-ruby/10 text-ruby border-ruby/30 shadow-lg shadow-ruby/5' : 'bg-charcoal-light text-zinc-400 border-charcoal-lighter hover:text-white hover:border-zinc-700'
              }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Players" value={total.toLocaleString()} icon={<Users className="w-4 h-4" />} />
        <StatCard title="Active Segments" value={segments.length.toString()} icon={<TrendingUp className="w-4 h-4" />} />
        <StatCard title="Page" value={`${currentPage} / ${totalPages || 1}`} icon={<TrendingUp className="w-4 h-4" />} />
      </div>

      {/* Table */}
      <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-ruby animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-charcoal-lighter bg-charcoal/30">
                  <th className="text-left px-4 py-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">ID</th>
                  <th className="text-left px-4 py-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Player</th>
                  <th className="text-right px-4 py-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Balance</th>
                  <th className="text-right px-4 py-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Wagered</th>
                  <th className="text-right px-4 py-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Deposited</th>
                  <th className="text-left px-4 py-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-lighter">
                {players.map((p) => (
                  <tr
                    key={p.user_id}
                    onClick={() => setSelectedPlayerId(p.user_id)}
                    className="hover:bg-ruby/5 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-4 text-zinc-500 font-mono text-[10px] group-hover:text-ruby/70">{p.user_id}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-700 group-hover:bg-ruby/10 group-hover:border-ruby/30 group-hover:text-ruby">
                          {(p.username || p.first_name || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-zinc-100 font-semibold text-sm group-hover:text-white">{p.username || p.first_name || `Player`}</div>
                          <div className="text-[10px] text-zinc-500">{p.is_premium ? '⭐ Premium' : 'Free Member'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="text-zinc-100 font-bold">${(p.balance_usdt_cents / 100).toFixed(2)}</div>
                      <div className="text-[10px] text-zinc-500">{(p.coins || 0).toLocaleString()} coins</div>
                    </td>
                    <td className="px-4 py-4 text-right text-zinc-400 font-medium">
                      ${(p.total_wagered || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="text-emerald-400 font-bold">${(p.total_deposited_usd || 0).toFixed(2)}</div>
                    </td>
                    <td className="px-4 py-4">
                      {p.is_blocked ? (
                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider border border-red-500/20">Blocked</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-500 text-[11px]">
                      {p.last_login ? new Date(p.last_login).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                ))}
                {players.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-16 text-center text-zinc-600 italic">No players matching criteria.</td></tr>
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
