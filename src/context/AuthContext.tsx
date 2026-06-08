'use client';

import { create } from 'zustand';
import type { User, UserRole } from '@/types';
import { loadAuth, saveAuth } from '@/lib/storage';

interface AuthStore {
  user: User | null;
  isHydrated: boolean;
  hydrate: () => void;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const ALLOWED_USERS: Record<string, { name: string; role: UserRole }> = {
  'owner@hotel.com': { name: 'Sofia Bennett', role: 'owner' },
  'reception@hotel.com': { name: 'Marcus Hill', role: 'reception' },
};

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  isHydrated: false,
  hydrate: () => {
    const stored = loadAuth();
    set({ user: stored, isHydrated: true });
  },
  login: async (email, _password) => {
    const normalized = email.trim().toLowerCase();
    const profile = ALLOWED_USERS[normalized];
    await new Promise((r) => setTimeout(r, 400));
    if (!profile) {
      throw new Error('Invalid email or password.');
    }
    const user: User = { email: normalized, name: profile.name, role: profile.role };
    saveAuth(user);
    set({ user });
    return user;
  },
  logout: () => {
    saveAuth(null);
    set({ user: null });
  },
}));
