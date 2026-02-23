import React, { useState } from 'react';
import { Gift, Loader2, Send, Users, Megaphone } from 'lucide-react';
import { createBonusCampaign, assignBonus } from '../api';

export function BonusManagementView() {
  const [mode, setMode] = useState<'campaign' | 'single'>('campaign');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Campaign form
  const [cTitle, setCTitle] = useState('');
  const [cType, setCType] = useState('free_spins');
  const [cAmount, setCAmount] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cTarget, setCTarget] = useState('all');

  // Single assign form
  const [sUserId, setSUserId] = useState('');
  const [sType, setSType] = useState('free_spins');
  const [sTitle, setSTitle] = useState('');
  const [sAmount, setSAmount] = useState('');

  async function handleCampaign(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await createBonusCampaign({ bonus_type: cType, title: cTitle, description: cDesc, amount: parseFloat(cAmount) || 0, target: cTarget });
      setResult(res);
    } catch (err: any) { setResult({ ok: false, error: err.message }); }
    finally { setLoading(false); }
  }

  async function handleSingle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await assignBonus({ user_id: parseInt(sUserId), bonus_type: sType, title: sTitle, amount: parseFloat(sAmount) || 0 });
      setResult(res);
    } catch (err: any) { setResult({ ok: false, error: err.message }); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      {/* Mode Tabs */}
      <div className="flex gap-2">
        <button onClick={() => { setMode('campaign'); setResult(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${mode === 'campaign' ? 'bg-ruby/10 text-ruby border border-ruby/30' : 'bg-charcoal-light text-zinc-400 border border-charcoal-lighter'}`}>
          <Megaphone className="w-4 h-4" /> Create Campaign
        </button>
        <button onClick={() => { setMode('single'); setResult(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${mode === 'single' ? 'bg-ruby/10 text-ruby border border-ruby/30' : 'bg-charcoal-light text-zinc-400 border border-charcoal-lighter'}`}>
          <Gift className="w-4 h-4" /> Assign to Player
        </button>
      </div>

      {/* Campaign Form */}
      {mode === 'campaign' && (
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create Bonus Campaign</h3>
          <form onSubmit={handleCampaign} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Title</label>
              <input value={cTitle} onChange={e => setCTitle(e.target.value)} required placeholder="Welcome Bonus"
                className="w-full bg-charcoal border border-charcoal-lighter rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ruby/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Type</label>
                <select value={cType} onChange={e => setCType(e.target.value)}
                  className="w-full bg-charcoal border border-charcoal-lighter rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none">
                  <option value="free_spins">Free Spins</option>
                  <option value="deposit_bonus">Deposit Bonus</option>
                  <option value="cashback">Cashback</option>
                  <option value="loyalty">Loyalty Reward</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Amount</label>
                <input value={cAmount} onChange={e => setCAmount(e.target.value)} type="number" step="0.01" required placeholder="100"
                  className="w-full bg-charcoal border border-charcoal-lighter rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ruby/50" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Target Segment</label>
              <select value={cTarget} onChange={e => setCTarget(e.target.value)}
                className="w-full bg-charcoal border border-charcoal-lighter rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none">
                <option value="all">All Players</option>
                <option value="vip">VIP Players (wagered ≥ 5000)</option>
                <option value="new">New Players (last 7 days)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Description</label>
              <textarea value={cDesc} onChange={e => setCDesc(e.target.value)} rows={2} placeholder="Bonus description..."
                className="w-full bg-charcoal border border-charcoal-lighter rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ruby/50 resize-none" />
            </div>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-ruby text-white rounded-lg text-sm font-semibold hover:bg-ruby/90 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Launch Campaign
            </button>
          </form>
        </div>
      )}

      {/* Single Assign Form */}
      {mode === 'single' && (
        <div className="bg-charcoal-light rounded-xl border border-charcoal-lighter p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Assign Bonus to Player</h3>
          <form onSubmit={handleSingle} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Player ID (Telegram)</label>
              <input value={sUserId} onChange={e => setSUserId(e.target.value)} required placeholder="123456789" type="number"
                className="w-full bg-charcoal border border-charcoal-lighter rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ruby/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Bonus Type</label>
                <select value={sType} onChange={e => setSType(e.target.value)}
                  className="w-full bg-charcoal border border-charcoal-lighter rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none">
                  <option value="free_spins">Free Spins</option>
                  <option value="deposit_bonus">Deposit Bonus</option>
                  <option value="cashback">Cashback</option>
                  <option value="loyalty">Loyalty Reward</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Amount</label>
                <input value={sAmount} onChange={e => setSAmount(e.target.value)} type="number" step="0.01" required placeholder="50"
                  className="w-full bg-charcoal border border-charcoal-lighter rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ruby/50" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Title</label>
              <input value={sTitle} onChange={e => setSTitle(e.target.value)} required placeholder="Manual Bonus"
                className="w-full bg-charcoal border border-charcoal-lighter rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ruby/50" />
            </div>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-ruby text-white rounded-lg text-sm font-semibold hover:bg-ruby/90 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
              Assign Bonus
            </button>
          </form>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`rounded-xl border p-4 ${result.ok ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          {result.ok ? (
            <div className="text-sm text-emerald-400">
              ✅ {result.assigned_count ? `Campaign launched! ${result.assigned_count} players received the bonus (target: ${result.target}).` : `Bonus assigned to user #${result.assigned_to}`}
            </div>
          ) : (
            <div className="text-sm text-red-400">❌ Error: {result.error}</div>
          )}
        </div>
      )}
    </div>
  );
}
