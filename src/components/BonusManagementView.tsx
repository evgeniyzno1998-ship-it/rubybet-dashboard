import React, { useState, useEffect } from 'react';
import { Gift, Loader2, Send, Users, Megaphone, FileText, CheckCircle2, AlertCircle, Radio, Settings, Palette } from 'lucide-react';
import { getBonusTemplates, getBonusCampaigns, issueBonuses } from '../api';

type Tab = 'issue' | 'templates' | 'active';

export function BonusManagementView() {
  const [activeTab, setActiveTab] = useState<Tab>('issue');
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);

  // Form State
  const [isTemplate, setIsTemplate] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [manualType, setManualType] = useState('free_spins');
  const [manualTitle, setManualTitle] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [targetSegment, setTargetSegment] = useState('all');
  const [sendNotif, setSendNotif] = useState(true);
  const [notifMessage, setNotifMessage] = useState('Hey {name}! Here is your special bonus...');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [tplRes, cmpRes] = await Promise.all([getBonusTemplates(), getBonusCampaigns()]);
      if (tplRes.ok) setTemplates(tplRes.templates);
      if (cmpRes.ok) setCampaigns(tplRes.campaigns || []); // Using templates mock if campaigns empty for now
    } catch (err) { console.error(err); }
  }

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await issueBonuses({
        is_template: isTemplate,
        template_id: isTemplate ? parseInt(selectedTemplateId) : undefined,
        bonus_type: !isTemplate ? manualType : undefined,
        title: !isTemplate ? manualTitle : undefined,
        amount: !isTemplate ? parseFloat(manualAmount) : undefined,
        target_segment: targetSegment,
        send_notification: sendNotif,
        notification_message: notifMessage
      });
      setResult(res);
      fetchData();
    } catch (err: any) {
      setResult({ ok: false, error: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-charcoal-lighter pb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-1">Campaigns & CRM</h2>
          <p className="text-zinc-400 text-sm">Manage bonus templates, distribute them, and track active bonuses.</p>
        </div>
        <div className="flex items-center gap-2 bg-charcoal-light p-1 rounded-xl border border-charcoal-lighter">
          <button
            onClick={() => setActiveTab('issue')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'issue' ? 'bg-ruby text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}>
            Issue Bonus
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'templates' ? 'bg-ruby text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}>
            Bonus Templates
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'active' ? 'bg-ruby text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}>
            Active Bonuses
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Issue Column */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'issue' && (
            <div className="bg-charcoal-light/50 backdrop-blur-sm rounded-2xl border border-charcoal-lighter p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-ruby/10 rounded-xl">
                  <Megaphone className="w-6 h-6 text-ruby" />
                </div>
                <h3 className="text-xl font-semibold text-white">Issue Bonus to Players</h3>
              </div>

              <form onSubmit={handleIssue} className="space-y-8">
                {/* 1. Select Bonus */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-ruby text-[10px] text-white">1</span>
                    Select Bonus
                  </div>
                  <div className="flex items-center gap-6 p-4 bg-charcoal rounded-xl border border-charcoal-lighter">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="bonus_source"
                        checked={isTemplate}
                        onChange={() => setIsTemplate(true)}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isTemplate ? 'border-ruby' : 'border-zinc-600'}`}>
                        {isTemplate && <div className="w-2 h-2 rounded-full bg-ruby" />}
                      </div>
                      <span className={`text-sm transition-colors ${isTemplate ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'}`}>From Template</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="bonus_source"
                        checked={!isTemplate}
                        onChange={() => setIsTemplate(false)}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${!isTemplate ? 'border-ruby' : 'border-zinc-600'}`}>
                        {!isTemplate && <div className="w-2 h-2 rounded-full bg-ruby" />}
                      </div>
                      <span className={`text-sm transition-colors ${!isTemplate ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'}`}>Manual / No-Deposit</span>
                    </label>
                  </div>

                  {isTemplate ? (
                    <select
                      value={selectedTemplateId}
                      onChange={e => setSelectedTemplateId(e.target.value)}
                      className="w-full bg-charcoal border border-charcoal-lighter rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ruby/20 transition-all appearance-none cursor-pointer">
                      <option value="">Select a template...</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name} (${t.amount})</option>
                      ))}
                      {!templates.length && <option disabled>No templates available</option>}
                    </select>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                      <select
                        value={manualType}
                        onChange={e => setManualType(e.target.value)}
                        className="bg-charcoal border border-charcoal-lighter rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ruby/20">
                        <option value="free_spins">Free Spins</option>
                        <option value="deposit_bonus">Deposit Bonus</option>
                        <option value="cashback">Cashback</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={manualAmount}
                        onChange={e => setManualAmount(e.target.value)}
                        className="bg-charcoal border border-charcoal-lighter rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ruby/20"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Target Audience */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-ruby text-[10px] text-white">2</span>
                    Target Audience
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Target Segment</label>
                    <select
                      value={targetSegment}
                      onChange={e => setTargetSegment(e.target.value)}
                      className="w-full bg-charcoal border border-charcoal-lighter rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ruby/20 appearance-none cursor-pointer">
                      <option value="all">All Players (~12,450)</option>
                      <option value="vip">VIP Players (~850)</option>
                      <option value="new">New Players (last 7 days)</option>
                      <option value="churn_risk">Churn Risk (inactive 14d+)</option>
                    </select>
                  </div>
                </div>

                {/* 3. Notification */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-ruby text-[10px] text-white">3</span>
                    Notification
                  </div>
                  <div className="flex items-center justify-between p-4 bg-charcoal/30 rounded-xl border border-charcoal-lighter">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${sendNotif ? 'bg-ruby' : 'bg-charcoal-lighter'}`} onClick={() => setSendNotif(!sendNotif)}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${sendNotif ? 'left-6' : 'left-1'}`} />
                      </div>
                      <span className="text-sm font-medium text-white">Send Telegram Notification</span>
                    </div>
                  </div>

                  {sendNotif && (
                    <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                      <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Telegram Push Message</label>
                      <textarea
                        value={notifMessage}
                        onChange={e => setNotifMessage(e.target.value)}
                        rows={4}
                        className="w-full bg-charcoal border border-charcoal-lighter rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ruby/20 resize-none font-sans"
                        placeholder="Type your message here..."
                      />
                      <p className="text-[10px] text-zinc-500">Available placeholders: <code className="text-ruby">{"{name}"}</code>, <code className="text-ruby">{"{amount}"}</code></p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-charcoal-lighter">
                  <button
                    type="submit"
                    disabled={loading || (isTemplate && !selectedTemplateId)}
                    className="w-full bg-ruby hover:bg-ruby-light text-white font-bold py-4 rounded-xl shadow-lg shadow-ruby/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group">
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        Launch Campaign & Notify Players
                      </>
                    )}
                  </button>
                </div>
              </form>

              {result && (
                <div className={`mt-6 p-4 rounded-xl border ${result.ok ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <div className="flex items-center gap-3">
                    {result.ok ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                    <span className={`text-sm ${result.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                      {result.ok ? `Campaign launched successfully! ${result.assigned_count} players received the bonus.` : `Error: ${result.error}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="bg-charcoal-light/50 rounded-2xl border border-charcoal-lighter p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-semibold text-white">Bonus Templates</h3>
                <button className="px-4 py-2 bg-charcoal rounded-lg border border-charcoal-lighter text-sm font-medium text-white hover:bg-charcoal-lighter transition-all">
                  + New Template
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(t => (
                  <div key={t.id} className="bg-charcoal border border-charcoal-lighter p-5 rounded-2xl hover:border-ruby/30 transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-ruby/5 rounded-lg text-ruby group-hover:bg-ruby group-hover:text-white transition-all">
                        <Palette className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] bg-charcoal-lighter px-2 py-1 rounded text-zinc-400 uppercase font-bold">{t.bonus_type}</span>
                    </div>
                    <h4 className="text-white font-semibold mb-1">{t.name}</h4>
                    <p className="text-zinc-500 text-xs mb-4 line-clamp-1">{t.description || 'No description'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-ruby font-bold">${t.amount}</span>
                      <button className="text-[10px] text-zinc-500 hover:text-white font-bold uppercase tracking-wider">Edit Template</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'active' && (
            <div className="bg-charcoal-light/50 rounded-2xl border border-charcoal-lighter p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Active Campaigns</h3>
              <div className="space-y-4">
                {campaigns.length ? campaigns.map(c => (
                  <div key={c.id} className="bg-charcoal border border-charcoal-lighter p-6 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-white font-semibold">{c.title}</h4>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold uppercase">Active</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <span className="capitalize">{c.bonus_type.replace('_', ' ')}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-700" />
                        <span>{c.target_segment}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{c.claimed_players} / {c.total_players}</div>
                      <div className="text-[10px] text-zinc-500 uppercase font-bold">Claimed</div>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-zinc-500">
                    <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p>No active campaigns found.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Active Campaigns List */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
              Active Campaigns
              <span className="text-ruby text-[10px] lowercase font-normal italic">View all</span>
            </h4>
            <div className="space-y-3">
              {[
                { title: 'VIP Weekly Cashback', type: 'Cashback', target: 'VIP Players', progress: 65, current: 292, max: 450 },
                { title: 'Reactivation Free Spins', type: 'Free Spins', target: 'Churn Risk', progress: 12, current: 600, max: 5000 }
              ].map((c, i) => (
                <div key={i} className="bg-charcoal-light border border-charcoal-lighter p-5 rounded-2xl hover:bg-charcoal-lighter transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="text-white font-semibold text-sm group-hover:text-ruby transition-colors">{c.title}</h5>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase">Active</span>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <span className="text-[10px] bg-charcoal px-2 py-0.5 rounded text-zinc-400 font-bold uppercase">{c.type}</span>
                    <span className="text-[10px] bg-charcoal px-2 py-0.5 rounded text-zinc-400 font-bold uppercase">{c.target}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-zinc-500">
                      <span className="font-bold">Claim Rate</span>
                      <span className="font-bold text-white">{c.current} / {c.max} ({c.progress}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-charcoal rounded-full overflow-hidden">
                      <div className="h-full bg-ruby rounded-full" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bot Status Panel */}
          <div className="bg-charcoal-light border border-charcoal-lighter p-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Telegram Mini App</h4>
                <p className="text-[10px] text-zinc-500">Push Notification Gateway</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white mb-1">Bot Status: Online</h5>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">Delivery rate for the last 24 hours is <span className="text-emerald-500 font-bold">98.5%</span>.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-charcoal-lighter">
                <div className="text-center p-3 rounded-xl bg-charcoal/30">
                  <div className="text-lg font-bold text-white">12.4k</div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase">Reach</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-charcoal/30">
                  <div className="text-lg font-bold text-white">82%</div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase">Open Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
