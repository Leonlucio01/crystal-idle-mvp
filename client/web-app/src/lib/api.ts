import type { AuthResponse, Character, LeaderboardRow, UpgradeStat, Zone } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || `Error HTTP ${response.status}`);
  }

  return payload as T;
}

export const api = {
  login(email: string, password: string) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  register(email: string, password: string, characterName: string, characterClass: string) {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, characterName, characterClass }),
    });
  },
  me(token: string) {
    return request<{ success: boolean; data: Character }>('/character/me', {}, token);
  },
  zones() {
    return request<{ success: boolean; data: Zone[] }>('/zones');
  },
  attack(token: string, enemyTypeId: string) {
    return request<{ success: boolean; data: { character: Character; damage?: number; isCrit?: boolean; enemyKilled: boolean; goldEarned: number; xpEarned: number; levelsGained: number } }>('/combat/kill', {
      method: 'POST',
      body: JSON.stringify({ enemyTypeId }),
    }, token);
  },
  changeZone(token: string, zoneId: string) {
    return request<{ success: boolean; data: Character }>('/character/change-zone', {
      method: 'POST',
      body: JSON.stringify({ zoneId }),
    }, token);
  },
  upgrade(token: string, stat: UpgradeStat) {
    return request<{ success: boolean; data: { character: Character } }>('/character/upgrade-stat', {
      method: 'POST',
      body: JSON.stringify({ stat }),
    }, token);
  },
  claimOffline(token: string) {
    return request<{ success: boolean; data: { character: Character; kills: number; goldEarned: number; xpEarned: number } }>('/idle/claim-offline', {
      method: 'POST',
    }, token);
  },
  leaderboard() {
    return request<{ success: boolean; data: LeaderboardRow[] }>('/leaderboard/power');
  },
};
