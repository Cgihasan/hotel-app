'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BedDouble,
  CalendarCheck2,
  CircleDollarSign,
  Percent,
  ArrowUpRight,
  Clock,
  Users,
  CheckCircle2,
  Hotel as HotelIcon,
} from 'lucide-react';
import Link from 'next/link';

import { AppShell } from '@/components/layout/AppShell';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate, fromISODate, initialsOf, toISODate } from '@/lib/utils';
import { isCurrentlyOccupied, reservationCoversDate } from '@/lib/availability';

export default function DashboardPage() {
  return (
    <RoleGuard allow={['owner', 'reception']}>
      <DashboardContent />
    </RoleGuard>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const { rooms, reservations } = useData();

  const isOwner = user?.role === 'owner';

  const stats = useMemo(() => {
    const totalRooms = rooms.length;
    const activeRooms = rooms.filter((r) => r.isActive).length;
    const today = toISODate(new Date());
    const occupiedNow = reservations.filter(
      (r) => r.status === 'checked-in' || (r.status === 'confirmed' && reservationCoversDate(r, today)),
    ).length;
    const occupancy = activeRooms > 0 ? Math.round((occupiedNow / activeRooms) * 100) : 0;
    const checkInsToday = reservations.filter(
      (r) => r.checkIn === today && r.status !== 'cancelled' && r.status !== 'checked-out',
    ).length;
    const monthlyRevenue = reservations
      .filter((r) => r.status === 'checked-out' || r.status === 'checked-in')
      .reduce((sum, r) => sum + r.totalPrice, 0);
    return { totalRooms, activeRooms, occupiedNow, occupancy, checkInsToday, monthlyRevenue };
  }, [rooms, reservations]);

  const chartData = useMemo(() => {
    const days: { date: string; label: string; occupancy: number; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = toISODate(d);
      const occupancy =
        stats.activeRooms > 0
          ? Math.round(
              (reservations.filter((r) => reservationCoversDate(r, iso)).length / stats.activeRooms) * 100,
            )
          : 0;
      const revenue = reservations
        .filter((r) => r.status === 'checked-out' && r.checkOut === iso)
        .reduce((sum, r) => sum + r.totalPrice, 0);
      days.push({
        date: iso,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        occupancy,
        revenue,
      });
    }
    return days;
  }, [reservations, stats.activeRooms]);

  const upcoming = useMemo(() => {
    const today = toISODate(new Date());
    const inThree = new Date();
    inThree.setDate(inThree.getDate() + 3);
    const threeIso = toISODate(inThree);
    return reservations
      .filter(
        (r) =>
          r.status !== 'cancelled' &&
          r.status !== 'checked-out' &&
          r.checkIn >= today &&
          r.checkIn <= threeIso,
      )
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
      .slice(0, 5);
  }, [reservations]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <AppShell
      title={`${greeting}, ${user?.name?.split(' ')[0] ?? 'there'} 👋`}
      subtitle={
        isOwner
          ? "Here's how your property is performing today."
          : "Here's everything happening at the front desk today."
      }
    >
      {/* Stat grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isOwner ? (
          <>
            <StatCard
              label="Total rooms"
              value={String(stats.totalRooms)}
              icon={BedDouble}
              accent="brand"
              delay={0.02}
            />
            <StatCard
              label="Occupancy"
              value={`${stats.occupancy}%`}
              icon={Percent}
              trend={4}
              accent="teal"
              delay={0.06}
            />
            <StatCard
              label="Check-ins today"
              value={String(stats.checkInsToday)}
              icon={CalendarCheck2}
              accent="amber"
              delay={0.1}
            />
            <StatCard
              label="Monthly revenue"
              value={formatCurrency(stats.monthlyRevenue)}
              icon={CircleDollarSign}
              trend={8}
              accent="emerald"
              delay={0.14}
            />
          </>
        ) : (
          <>
            <StatCard
              label="Active reservations"
              value={String(
                reservations.filter((r) => r.status === 'confirmed' || r.status === 'checked-in').length,
              )}
              icon={CalendarCheck2}
              accent="brand"
              delay={0.02}
            />
            <StatCard
              label="Currently occupied"
              value={String(reservations.filter((r) => isCurrentlyOccupied(r)).length)}
              icon={HotelIcon}
              accent="teal"
              delay={0.06}
            />
            <StatCard
              label="Check-ins today"
              value={String(stats.checkInsToday)}
              icon={Clock}
              accent="amber"
              delay={0.1}
            />
            <StatCard
              label="Guests in-house"
              value={String(
                new Set(
                  reservations
                    .filter((r) => r.status === 'checked-in' || reservationCoversDate(r, toISODate(new Date())))
                    .map((r) => r.guestEmail),
                ).size,
              )}
              icon={Users}
              accent="emerald"
              delay={0.14}
            />
          </>
        )}
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">Occupancy this week</h3>
              <p className="text-xs text-slate-500">Last 7 days · % of active rooms occupied</p>
            </div>
            {isOwner && (
              <Link href="/availability" className="text-xs font-semibold text-brand-600 hover:underline">
                View availability →
              </Link>
            )}
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="occ" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2474e8" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#2474e8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v}%`, 'Occupancy']}
                />
                <Area
                  type="monotone"
                  dataKey="occupancy"
                  stroke="#2474e8"
                  strokeWidth={2.5}
                  fill="url(#occ)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">Quick actions</h3>
              <p className="text-xs text-slate-500">Shortcuts for your day</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {isOwner ? (
              <>
                <QuickAction
                  href="/reservations"
                  title="Create reservation"
                  subtitle="Add a new guest booking"
                  icon={CalendarCheck2}
                />
                <QuickAction
                  href="/availability"
                  title="Check availability"
                  subtitle="See open rooms for any date range"
                  icon={BedDouble}
                />
                <QuickAction
                  href="/rooms"
                  title="Manage rooms"
                  subtitle="Add, edit, or update rooms"
                  icon={HotelIcon}
                />
              </>
            ) : (
              <>
                <QuickAction
                  href="/reservations"
                  title="Today's check-ins"
                  subtitle="Process arriving guests"
                  icon={CalendarCheck2}
                />
                <QuickAction
                  href="/availability"
                  title="Check availability"
                  subtitle="See open rooms for any date range"
                  icon={BedDouble}
                />
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Upcoming reservations */}
      <Card className="mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold">Upcoming arrivals</h3>
            <p className="text-xs text-slate-500">Next 3 days</p>
          </div>
          <Link href="/reservations" className="text-xs font-semibold text-brand-600 hover:underline">
            See all reservations →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-6 py-10 text-center dark:border-slate-800">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p className="mt-2 text-sm font-semibold">No upcoming arrivals in the next 3 days.</p>
            <p className="text-xs text-slate-500">Enjoy the calm before the next wave of guests.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {upcoming.map((r, idx) => {
              const room = rooms.find((rm) => rm.id === r.roomId);
              const daysUntil = Math.max(
                0,
                Math.round(
                  (fromISODate(r.checkIn).getTime() - fromISODate(toISODate(new Date())).getTime()) /
                    86400000,
                ),
              );
              return (
                <motion.li
                  key={r.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-center gap-4 py-3.5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-sm font-bold text-white">
                    {initialsOf(r.guestName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {r.guestName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      Room {room?.number ?? '—'} · {formatDate(r.checkIn)} → {formatDate(r.checkOut)}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                  <span className="hidden text-xs font-semibold text-slate-500 sm:inline">
                    {daysUntil === 0 ? 'Today' : `In ${daysUntil}d`}
                  </span>
                </motion.li>
              );
            })}
          </ul>
        )}
      </Card>

      {!isOwner && (
        <Card className="mt-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">Need to update something?</h3>
              <p className="text-sm text-slate-500">
                Reception can check availability, run check-ins, and process check-outs. Contact the
                owner for room or reservation changes.
              </p>
            </div>
            <Link
              href="/availability"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              Check availability <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>
      )}
    </AppShell>
  );
}

function QuickAction({
  href,
  title,
  subtitle,
  icon: Icon,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-3.5 transition hover:border-brand-500 hover:bg-brand-50/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500 dark:hover:bg-brand-950/30"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/15 to-teal-500/15 text-brand-600 dark:text-brand-300">
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </span>
      <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
    </Link>
  );
}
