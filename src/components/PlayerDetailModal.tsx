import React, { useState, useEffect } from 'react';
import {
    X, Loader2, DollarSign, Gift, Shield, AlertTriangle,
    History, CreditCard, Save, Ban, CheckCircle2
} from 'lucide-react';
import { getPlayerDetail, updatePlayer, savePlayerNote } from '../api';

interface PlayerDetailModalProps {
    userId: number;
    onClose: () => void;
    onUpdate: () => void;
}

export function PlayerDetailModal({ userId, onClose, onUpdate }: PlayerDetailModalProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Editable fields
    const [coins, setCoins] = useState<number>(0);
    const [balanceUsdtCents, setBalanceUsdtCents] = useState<number>(0);
    const [freeSpins, setFreeSpins] = useState<number>(0);
    const [isBlocked, setIsBlocked] = useState<boolean>(false);
    const [adminNote, setAdminNote] = useState<string>('');

    useEffect(() => {
        loadDetail();
    }, [userId]);

    async function loadDetail() {
        setLoading(true);
        try {
            const res = await getPlayerDetail(userId);
            if (res.ok) {
                setData(res);
                setCoins(res.user.coins || 0);
                setBalanceUsdtCents(res.user.balance_usdt_cents || 0);
                setFreeSpins(res.user.free_spins || 0);
                setIsBlocked(!!res.user.is_blocked);
                setAdminNote(res.user.admin_note || '');
            } else {
                setError(res.error || 'Failed to load details');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            await Promise.all([
                updatePlayer(userId, { coins, balance_usdt_cents: balanceUsdtCents, free_spins: freeSpins, is_blocked: isBlocked }),
                savePlayerNote(userId, adminNote)
            ]);
            onUpdate();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-sm">
                <Loader2 className="w-8 h-8 text-ruby animate-spin" />
            </div>
        );
    }

    if (!data) return null;

    const { user, vip, game_stats, deposit_summary } = data;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-charcoal-light w-full max-w-4xl max-h-[90vh] rounded-2xl border border-charcoal-lighter shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-charcoal-lighter flex items-center justify-between bg-charcoal/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-ruby/10 flex items-center justify-center text-ruby text-lg font-bold border border-ruby/20">
                            {(user.username || user.first_name || '?')[0].toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                {user.username || user.first_name || 'Player'}
                                <span className="text-xs font-mono text-zinc-500 font-normal">#{user.user_id}</span>
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-zinc-400 capitalize">{vip.name}</span>
                                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                <span className="text-xs text-zinc-400">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                                {isBlocked && <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Blocked</span>}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left Col: Balance & Status */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Financial Management</h4>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5 block">USDT Balance (Cents)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                        <input
                                            type="number"
                                            value={balanceUsdtCents}
                                            onChange={e => setBalanceUsdtCents(parseInt(e.target.value) || 0)}
                                            className="w-full bg-charcoal border border-charcoal-lighter rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ruby/20"
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-500 mt-1">Value: ${(balanceUsdtCents / 100).toFixed(2)} USD</p>
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5 block">Legacy Coins</label>
                                    <div className="relative">
                                        <History className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ruby" />
                                        <input
                                            type="number"
                                            value={coins}
                                            onChange={e => setCoins(parseInt(e.target.value) || 0)}
                                            className="w-full bg-charcoal border border-charcoal-lighter rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ruby/20"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5 block">Free Spins</label>
                                    <div className="relative">
                                        <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
                                        <input
                                            type="number"
                                            value={freeSpins}
                                            onChange={e => setFreeSpins(parseInt(e.target.value) || 0)}
                                            className="w-full bg-charcoal border border-charcoal-lighter rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ruby/20"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        onClick={() => setIsBlocked(!isBlocked)}
                                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all font-semibold text-sm ${isBlocked ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20' : 'bg-charcoal border-charcoal-lighter text-zinc-400 hover:text-white hover:border-zinc-700'
                                            }`}>
                                        <Ban className="w-4 h-4" />
                                        {isBlocked ? 'Unblock Player' : 'Block Player Access'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Middle Col: Stats & Activity */}
                        <div className="md:col-span-2 space-y-6">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Player Activity & KPI</h4>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <MiniStat label="Wagered" value={`$${user.total_wagered?.toLocaleString()}`} color="text-ruby" />
                                <MiniStat label="Deposited" value={`$${user.total_deposited_usd?.toFixed(2)}`} color="text-emerald-500" />
                                <MiniStat label="Withdrawals" value={`$${user.total_withdrawn_usd?.toFixed(2)}`} color="text-red-500" />
                                <MiniStat label="Total Spins" value={user.total_spins?.toLocaleString()} color="text-ruby" />
                            </div>

                            <div className="bg-charcoal rounded-2xl border border-charcoal-lighter p-6">
                                <h5 className="text-[10px] uppercase font-bold text-zinc-500 mb-4 tracking-widest flex items-center gap-2">
                                    <History className="w-3 h-3" /> Performance by Game
                                </h5>
                                <div className="space-y-4">
                                    {game_stats.length ? game_stats.map((g: any) => (
                                        <div key={g.game} className="flex items-center justify-between group">
                                            <div>
                                                <div className="text-xs font-bold text-white capitalize">{g.game.replace('_', ' ')}</div>
                                                <div className="text-[10px] text-zinc-500">{g.cnt} bets placed</div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-xs font-bold ${g.profit < 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {g.profit < 0 ? `+$${Math.abs(g.profit).toLocaleString()}` : `-$${g.profit.toLocaleString()}`}
                                                </div>
                                                <div className="text-[10px] text-zinc-500 lowercase">House GGR</div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-xs text-zinc-600 italic">No game activity recorded yet.</div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Admin Notes</label>
                                <textarea
                                    value={adminNote}
                                    onChange={e => setAdminNote(e.target.value)}
                                    placeholder="Internal notes about this player..."
                                    rows={4}
                                    className="w-full bg-charcoal border border-charcoal-lighter rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ruby/20 resize-none font-sans"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-charcoal-lighter bg-charcoal/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-2.5 bg-ruby hover:bg-ruby-light text-white rounded-xl text-sm font-bold shadow-lg shadow-ruby/20 transition-all flex items-center gap-2 disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Player Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

function MiniStat({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="bg-charcoal/30 border border-charcoal-lighter/50 rounded-xl p-3">
            <div className="text-[9px] uppercase font-bold text-zinc-500 mb-1">{label}</div>
            <div className={`text-sm font-bold ${color}`}>{value}</div>
        </div>
    );
}
