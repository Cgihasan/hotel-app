'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Users, Calendar, Check, X as XIcon, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

import { AppShell } from '@/components/layout/AppShell';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { DateRangeField } from '@/components/ui/DateRangeField';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ReservationForm } from '@/components/forms/ReservationForm';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { isRoomAvailable } from '@/lib/availability';
import { formatCurrency, formatDate, fromISODate, nightsBetween, toISODate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Room } from '@/types';

export default function AvailabilityPage() {
  return (
    <RoleGuard allow={['owner', 'reception']}>
      <AvailabilityContent />
    </RoleGuard>
  );
}

function AvailabilityContent() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const { rooms, reservations } = useData();
  const [start, setStart] = useState<Date | null>(new Date());
  const [end, setEnd] = useState<Date | null>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'all' | 'family' | 'duplex'>('all');
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);

  const checkIn = start ? toISODate(start) : '';
  const checkOut = end ? toISODate(end) : '';
  const nights = start && end ? Math.max(0, nightsBetween(checkIn, checkOut)) : 0;

  const results = useMemo(() => {
    return rooms
      .filter((r) => r.isActive)
      .filter((r) => (type === 'all' ? true : r.type === type))
      .filter((r) =>
        search.trim()
          ? `${r.number} ${r.type} ${r.amenities.join(' ')}`.toLowerCase().includes(search.toLowerCase())
          : true,
      )
      .map((r) => ({
        room: r,
        available: isRoomAvailable(r.id, { checkIn, checkOut }, reservations),
      }));
  }, [rooms, reservations, checkIn, checkOut, type, search]);

  const summary = useMemo(() => {
    const total = results.length;
    const available = results.filter((r) => r.available).length;
    return { total, available, booked: total - available };
  }, [results]);

  const invalidRange = nights <= 0;

  const onBook = (room: Room) => {
    if (invalidRange) {
      toast.error('Please pick a valid date range first.');
      return;
    }
    if (!isOwner) {
      toast.error('Only owners can create new reservations.');
      return;
    }
    setBookingRoom(room);
  };

  return (
    <AppShell
      title="Availability check"
      subtitle="Find open rooms for any date range. Owners can book directly from here."
    >
      {/* Search panel */}
      <div className="card-elevated mb-6 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="label">Stay dates</label>
            <DateRangeField
              startDate={start}
              endDate={end}
              onChange={([s, e]) => {
                setStart(s);
                setEnd(e);
              }}
              minDate={new Date()}
            />
            {invalidRange && (
              <p className="mt-1 text-xs text-rose-500">Check-out must be after check-in.</p>
            )}
            {!invalidRange && (
              <p className="mt-1 text-xs text-slate-500">
                {nights} night{nights > 1 ? 's' : ''} · {formatDate(checkIn)} → {formatDate(checkOut)}
              </p>
            )}
          </div>

          <div className="flex-1">
            <label className="label">Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-10"
                placeholder="Search by room, type, or amenity…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="label">Type</label>
            <div className="flex w-full items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/50 p-1 dark:border-slate-800 dark:bg-slate-900/40">
              {(['all', 'family', 'duplex'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    'flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold capitalize transition',
                    type === t
                      ? 'bg-white text-brand-700 shadow-soft dark:bg-slate-800 dark:text-brand-200'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary chips */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="chip bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
            <Check className="h-3.5 w-3.5" /> {summary.available} available
          </span>
          <span className="chip bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
            <XIcon className="h-3.5 w-3.5" /> {summary.booked} booked
          </span>
          <span className="chip bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Calendar className="h-3.5 w-3.5" /> {nights} night(s) searched
          </span>
        </div>
      </div>

      {/* Results grid */}
      {results.length === 0 ? (
        <div className="card-elevated flex flex-col items-center justify-center p-12 text-center">
          <Search className="h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm font-semibold">No rooms match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {results.map(({ room, available }, idx) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.04, 0.3) }}
              whileHover={{ y: -3 }}
              className={cn(
                'card-elevated relative overflow-hidden p-5',
                !available && 'opacity-90',
              )}
            >
              <div
                className={cn(
                  'absolute inset-x-0 top-0 h-1.5',
                  available
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                    : 'bg-gradient-to-r from-rose-400 to-rose-600',
                )}
              />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Room
                  </p>
                  <p className="font-display text-3xl font-extrabold tracking-tight">
                    {room.number}
                  </p>
                  <p className="mt-0.5 text-sm capitalize text-slate-500">{room.type}</p>
                </div>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                    available
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900/50'
                      : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900/50',
                  )}
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      available ? 'bg-emerald-500' : 'bg-rose-500',
                    )}
                  />
                  {available ? 'Available' : 'Booked'}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-slate-400" /> Up to {room.capacity}
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-slate-400" /> {room.amenities.length} amenities
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {room.amenities.slice(0, 5).map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {a}
                  </span>
                ))}
                {room.amenities.length > 5 && (
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-200">
                    +{room.amenities.length - 5}
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <div>
                  <p className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(room.pricePerNight)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {nights > 0 ? `${formatCurrency(room.pricePerNight * nights)} total` : 'per night'}
                  </p>
                </div>
                {available ? (
                  isOwner ? (
                    <Button
                      size="sm"
                      leftIcon={<BookOpen className="h-3.5 w-3.5" />}
                      onClick={() => onBook(room)}
                      disabled={invalidRange}
                    >
                      Book now
                    </Button>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">Read-only</span>
                  )
                ) : (
                  <span className="text-xs font-semibold text-rose-500">Unavailable</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={!!bookingRoom}
        onClose={() => setBookingRoom(null)}
        title={`Book Room ${bookingRoom?.number ?? ''}`}
        description={
          bookingRoom
            ? `${bookingRoom.type} · ${formatCurrency(bookingRoom.pricePerNight)} / night`
            : ''
        }
        size="lg"
      >
        {bookingRoom && (
          <ReservationForm
            defaultRoomId={bookingRoom.id}
            defaultDates={{ checkIn, checkOut }}
            onClose={() => setBookingRoom(null)}
          />
        )}
      </Modal>
    </AppShell>
  );
}
