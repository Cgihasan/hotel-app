'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Camera, FileText } from 'lucide-react';
import { useData, type CreateReservationInput } from '@/context/DataContext';
import type { Reservation, ArrivalMode, MealPlan, PaymentMethod } from '@/types';
import { Button } from '@/components/ui/Button';
import { DateRangeField } from '@/components/ui/DateRangeField';
import { fromISODate, nightsBetween, toISODate } from '@/lib/utils';
import { isRoomAvailable } from '@/lib/availability';
import { formatCurrency } from '@/lib/utils';

interface ReservationFormProps {
  initial?: Reservation;
  defaultRoomId?: string;
  defaultDates?: { checkIn?: string; checkOut?: string };
  onClose: () => void;
  onSaved?: (reservation: Reservation) => void;
}

interface FormState {
  roomId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCity: string;
  checkIn: string;
  checkOut: string;
  arrivalDate: string;
  arrivalTime: string;
  arrivalMode: ArrivalMode;
  isForeignGuest: boolean;
  paymentMethod: PaymentMethod;
  mealPlan: MealPlan;
  noOfRooms: number;
  paxAdults: number;
  paxChildren: number;
  paxExtra: number;
  photoUrl: string;
  documentUrl: string;
  notes: string;
}

const empty = (roomId = ''): FormState => ({
  roomId,
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  guestCity: '',
  checkIn: '',
  checkOut: '',
  arrivalDate: '',
  arrivalTime: '',
  arrivalMode: 'walkin',
  isForeignGuest: false,
  paymentMethod: 'cash',
  mealPlan: 'CP',
  noOfRooms: 1,
  paxAdults: 2,
  paxChildren: 0,
  paxExtra: 0,
  photoUrl: '',
  documentUrl: '',
  notes: '',
});

const ARRIVAL_MODES: { value: ArrivalMode; label: string }[] = [
  { value: 'walkin', label: 'Walk-in / Direct' },
  { value: 'travel-agent', label: 'Travel Agent' },
  { value: 'ota', label: 'OTA' },
  { value: 'company', label: 'Company' },
];

const MEAL_PLANS: { value: MealPlan; label: string; desc: string }[] = [
  { value: 'CP', label: 'CP', desc: 'Continental Plan' },
  { value: 'EP', label: 'EP', desc: 'European Plan' },
  { value: 'AP', label: 'AP', desc: 'American Plan' },
  { value: 'MAP', label: 'MAP', desc: 'Modified American Plan' },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'gpay', label: 'GPay' },
];

export function ReservationForm({
  initial,
  defaultRoomId,
  defaultDates,
  onClose,
  onSaved,
}: ReservationFormProps) {
  const { rooms, reservations, addReservation, updateReservation } = useData();
  const [form, setForm] = useState<FormState>(() =>
    empty(initial?.roomId ?? defaultRoomId ?? rooms[0]?.id ?? ''),
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        roomId: initial.roomId,
        guestName: initial.guestName,
        guestEmail: initial.guestEmail,
        guestPhone: initial.guestPhone,
        guestCity: initial.guestCity ?? '',
        checkIn: initial.checkIn,
        checkOut: initial.checkOut,
        arrivalDate: initial.arrivalDate ?? initial.checkIn ?? '',
        arrivalTime: initial.arrivalTime ?? '',
        arrivalMode: initial.arrivalMode ?? 'walkin',
        isForeignGuest: initial.isForeignGuest ?? false,
        paymentMethod: initial.paymentMethod ?? 'cash',
        mealPlan: initial.mealPlan ?? 'CP',
        noOfRooms: initial.noOfRooms ?? 1,
        paxAdults: initial.paxAdults ?? 2,
        paxChildren: initial.paxChildren ?? 0,
        paxExtra: initial.paxExtra ?? 0,
        photoUrl: initial.photoUrl ?? '',
        documentUrl: initial.documentUrl ?? '',
        notes: initial.notes ?? '',
      });
    } else {
      setForm((f) => ({
        ...f,
        roomId: f.roomId || defaultRoomId || rooms[0]?.id || '',
        checkIn: defaultDates?.checkIn ?? f.checkIn,
        checkOut: defaultDates?.checkOut ?? f.checkOut,
        arrivalDate: defaultDates?.checkIn ?? f.arrivalDate,
      }));
    }
  }, [initial?.id, defaultRoomId]);

  const room = useMemo(() => rooms.find((r) => r.id === form.roomId), [rooms, form.roomId]);
  const nights = form.checkIn && form.checkOut ? nightsBetween(form.checkIn, form.checkOut) : 0;
  const total = room ? room.pricePerNight * nights * form.noOfRooms : 0;

  const conflicting = useMemo(() => {
    if (!room || !form.checkIn || !form.checkOut) return null;
    if (!isRoomAvailable(room.id, { checkIn: form.checkIn, checkOut: form.checkOut }, reservations, initial?.id)) {
      return true;
    }
    return false;
  }, [room, form.checkIn, form.checkOut, reservations, initial?.id]);

  const valid =
    !!form.roomId &&
    !!form.guestName.trim() &&
    !!form.guestPhone.trim() &&
    !!form.checkIn &&
    !!form.checkOut &&
    !!form.arrivalDate &&
    nights > 0 &&
    form.paxAdults > 0 &&
    !conflicting;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo must be under 2MB');
      return;
    }
    const base64 = await toBase64(file);
    set('photoUrl', base64);
  };

  const handleDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Document must be under 5MB');
      return;
    }
    const base64 = await toBase64(file);
    set('documentUrl', base64);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    try {
      const payload: CreateReservationInput = {
        roomId: form.roomId,
        guestName: form.guestName.trim(),
        guestEmail: form.guestEmail.trim(),
        guestPhone: form.guestPhone.trim(),
        guestCity: form.guestCity.trim(),
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        arrivalDate: form.arrivalDate,
        arrivalTime: form.arrivalTime,
        arrivalMode: form.arrivalMode,
        isForeignGuest: form.isForeignGuest,
        paymentMethod: form.paymentMethod,
        mealPlan: form.mealPlan,
        noOfRooms: form.noOfRooms,
        paxAdults: form.paxAdults,
        paxChildren: form.paxChildren,
        paxExtra: form.paxExtra,
        photoUrl: form.photoUrl || undefined,
        documentUrl: form.documentUrl || undefined,
        notes: form.notes.trim() || undefined,
      };
      const result = initial
        ? updateReservation(initial.id, payload)
        : addReservation(payload);
      toast.success(initial ? 'Reservation updated' : 'Reservation created');
      onSaved?.(result);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save reservation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-h-[75vh] space-y-6 overflow-y-auto pr-1">
      {/* Guest Info */}
      <Section title="Guest Information">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Full name *</label>
            <input
              className="input"
              value={form.guestName}
              onChange={(e) => set('guestName', e.target.value)}
              placeholder="e.g. Eleanor Pena"
              required
            />
          </div>
          <div>
            <label className="label">Phone *</label>
            <input
              className="input"
              value={form.guestPhone}
              onChange={(e) => set('guestPhone', e.target.value)}
              placeholder="+91 98765 43210"
              required
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={form.guestEmail}
              onChange={(e) => set('guestEmail', e.target.value)}
              placeholder="guest@example.com"
            />
          </div>
          <div>
            <label className="label">City</label>
            <input
              className="input"
              value={form.guestCity}
              onChange={(e) => set('guestCity', e.target.value)}
              placeholder="e.g. Mumbai"
            />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <label className="relative inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={form.isForeignGuest}
                onChange={(e) => set('isForeignGuest', e.target.checked)}
              />
              <div className="h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-brand-500 peer-checked:after:translate-x-full dark:bg-slate-700" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Foreign guest</span>
            </label>
          </div>
        </div>
        <div className="mt-4">
          <label className="label">Photo</label>
          <div className="flex items-center gap-3">
            {form.photoUrl ? (
              <img src={form.photoUrl} alt="Guest" className="h-16 w-16 rounded-xl object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <Camera className="h-6 w-6 text-slate-400" />
              </div>
            )}
            <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-soft transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Camera className="mr-1 inline h-3.5 w-3.5" />
              {form.photoUrl ? 'Change photo' : 'Take photo'}
              <input type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhoto} />
            </label>
            {form.photoUrl && (
              <button type="button" className="text-xs text-rose-500 hover:underline" onClick={() => set('photoUrl', '')}>
                Remove
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* Arrival Details */}
      <Section title="Arrival Details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Arrival date *</label>
            <input
              className="input"
              type="date"
              value={form.arrivalDate}
              onChange={(e) => set('arrivalDate', e.target.value)}
              min={form.checkIn || undefined}
              required
            />
          </div>
          <div>
            <label className="label">Arrival time</label>
            <input
              className="input"
              type="time"
              value={form.arrivalTime}
              onChange={(e) => set('arrivalTime', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Arrival mode</label>
            <select
              className="input"
              value={form.arrivalMode}
              onChange={(e) => set('arrivalMode', e.target.value as ArrivalMode)}
            >
              {ARRIVAL_MODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Scan document</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-soft transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <FileText className="h-3.5 w-3.5" />
              {form.documentUrl ? 'Document attached ✓' : 'Upload ID / passport'}
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleDocument} />
            </label>
            {form.documentUrl && (
              <button type="button" className="mt-1 text-xs text-rose-500 hover:underline" onClick={() => set('documentUrl', '')}>
                Remove document
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* Room & Stay */}
      <Section title="Room & Stay">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Select room *</label>
            <select
              className="input"
              value={form.roomId}
              onChange={(e) => set('roomId', e.target.value)}
              required
            >
              {rooms.filter((r) => r.isActive).map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.number} · {r.type} · {r.capacity} pax · {formatCurrency(r.pricePerNight)} / night
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Stay dates *</label>
            <DateRangeField
              startDate={form.checkIn ? fromISODate(form.checkIn) : null}
              endDate={form.checkOut ? fromISODate(form.checkOut) : null}
              onChange={([s, e]) => {
                set('checkIn', s ? toISODate(s) : '');
                set('checkOut', e ? toISODate(e) : '');
              }}
              minDate={new Date()}
            />
            {conflicting && (
              <p className="mt-2 text-xs font-medium text-rose-600">
                ⚠ This room is already booked for the selected dates.
              </p>
            )}
            {nights > 0 && !conflicting && (
              <p className="mt-2 text-xs text-slate-500">
                {nights} night{nights > 1 ? 's' : ''} · {form.noOfRooms} room{form.noOfRooms > 1 ? 's' : ''} · total{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {formatCurrency(total)}
                </span>
              </p>
            )}
          </div>
          <div>
            <label className="label">Meal plan</label>
            <select
              className="input"
              value={form.mealPlan}
              onChange={(e) => set('mealPlan', e.target.value as MealPlan)}
            >
              {MEAL_PLANS.map((mp) => (
                <option key={mp.value} value={mp.value}>{mp.label} — {mp.desc}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">No. of rooms</label>
            <input
              className="input"
              type="number"
              min={1}
              max={10}
              value={form.noOfRooms}
              onChange={(e) => set('noOfRooms', Math.max(1, Number(e.target.value)))}
            />
          </div>
        </div>
      </Section>

      {/* Pax */}
      <Section title="Guests (Pax)">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Adults *</label>
            <input
              className="input"
              type="number"
              min={1}
              max={20}
              value={form.paxAdults}
              onChange={(e) => set('paxAdults', Math.max(1, Number(e.target.value)))}
              required
            />
          </div>
          <div>
            <label className="label">Children</label>
            <input
              className="input"
              type="number"
              min={0}
              max={20}
              value={form.paxChildren}
              onChange={(e) => set('paxChildren', Math.max(0, Number(e.target.value)))}
            />
          </div>
          <div>
            <label className="label">Extra</label>
            <input
              className="input"
              type="number"
              min={0}
              max={20}
              value={form.paxExtra}
              onChange={(e) => set('paxExtra', Math.max(0, Number(e.target.value)))}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Total pax: {form.paxAdults + form.paxChildren + form.paxExtra}
        </p>
      </Section>

      {/* Payment */}
      <Section title="Payment">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Payment by</label>
            <div className="flex gap-2">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.value}
                  type="button"
                  onClick={() => set('paymentMethod', pm.value)}
                  className={
                    'flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ' +
                    (form.paymentMethod === pm.value
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950/50 dark:text-brand-200'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300')
                  }
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Notes */}
      <div>
        <label className="label">Notes (optional)</label>
        <textarea
          className="input min-h-[80px] resize-y"
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Special requests, preferences…"
        />
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!valid} loading={submitting}>
          {initial ? 'Save changes' : 'Create reservation'}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h3>
      {children}
    </div>
  );
}
