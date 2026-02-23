/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Gamepad2, Image as ImageIcon, Settings, LogOut, Menu, X, Gift, Megaphone, Wallet, ShieldAlert, Network, Radio, HeartPulse, LineChart } from 'lucide-react';
import { DashboardView } from './components/DashboardView';
import { MarketingView } from './components/MarketingView';
import { PlayersView } from './components/PlayersView';
import { BonusAnalyticsView } from './components/BonusAnalyticsView';
import { BonusManagementView } from './components/BonusManagementView';
import { GamesView } from './components/GamesView';
import { FinancialView } from './components/FinancialView';
import { RiskFraudView } from './components/RiskFraudView';
import { AffiliatesView } from './components/AffiliatesView';
import { LiveMonitorView } from './components/LiveMonitorView';
import { CohortsView } from './components/CohortsView';
import { ComplianceView } from './components/ComplianceView';
import { LoginPage } from './components/LoginPage';
import SettingsView from './components/SettingsView';
import { getStoredAdmin, logout, setOnAuthError } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [admin, setAdmin] = useState<any>(getStoredAdmin());
  const [isAuthenticated, setIsAuthenticated] = useState(!!getStoredAdmin());

  useEffect(() => {
    setOnAuthError(() => {
      setIsAuthenticated(false);
      setAdmin(null);
    });
  }, []);

  const handleLogin = (adminData: any) => {
    setAdmin(adminData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    logout();
    setAdmin(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'live_monitor':
        return <LiveMonitorView />;
      case 'players':
        return <PlayersView />;
      case 'cohorts':
        return <CohortsView />;
      case 'games':
        return <GamesView />;
      case 'financial':
        return <FinancialView />;
      case 'risk_fraud':
        return <RiskFraudView />;
      case 'compliance':
        return <ComplianceView />;
      case 'affiliates':
        return <AffiliatesView />;
      case 'bonus_analytics':
        return <BonusAnalyticsView />;
      case 'bonus_management':
        return <BonusManagementView />;
      case 'marketing':
        return <MarketingView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <div className="text-center">
              <h2 className="text-xl font-medium mb-2">Coming Soon</h2>
              <p>This section is under development.</p>
            </div>
          </div>
        );
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'live_monitor', label: 'Live Monitor', icon: <Radio className="w-5 h-5" /> },
    { id: 'players', label: 'Players', icon: <Users className="w-5 h-5" /> },
    { id: 'cohorts', label: 'Cohorts & LTV', icon: <LineChart className="w-5 h-5" /> },
    { id: 'games', label: 'Games', icon: <Gamepad2 className="w-5 h-5" /> },
    { id: 'financial', label: 'Financial & Cashier', icon: <Wallet className="w-5 h-5" /> },
    { id: 'risk_fraud', label: 'Risk & Anti-Fraud', icon: <ShieldAlert className="w-5 h-5" /> },
    { id: 'compliance', label: 'RG & Compliance', icon: <HeartPulse className="w-5 h-5" /> },
    { id: 'affiliates', label: 'Affiliates', icon: <Network className="w-5 h-5" /> },
    { id: 'bonus_analytics', label: 'Bonus Analytics', icon: <Gift className="w-5 h-5" /> },
    { id: 'bonus_management', label: 'Campaigns & CRM', icon: <Megaphone className="w-5 h-5" /> },
    { id: 'marketing', label: 'AI Assets', icon: <ImageIcon className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-charcoal text-soft-white flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-charcoal-light border-r border-charcoal-lighter transform transition-transform duration-200 ease-in-out flex flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-ruby flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(227,30,36,0.5)]">
              R
            </div>
            <span className="text-lg font-bold text-white tracking-tight font-display">RUBY<span className="text-ruby">BET</span></span>
          </div>
          <button className="lg:hidden text-zinc-400" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4 custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
                ? 'bg-ruby/10 text-ruby'
                : 'text-zinc-400 hover:bg-charcoal-lighter hover:text-soft-white'
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-charcoal-lighter">
          {admin && (
            <div className="px-3 py-2 mb-2">
              <div className="text-sm font-medium text-white">{admin.display_name || admin.username}</div>
              <div className="text-xs text-zinc-500 capitalize">{admin.role}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:bg-charcoal-lighter hover:text-soft-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-charcoal-lighter bg-charcoal-light/50 backdrop-blur-sm flex items-center px-4 lg:px-8 shrink-0 sticky top-0 z-30">
          <button
            className="lg:hidden mr-4 text-zinc-400 hover:text-soft-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-soft-white capitalize">
              {navItems.find(i => i.id === activeTab)?.label || activeTab}
            </h1>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                System Operational
              </div>
              <div className="w-8 h-8 rounded-full bg-charcoal-lighter border border-charcoal-lighter flex items-center justify-center">
                <Users className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
