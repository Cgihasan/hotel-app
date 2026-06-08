'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarCheck2,
  BedDouble,
  Search,
  Settings,
  LogOut,
  Hotel,
  X,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { cn, initialsOf } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Array<'owner' | 'reception'>;
  badge?: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['owner', 'reception'] },
  { label: 'Reservations', href: '/reservations', icon: CalendarCheck2, roles: ['owner', 'reception'] },
  { label: 'Rooms', href: '/rooms', icon: BedDouble, roles: ['owner'] },
  { label: 'Availability', href: '/availability', icon: Search, roles: ['owner', 'reception'] },
  { label: 'Settings', href: '/settings', icon: Settings, roles: ['owner'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const items = NAV_ITEMS.filter((i) => (user ? i.roles.includes(user.role) : false));

  const onLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-30 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-soft md:hidden dark:border-slate-800 dark:bg-slate-900"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className="relative z-50 h-full w-72 bg-white p-5 shadow-2xl dark:bg-slate-900"
            >
              <SidebarContent
                items={items}
                pathname={pathname}
                collapsed={false}
                onNavigate={() => setMobileOpen(false)}
                user={user}
                onLogout={onLogout}
                onToggleCollapse={() => undefined}
                onCloseMobile={() => setMobileOpen(false)}
                isMobile
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'sticky top-0 z-20 hidden h-screen shrink-0 border-r border-slate-200/70 bg-white/80 backdrop-blur transition-all duration-300 md:flex md:flex-col',
          'dark:border-slate-800 dark:bg-slate-900/80',
          collapsed ? 'w-20' : 'w-72',
        )}
      >
        <SidebarContent
          items={items}
          pathname={pathname}
          collapsed={collapsed}
          onNavigate={() => undefined}
          user={user}
          onLogout={onLogout}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          onCloseMobile={() => undefined}
          isMobile={false}
        />
      </aside>
    </>
  );
}

function SidebarContent({
  items,
  pathname,
  collapsed,
  onNavigate,
  user,
  onLogout,
  onToggleCollapse,
  onCloseMobile,
  isMobile,
}: {
  items: NavItem[];
  pathname: string;
  collapsed: boolean;
  onNavigate: () => void;
  user: { name: string; role: 'owner' | 'reception' } | null;
  onLogout: () => void;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  isMobile: boolean;
}) {
  return (
    <div className="flex h-full flex-col pt-4">
      <div className={cn('flex items-center justify-between pl-4 pr-2 pb-6', collapsed && !isMobile ? 'flex-col gap-3' : '')}>
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={cn('flex items-center gap-2.5', collapsed && !isMobile && 'justify-center')}
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-teal-500 text-white shadow-glow">
            <Hotel className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900" />
          </span>
          {(!collapsed || isMobile) && (
            <div className="leading-tight">
              <p className="font-display text-lg font-extrabold tracking-tight">Al Noor Palace</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Reservation Suite</p>
            </div>
          )}
        </Link>
        {isMobile ? (
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                active
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white',
                collapsed && !isMobile && 'justify-center px-2',
              )}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-brand-500 to-teal-500"
                />
              )}
              <Icon
                className={cn(
                  'h-[18px] w-[18px] transition',
                  active ? 'text-brand-600 dark:text-brand-300' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200',
                )}
              />
              {(!collapsed || isMobile) && <span>{item.label}</span>}
              {(!collapsed || isMobile) && item.badge && (
                <span className="ml-auto chip bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-2">
        {(!collapsed || isMobile) && (
          <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-brand-50 via-white to-teal-50 p-4 dark:border-slate-800 dark:from-brand-950/40 dark:via-slate-900 dark:to-teal-950/30">
            <p className="text-xs font-semibold text-brand-700 dark:text-brand-300">Need a hand?</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Check the docs in the help center for tips on managing your property.
            </p>
          </div>
        )}

        <div
          className={cn(
            'flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-3 dark:border-slate-800 dark:bg-slate-900',
            collapsed && !isMobile && 'justify-center',
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-sm font-bold text-white">
            {user ? initialsOf(user.name) : '?'}
          </div>
          {(!collapsed || isMobile) && user && (
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {user.role === 'owner' ? 'Owner' : 'Reception'}
              </p>
            </div>
          )}
          {(!collapsed || isMobile) && (
            <button
              onClick={onLogout}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>

        {(!collapsed || isMobile) && (
          <div className="flex items-center justify-between rounded-xl px-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">Theme</span>
            <ThemeToggle />
          </div>
        )}
      </div>
    </div>
  );
}
