'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, Plus, Search, Pencil, Trash2, LogIn, LogOut, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

import { AppShell } from '@/components/layout/AppShell';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ReservationForm } from '@/components/forms/ReservationForm';
import { RoomCalendarView } from '@/components/rooms/RoomCalendarView';
import { ViewToggle, type ViewType } from '@/components/ui/ViewToggle';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate, initialsOf, cn } from '@/lib/utils';
import type { Reservation, ReservationStatus } from '@/types';
import { DateRangeField } from '@/components/ui/DateRangeField';
import { fromISODate, toISODate } from '@/lib/utils';

const STATUS_OPTIONS: { value: 'all' | ReservationStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked-in', label: 'Checked-in' },
  { value: 'checked-out', label: 'Checked-out' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function ReservationsPage() {
  return (
    <RoleGuard allow={['owner', 'reception']}>
      <ReservationsContent />
    </RoleGuard>
  );
}

function ReservationsContent() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const { rooms, reservations, setStatus, deleteReservation, cancelReservation } = useData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReservationStatus>('all');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [view, setView] = useState<ViewType>('table');

  const [modalState, setModalState] = useState<
    | { kind: 'closed' }
    | { kind: 'create' }
    | { kind: 'edit'; reservation: Reservation }
    | { kind: 'view'; reservation: Reservation }
  >({ kind: 'closed' });

  const filtered = useMemo(() => {
    return reservations
      .filter((r) => {
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        if (
          search.trim() &&
          !`${r.guestName} ${r.guestEmail} ${r.guestPhone}`.toLowerCase().includes(search.toLowerCase())
        ) {
          return false;
        }
        if (dateRange[0]) {
          const start = fromISODate(dateRange[0].toISOString().slice(0, 10)).getTime();
          if (fromISODate(r.checkOut).getTime() < start) return false;
        }
        if (dateRange[1]) {
          const end = fromISODate(dateRange[1].toISOString().slice(0, 10)).getTime();
          if (fromISODate(r.checkIn).getTime() > end) return false;
        }
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [reservations, statusFilter, search, dateRange]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: reservations.length };
    for (const r of reservations) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [reservations]);

  const onCheckIn = (r: Reservation) => {
    setStatus(r.id, 'checked-in');
    toast.success(`${r.guestName} checked in`);
  };
  const onCheckOut = (r: Reservation) => {
    setStatus(r.id, 'checked-out');
    toast.success(`${r.guestName} checked out`);
  };
  const onCancel = (r: Reservation) => {
    if (!confirm(`Cancel reservation for ${r.guestName}?`)) return;
    cancelReservation(r.id);
    toast.success('Reservation cancelled');
  };
  const onDelete = (r: Reservation) => {
    if (!confirm(`Delete reservation for ${r.guestName}? This cannot be undone.`)) return;
    deleteReservation(r.id);
    toast.success('Reservation deleted');
  };

  return (
    <AppShell
      title="Reservations"
      subtitle={
        isOwner
          ? 'Create, edit, and manage every booking across your property.'
          : 'View reservations and process check-ins and check-outs.'
      }
      rightSlot={
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onViewChange={setView} options={['table', 'calendar']} />
          {isOwner && (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalState({ kind: 'create' })}>
              New reservation
            </Button>
          )}
        </div>
      }
    >
      {/* Filters */}
      <div className={cn("card-elevated mb-6 p-4", view === 'calendar' && "hidden")}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Search guest, email, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
            <DateRangeField
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              onChange={setDateRange}
              placeholder="Filter by date"
            />
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 p-1 dark:border-slate-800 dark:bg-slate-900/40">
              <span className="hidden px-2 text-xs font-semibold text-slate-500 lg:inline">
                <Filter className="mr-1 inline h-3.5 w-3.5" />
                Status:
              </span>
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={
                    'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ' +
                    (statusFilter === opt.value
                      ? 'bg-white text-brand-700 shadow-soft dark:bg-slate-800 dark:text-brand-200'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200')
                  }
                >
                  {opt.label}
                  <span className="ml-1 text-[10px] text-slate-400">({counts[opt.value] ?? 0})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {view === 'calendar' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <RoomCalendarView />
        </motion.div>
      ) : (
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm dark:divide-slate-800">
            <thead className="bg-slate-50/60 dark:bg-slate-900/60">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Guest
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Room
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Stay
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <AnimatePresence initial={false}>
                {filtered.map((r, idx) => {
                  const room = rooms.find((rm) => rm.id === r.roomId);
                  return (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                      className="table-row"
                    >
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-xs font-bold text-white">
                            {initialsOf(r.guestName)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{r.guestName}</p>
                            <p className="text-xs text-slate-500">{r.guestEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <p className="font-semibold">Room {room?.number ?? '—'}</p>
                        <p className="text-xs capitalize text-slate-500">{room?.type ?? '—'}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <p className="text-sm text-slate-700 dark:text-slate-200">
                          {formatDate(r.checkIn)} → {formatDate(r.checkOut)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {Math.max(
                            1,
                            Math.round(
                              (fromISODate(r.checkOut).getTime() - fromISODate(r.checkIn).getTime()) /
                                86400000,
                            ),
                          )}{' '}
                          night(s)
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 font-semibold">
                        {formatCurrency(r.totalPrice)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<Eye className="h-3.5 w-3.5" />}
                            onClick={() => setModalState({ kind: 'view', reservation: r })}
                          >
                            View
                          </Button>

                          {r.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="primary"
                              leftIcon={<LogIn className="h-3.5 w-3.5" />}
                              onClick={() => onCheckIn(r)}
                            >
                              Check-in
                            </Button>
                          )}
                          {r.status === 'checked-in' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              leftIcon={<LogOut className="h-3.5 w-3.5" />}
                              onClick={() => onCheckOut(r)}
                            >
                              Check-out
                            </Button>
                          )}

                          {isOwner && r.status !== 'cancelled' && r.status !== 'checked-out' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              leftIcon={<Pencil className="h-3.5 w-3.5" />}
                              onClick={() => setModalState({ kind: 'edit', reservation: r })}
                            >
                              Edit
                            </Button>
                          )}
                          {isOwner && (
                            <>
                              {r.status !== 'cancelled' && r.status !== 'checked-out' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onCancel(r)}
                                  className="text-amber-600 hover:bg-amber-50"
                                >
                                  Cancel
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                                onClick={() => onDelete(r)}
                                className="text-rose-600 hover:bg-rose-50"
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10">
                    <EmptyState
                      icon={Search}
                      title="No reservations match your filters"
                      description="Try clearing the search or selecting a different status."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <Modal
        open={modalState.kind === 'create'}
        onClose={() => setModalState({ kind: 'closed' })}
        title="New reservation"
        description="Add a new booking for an upcoming guest."
        size="lg"
      >
        <ReservationForm onClose={() => setModalState({ kind: 'closed' })} />
      </Modal>

      <Modal
        open={modalState.kind === 'edit'}
        onClose={() => setModalState({ kind: 'closed' })}
        title="Edit reservation"
        description="Update guest details, dates, or status."
        size="lg"
      >
        {modalState.kind === 'edit' && (
          <ReservationForm
            initial={modalState.reservation}
            onClose={() => setModalState({ kind: 'closed' })}
          />
        )}
      </Modal>

      <Modal
        open={modalState.kind === 'view'}
        onClose={() => setModalState({ kind: 'closed' })}
        title="Reservation details"
        size="lg"
      >
        {modalState.kind === 'view' && <ReservationView reservation={modalState.reservation} />}
      </Modal>
    </AppShell>
  );
}

function ReservationView({ reservation: r }: { reservation: Reservation }) {
  const { rooms } = useData();
  const room = rooms.find((rm) => rm.id === r.roomId);
  const arrivalModeLabels: Record<string, string> = { walkin: 'Walk-in / Direct', 'travel-agent': 'Travel Agent', ota: 'OTA', company: 'Company' };
  const mealPlanLabels: Record<string, string> = { CP: 'Continental Plan', EP: 'European Plan', AP: 'American Plan', MAP: 'Modified American Plan' };
  const totalPax = r.paxAdults + r.paxChildren + r.paxExtra;

  return (
    <div className="max-h-[75vh] space-y-5 overflow-y-auto pr-1">
      <div className="flex items-center gap-4">
        {r.photoUrl ? (
          <img src={r.photoUrl} alt={r.guestName} className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-sm font-bold text-white">
            {initialsOf(r.guestName)}
          </div>
        )}
        <div>
          <p className="font-display text-lg font-bold">{r.guestName}</p>
          <p className="text-sm text-slate-500">
            {r.guestPhone || '—'} {r.guestEmail ? `· ${r.guestEmail}` : ''}
          </p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={r.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailItem label="Room" value={room ? `Room ${room.number} (${room.type})` : '—'} />
        <DetailItem label="Total price" value={formatCurrency(r.totalPrice)} />
        <DetailItem label="Check-in" value={formatDate(r.checkIn)} />
        <DetailItem label="Check-out" value={formatDate(r.checkOut)} />
        {r.arrivalDate && <DetailItem label="Arrival date" value={formatDate(r.arrivalDate)} />}
        {r.arrivalTime && <DetailItem label="Arrival time" value={r.arrivalTime} />}
        <DetailItem label="Arrival mode" value={arrivalModeLabels[r.arrivalMode] ?? r.arrivalMode} />
        <DetailItem label="City" value={r.guestCity || '—'} />
        <DetailItem label="Foreign guest" value={r.isForeignGuest ? 'Yes' : 'No'} />
        <DetailItem label="Meal plan" value={r.mealPlan ? `${r.mealPlan} — ${mealPlanLabels[r.mealPlan]}` : '—'} />
        <DetailItem label="Payment" value={r.paymentMethod === 'gpay' ? 'GPay' : 'Cash'} />
        <DetailItem label="No. of rooms" value={String(r.noOfRooms ?? 1)} />
        <DetailItem label="Pax" value={`${r.paxAdults ?? 0} adult(s), ${r.paxChildren ?? 0} child(ren), ${r.paxExtra ?? 0} extra`} />
        <DetailItem label="Total pax" value={String(totalPax)} />
        <DetailItem label="Created" value={formatDate(r.createdAt, true)} />
        <DetailItem label="Reservation ID" value={r.id} />
      </div>

      {r.documentUrl && (
        <div>
          <p className="label">Scanned document</p>
          <a href={r.documentUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand-600 hover:underline">
            View document ↗
          </a>
        </div>
      )}

      {r.notes && (
        <div>
          <p className="label">Notes</p>
          <p className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
            {r.notes}
          </p>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
}
