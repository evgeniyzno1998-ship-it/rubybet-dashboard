import React, { useState, useEffect } from 'react';
import {
    User, Shield, Lock, Trash2, Edit3, Plus,
    Check, X, AlertTriangle, Key, Users, Settings as SettingsIcon
} from 'lucide-react';
import {
    getStoredAdmin, logout, listAdmins, createAdmin,
    updateAdmin, deleteAdmin, getMe
} from '../api';

const ADMIN_SECTIONS = [
    'dashboard', 'live_monitor', 'players', 'cohorts', 'games',
    'financial', 'risk_fraud', 'compliance', 'affiliates',
    'bonus_analytics', 'bonus_management', 'marketing', 'settings'
];

const ROLES = [
    { id: 'owner', label: 'Owner', desc: 'Full access to everything' },
    { id: 'admin', label: 'Admin', desc: 'Full access except deleting admins' },
    { id: 'manager', label: 'Manager', desc: 'Custom access to specific sections' },
    { id: 'viewer', label: 'Viewer', desc: 'Read-only access to specific sections' }
];

export default function SettingsView() {
    const currentAdmin = getStoredAdmin();
    const isOwner = currentAdmin?.role === 'owner';

    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'team'>('profile');

    // Create/Edit Admin Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<any>(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        display_name: '',
        role: 'viewer',
        permissions: [] as string[]
    });

    // Password Change State
    const [pwdData, setPwdData] = useState({ old: '', new: '', confirm: '' });
    const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (activeTab === 'team' && isOwner) {
            fetchAdmins();
        }
    }, [activeTab]);

    async function fetchAdmins() {
        setLoading(true);
        try {
            const res = await listAdmins();
            if (res.ok) setAdmins(res.users);
            else throw new Error(res.error);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let res;
            if (editingAdmin) {
                res = await updateAdmin({
                    id: editingAdmin.id,
                    role: formData.role,
                    permissions: formData.permissions,
                    display_name: formData.display_name,
                    password: formData.password || undefined
                });
            } else {
                res = await createAdmin(formData as any);
            }

            if (res.ok) {
                setIsModalOpen(false);
                fetchAdmins();
            } else throw new Error(res.error);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this admin account?')) return;
        try {
            const res = await deleteAdmin(id);
            if (res.ok) fetchAdmins();
            else throw new Error(res.error);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleSectionToggle = (section: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(section)
                ? prev.permissions.filter(p => p !== section)
                : [...prev.permissions, section]
        }));
    };

    const openEditModal = (admin: any) => {
        setEditingAdmin(admin);
        setFormData({
            username: admin.username,
            password: '',
            display_name: admin.display_name,
            role: admin.role,
            permissions: admin.permissions || []
        });
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingAdmin(null);
        setFormData({
            username: '',
            password: '',
            display_name: '',
            role: 'viewer',
            permissions: ['dashboard']
        });
        setIsModalOpen(true);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pwdData.new !== pwdData.confirm) {
            setPwdMsg({ type: 'error', text: 'Passwords do not match' });
            return;
        }
        setLoading(true);
        try {
            // We reuse the updateAdmin endpoint for the current user
            const res = await updateAdmin({
                id: currentAdmin.id,
                password: pwdData.new
            });
            if (res.ok) {
                setPwdMsg({ type: 'success', text: 'Password updated successfully' });
                setPwdData({ old: '', new: '', confirm: '' });
            } else throw new Error(res.error);
        } catch (err: any) {
            setPwdMsg({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <SettingsIcon className="w-8 h-8 text-blue-500" />
                        Settings & Team
                    </h1>
                    <p className="text-gray-400">Manage your profile and administrator access</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-900/50 p-1 rounded-lg w-fit border border-gray-800">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                >
                    <User className="w-4 h-4" />
                    My Profile
                </button>
                {isOwner && (
                    <button
                        onClick={() => setActiveTab('team')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'team' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        Team Management
                    </button>
                )}
            </div>

            {activeTab === 'profile' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* My Info */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-500" />
                            Account Information
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between py-3 border-b border-gray-800">
                                <span className="text-gray-400">Display Name</span>
                                <span className="font-semibold">{currentAdmin?.display_name || 'Administrator'}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-800">
                                <span className="text-gray-400">Username</span>
                                <span className="font-semibold">@{currentAdmin?.username}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-800">
                                <span className="text-gray-400">Role</span>
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
                                    {currentAdmin?.role}
                                </span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-800">
                                <span className="text-gray-400">Account ID</span>
                                <span className="text-gray-300 font-mono text-sm">#{currentAdmin?.id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-yellow-500" />
                            Change Password
                        </h2>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={pwdData.new}
                                    onChange={e => setPwdData({ ...pwdData, new: e.target.value })}
                                    className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={pwdData.confirm}
                                    onChange={e => setPwdData({ ...pwdData, confirm: e.target.value })}
                                    className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            {pwdMsg && (
                                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${pwdMsg.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                    }`}>
                                    {pwdMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                    {pwdMsg.text}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processing...' : <><Key className="w-4 h-4" /> Update Password</>}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                /* Team Management Tab */
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Users className="w-6 h-6 text-blue-500" />
                            Administrators List
                        </h2>
                        <button
                            onClick={openCreateModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/20"
                        >
                            <Plus className="w-5 h-5" />
                            Add Member
                        </button>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-black/40 border-b border-gray-800">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Administrator</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Access</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Last Login</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {admins.map(admin => (
                                    <tr key={admin.id} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 font-bold">
                                                    {admin.display_name?.[0]?.toUpperCase() || admin.username?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{admin.display_name || 'Admin User'}</div>
                                                    <div className="text-sm text-gray-400">@{admin.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${admin.role === 'owner' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                    admin.role === 'admin' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                }`}>
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {admin.permissions?.includes('*') ? (
                                                    <span className="text-xs text-green-400 font-medium">Full Access</span>
                                                ) : admin.permissions?.slice(0, 3).map((p: string) => (
                                                    <span key={p} className="text-[10px] px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700 text-gray-300">
                                                        {p}
                                                    </span>
                                                ))}
                                                {admin.permissions?.length > 3 && (
                                                    <span className="text-[10px] text-gray-500">+{admin.permissions.length - 3} more</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {admin.last_login ? new Date(admin.last_login).toLocaleString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(admin)}
                                                    className="p-2 hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                {admin.id !== currentAdmin.id && (
                                                    <button
                                                        onClick={() => handleDelete(admin.id)}
                                                        className="p-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {admins.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No team members found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create/Edit Admin Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                {editingAdmin ? <Edit3 className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-blue-500" />}
                                {editingAdmin ? `Edit Administrator: ${editingAdmin.username}` : 'Add New Member'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrUpdate} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={!!editingAdmin}
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Display Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Finance Manager"
                                        value={formData.display_name}
                                        onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                                        className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    {editingAdmin ? 'New Password (leave empty to keep current)' : 'Password'}
                                </label>
                                <input
                                    type="password"
                                    required={!editingAdmin}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Role & Permissions</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                    {ROLES.map(role => (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => {
                                                setFormData({
                                                    ...formData,
                                                    role: role.id,
                                                    permissions: role.id === 'owner' || role.id === 'admin' ? ['*'] : formData.permissions
                                                });
                                            }}
                                            className={`text-left p-3 rounded-xl border transition-all ${formData.role === role.id
                                                    ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500'
                                                    : 'bg-black/40 border-gray-800 hover:border-gray-700'
                                                }`}
                                        >
                                            <div className="font-bold flex items-center justify-between">
                                                {role.label}
                                                {formData.role === role.id && <Check className="w-4 h-4 text-blue-500" />}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">{role.desc}</div>
                                        </button>
                                    ))}
                                </div>

                                {formData.role !== 'owner' && formData.role !== 'admin' && (
                                    <div className="space-y-3">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Select Sections Access</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {ADMIN_SECTIONS.filter(s => s !== 'settings').map(section => (
                                                <button
                                                    key={section}
                                                    type="button"
                                                    onClick={() => handleSectionToggle(section)}
                                                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center justify-between ${formData.permissions.includes(section)
                                                            ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                                                            : 'bg-black/40 border-gray-800 text-gray-500'
                                                        }`}
                                                >
                                                    {section.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
                                                    {formData.permissions.includes(section) && <Check className="w-3 h-3 text-blue-500" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Processing...' : editingAdmin ? 'Save Changes' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
