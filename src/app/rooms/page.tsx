'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BedDouble, Plus, Search, Pencil, Trash2, Users, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

import { AppShell } from '@/components/layout/AppShell';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { RoomForm } from '@/components/forms/RoomForm';
import { RoomCalendarView } from '@/components/rooms/RoomCalendarView';
import { ViewToggle, type ViewType } from '@/components/ui/ViewToggle';
import { EmptyState } from '@/components/ui/EmptyState';
import { useData } from '@/context/DataContext';
import { formatCurrency, cn } from '@/lib/utils';
import type { Room, RoomType } from '@/types';

const TYPE_FILTERS: { value: 'all' | RoomType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'family', label: 'Family' },
  { value: 'duplex', label: 'Duplex' },
];

export default function RoomsPage() {
  return (
    <RoleGuard allow={['owner']}>
      <RoomsContent />
    </RoleGuard>
  );
}

function RoomsContent() {
  const { rooms, reservations, toggleRoomActive, deleteRoom } = useData();
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'all' | RoomType>('all');
  const [view, setView] = useState<ViewType>('grid');
  const [modalState, setModalState] = useState<
    | { kind: 'closed' }
    | { kind: 'create' }
    | { kind: 'edit'; room: Room }
  >({ kind: 'closed' });

  const filtered = useMemo(() => {
    return rooms.filter((r) => {
      if (type !== 'all' && r.type !== type) return false;
      if (search.trim() && !`${r.number} ${r.type} ${r.amenities.join(' ')}`.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [rooms, type, search]);

  const roomsByFloor = useMemo(() => {
    const grouped: Record<string, Room[]> = {};
    filtered.forEach((r) => {
      const floor = r.floor || 'Other';
      if (!grouped[floor]) grouped[floor] = [];
      grouped[floor].push(r);
    });

    const floorOrder = (a: string, b: string) => {
      const getRank = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('ground')) return 0;
        const match = lower.match(/\d+/);
        return match ? parseInt(match[0], 10) : 999;
      };
      return getRank(a) - getRank(b);
    };

    return Object.keys(grouped)
      .sort(floorOrder)
      .reduce((acc, floor) => {
        acc[floor] = grouped[floor];
        return acc;
      }, {} as Record<string, Room[]>);
  }, [filtered]);

  const onDelete = (r: Room) => {
    const hasReservations = reservations.some(
      (res) => res.roomId === r.id && (res.status === 'confirmed' || res.status === 'checked-in'),
    );
    if (hasReservations) {
      toast.error('Cannot delete a room with active reservations. Cancel those first.');
      return;
    }
    if (!confirm(`Delete Room ${r.number}?`)) return;
    deleteRoom(r.id);
    toast.success('Room deleted');
  };

  return (
    <AppShell
      title="Rooms"
      subtitle="Curate the rooms available across your property."
      rightSlot={
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onViewChange={setView} />
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalState({ kind: 'create' })}>
            Add room
          </Button>
        </div>
      }
    >
      <div className={cn("card-elevated mb-6 p-4", view === 'calendar' && "hidden")}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Search by number, type, amenity…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 p-1 dark:border-slate-800 dark:bg-slate-900/40">
            {TYPE_FILTERS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition',
                  type === opt.value
                    ? 'bg-white text-brand-700 shadow-soft dark:bg-slate-800 dark:text-brand-200'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200',
                )}
              >
                {opt.label}
                <span className="ml-1 text-[10px] text-slate-400">
                  ({opt.value === 'all' ? rooms.length : rooms.filter((r) => r.type === opt.value).length})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === 'calendar' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <RoomCalendarView />
        </motion.div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title="No rooms yet"
          description="Get started by adding your first room to the property."
          action={
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalState({ kind: 'create' })}>
              Add room
            </Button>
          }
        />
      ) : (
        <div className="space-y-10">
          {Object.entries(roomsByFloor).map(([floor, floorRooms]) => (
            <div key={floor}>
              <div className="mb-4 flex items-center gap-2">
                <div className="h-6 w-1 rounded-full bg-brand-500" />
                <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">{floor}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {floorRooms.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {floorRooms.map((r, idx) => {
                  const activeReservations = reservations.filter(
                    (res) => res.roomId === r.id && (res.status === 'confirmed' || res.status === 'checked-in'),
                  ).length;
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.04, 0.3) }}
                      whileHover={{ y: -3 }}
                      className="card-elevated overflow-hidden p-5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Room
                          </p>
                          <p className="font-display text-3xl font-extrabold tracking-tight">
                            {r.number}
                          </p>
                          <p className="mt-0.5 text-sm capitalize text-slate-500">{r.type}</p>
                        </div>
                        <button
                          onClick={() => toggleRoomActive(r.id)}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition',
                            r.isActive
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900/50'
                              : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700',
                          )}
                          title="Toggle active"
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              r.isActive ? 'bg-emerald-500' : 'bg-slate-400',
                            )}
                          />
                          {r.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>

                      <div className="mt-4 flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-slate-400" /> {r.capacity} guests
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-slate-400" /> {r.amenities.length} amenities
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {r.amenities.slice(0, 4).map((a) => (
                          <span
                            key={a}
                            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {a}
                          </span>
                        ))}
                        {r.amenities.length > 4 && (
                          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-200">
                            +{r.amenities.length - 4}
                          </span>
                        )}
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                        <div>
                          <p className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
                            {formatCurrency(r.pricePerNight)}
                          </p>
                          <p className="text-[11px] text-slate-500">per night · {activeReservations} active booking(s)</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setModalState({ kind: 'edit', room: r })}
                            leftIcon={<Pencil className="h-3.5 w-3.5" />}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(r)}
                            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                            className="text-rose-600 hover:bg-rose-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalState.kind === 'create'}
        onClose={() => setModalState({ kind: 'closed' })}
        title="Add a new room"
        description="Define a new room with pricing, capacity, and amenities."
        size="lg"
      >
        <RoomForm onClose={() => setModalState({ kind: 'closed' })} />
      </Modal>

      <Modal
        open={modalState.kind === 'edit'}
        onClose={() => setModalState({ kind: 'closed' })}
        title={`Edit Room ${modalState.kind === 'edit' ? modalState.room.number : ''}`}
        size="lg"
      >
        {modalState.kind === 'edit' && (
          <RoomForm initial={modalState.room} onClose={() => setModalState({ kind: 'closed' })} />
        )}
      </Modal>
    </AppShell>
  );
}
