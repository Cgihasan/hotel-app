'use client';

import { Bell, Search, ChevronDown, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { initialsOf } from '@/lib/utils';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}

export function Header({ title, subtitle, rightSlot }: HeaderProps) {
  const { user } = useAuth();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 px-6 py-4 backdrop-blur-xl md:px-8 dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center gap-4 pl-12 md:pl-0">
        <AnimatePresence mode="wait">
          {!mobileSearchOpen ? (
            <motion.div
              key="title"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="min-w-0 flex-1"
            >
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="relative flex-1 sm:hidden"
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-10 text-sm placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Quick search…"
              />
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-40 lg:w-64 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Quick search…"
            />
          </div>

          {!mobileSearchOpen && (
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-soft transition hover:text-brand-600 sm:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          )}

          <div className="hidden md:flex items-center gap-2">
            {rightSlot}
          </div>

          <button
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-soft transition hover:text-brand-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 pr-3 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-xs font-bold text-white">
              {user ? initialsOf(user.name) : '?'}
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold">{user?.name ?? '—'}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                {user?.role === 'owner' ? 'Owner' : 'Reception'}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
