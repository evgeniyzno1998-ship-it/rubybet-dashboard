import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { login } from '../api';

export function LoginPage({ onLogin }: { onLogin: (admin: any) => void }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await login(username, password);
            if (res.ok) {
                onLogin(res.admin);
            } else {
                setError(res.error === 'invalid_credentials' ? 'Wrong username or password' : res.error || 'Login failed');
            }
        } catch (err: any) {
            setError(err.message || 'Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-charcoal flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-ruby flex items-center justify-center font-bold text-white text-xl shadow-[0_0_15px_rgba(227,30,36,0.5)]">
                            R
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight font-display">
                            RUBY<span className="text-ruby">BET</span>
                        </span>
                    </div>
                    <p className="text-zinc-500 text-sm">Admin Dashboard</p>
                </div>

                {/* Login Card */}
                <div className="bg-charcoal-light rounded-2xl border border-charcoal-lighter p-6 shadow-xl">
                    <h2 className="text-lg font-semibold text-white mb-6 text-center">Sign In</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-charcoal border border-charcoal-lighter rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-ruby/50 focus:ring-1 focus:ring-ruby/20 transition-colors"
                                    placeholder="Enter username"
                                    autoComplete="username"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-charcoal border border-charcoal-lighter rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-ruby/50 focus:ring-1 focus:ring-ruby/20 transition-colors"
                                    placeholder="Enter password"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-ruby hover:bg-ruby/90 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_12px_rgba(227,30,36,0.3)]"
                        >
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>
                </div>

                <p className="text-zinc-600 text-xs text-center mt-4">
                    Secured with JWT authentication
                </p>
            </div>
        </div>
    );
}
