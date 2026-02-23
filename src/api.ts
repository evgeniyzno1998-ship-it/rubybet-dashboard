/**
 * API Service for RubyBet Admin Dashboard
 * Handles JWT authentication and all admin API calls
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080';

// Token management
let token: string | null = localStorage.getItem('admin_token');
let onAuthError: (() => void) | null = null;

export function setToken(t: string | null) {
    token = t;
    if (t) localStorage.setItem('admin_token', t);
    else localStorage.removeItem('admin_token');
}

export function getToken(): string | null {
    return token || localStorage.getItem('admin_token');
}

export function setOnAuthError(fn: () => void) {
    onAuthError = fn;
}

async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
    const t = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };
    if (t) headers['Authorization'] = `Bearer ${t}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401) {
        setToken(null);
        onAuthError?.();
        throw new Error('Unauthorized');
    }

    const data = await res.json();
    if (!data.ok && data.error === 'forbidden') {
        throw new Error(`Forbidden: ${data.required || 'unknown section'}`);
    }
    return data;
}

// --- Auth ---
export async function login(username: string, password: string) {
    const data = await apiFetch('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
    if (data.ok && data.token) {
        setToken(data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.admin));
    }
    return data;
}

export function logout() {
    setToken(null);
    localStorage.removeItem('admin_user');
}

export function getStoredAdmin() {
    try {
        const s = localStorage.getItem('admin_user');
        return s ? JSON.parse(s) : null;
    } catch { return null; }
}

export async function getMe() {
    return apiFetch('/admin/auth/me');
}

export async function listAdmins() {
    return apiFetch('/admin/auth/users');
}

export async function createAdmin(data: { username: string; password: string; display_name: string; role: string; permissions: string[] }) {
    return apiFetch('/admin/auth/create', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateAdmin(data: { id: number; role?: string; permissions?: string[]; display_name?: string; is_active?: boolean; password?: string }) {
    return apiFetch('/admin/auth/update', { method: 'POST', body: JSON.stringify(data) });
}

export async function deleteAdmin(id: number) {
    return apiFetch('/admin/auth/delete', { method: 'POST', body: JSON.stringify({ id }) });
}

// --- Dashboard ---
export async function getStats() {
    return apiFetch('/admin/stats');
}

// --- Players ---
export async function getPlayers(params: { limit?: number; offset?: number; sort?: string; search?: string; segment?: string } = {}) {
    const q = new URLSearchParams();
    if (params.limit) q.set('limit', String(params.limit));
    if (params.offset) q.set('offset', String(params.offset));
    if (params.sort) q.set('sort', params.sort);
    if (params.search) q.set('search', params.search);
    if (params.segment) q.set('segment', params.segment);
    return apiFetch(`/admin/users?${q.toString()}`);
}

export async function getPlayerDetail(uid: number) {
    return apiFetch(`/admin/user/${uid}`);
}

export async function getPlayerBets(uid: number, limit = 100) {
    return apiFetch(`/admin/bets/${uid}?limit=${limit}`);
}

export async function getPlayerPayments(uid: number, limit = 100) {
    return apiFetch(`/admin/payments/${uid}?limit=${limit}`);
}

// --- Games ---
export async function getGames() {
    return apiFetch('/admin/games');
}

// --- Financial ---
export async function getFinancial(days = 30) {
    return apiFetch(`/admin/financial?days=${days}`);
}

// --- Cohorts ---
export async function getCohorts() {
    return apiFetch('/admin/cohorts');
}

// --- Live Monitor ---
export async function getLive(limit = 50) {
    return apiFetch(`/admin/live?limit=${limit}`);
}

// --- Affiliates ---
export async function getAffiliates() {
    return apiFetch('/admin/affiliates');
}

// --- Bonus Analytics ---
export async function getBonusStats() {
    return apiFetch('/admin/bonus-stats');
}

// --- Bonus Management ---
export async function createBonusCampaign(data: { bonus_type: string; title: string; description: string; amount: number; target: string; user_ids?: number[] }) {
    return apiFetch('/admin/bonus/create-campaign', { method: 'POST', body: JSON.stringify(data) });
}

export async function assignBonus(data: { user_id: number; bonus_type: string; title: string; amount: number }) {
    return apiFetch('/admin/bonus/assign', { method: 'POST', body: JSON.stringify(data) });
}
