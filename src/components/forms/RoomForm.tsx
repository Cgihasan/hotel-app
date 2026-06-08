'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';
import { useData } from '@/context/DataContext';
import type { Room, RoomType } from '@/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface RoomFormProps {
  initial?: Room;
  onClose: () => void;
  onSaved?: (room: Room) => void;
}

const TYPES: RoomType[] = ['family', 'duplex'];
const AMENITY_SUGGESTIONS = [
  'Wi-Fi',
  'TV',
  'Air conditioning',
  'Mini bar',
  'Balcony',
  'Workspace',
  'Coffee maker',
  'Jacuzzi',
  'Living room',
  'Kitchen',
  'Smart TV',
];

const emptyRoom: Omit<Room, 'id'> = {
  number: '',
  type: 'family',
  capacity: 4,
  pricePerNight: 2500,
  amenities: ['Wi-Fi', 'TV', 'Air conditioning'],
  isActive: true,
};

export function RoomForm({ initial, onClose, onSaved }: RoomFormProps) {
  const { addRoom, updateRoom } = useData();
  const [form, setForm] = useState<Omit<Room, 'id'>>(initial ?? emptyRoom);
  const [amenityInput, setAmenityInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addAmenity = (a: string) => {
    const v = a.trim();
    if (!v) return;
    if (form.amenities.includes(v)) return;
    set('amenities', [...form.amenities, v]);
    setAmenityInput('');
  };

  const removeAmenity = (a: string) => {
    set('amenities', form.amenities.filter((x) => x !== a));
  };

  const valid = form.number.trim().length > 0 && form.pricePerNight > 0 && form.capacity > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    try {
      const result = initial ? updateRoom(initial.id, form) : addRoom(form);
      toast.success(initial ? 'Room updated' : 'Room added');
      if (result) onSaved?.(result);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save room');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Room number</label>
          <input
            className="input"
            value={form.number}
            onChange={(e) => set('number', e.target.value)}
            placeholder="e.g. 205"
            required
          />
        </div>
        <div>
          <label className="label">Type</label>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => set('type', t)}
                className={cn(
                  'rounded-xl border px-3 py-2.5 text-sm font-semibold capitalize transition',
                  form.type === t
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-950/40 dark:text-brand-200'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Capacity</label>
          <input
            className="input"
            type="number"
            min={1}
            max={10}
            value={form.capacity}
            onChange={(e) => set('capacity', Math.max(1, Number(e.target.value)))}
            required
          />
        </div>
        <div>
          <label className="label">Price per night (INR)</label>
          <input
            className="input"
            type="number"
            min={0}
            step={1}
            value={form.pricePerNight}
            onChange={(e) => set('pricePerNight', Math.max(0, Number(e.target.value)))}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label">Amenities</label>
          <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-2 dark:border-slate-800 dark:bg-slate-900/60">
            {form.amenities.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700"
              >
                {a}
                <button
                  type="button"
                  onClick={() => removeAmenity(a)}
                  className="rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-700"
                  aria-label={`Remove ${a}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <div className="flex flex-1 items-center gap-1.5">
              <input
                className="min-w-[120px] flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm focus:border-brand-500 focus:outline-none"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAmenity(amenityInput);
                  }
                }}
                placeholder="Add amenity…"
              />
              <Button type="button" size="sm" variant="secondary" onClick={() => addAmenity(amenityInput)}>
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {AMENITY_SUGGESTIONS.filter((s) => !form.amenities.includes(s)).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addAmenity(s)}
                className="rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-500 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-brand-500 dark:hover:bg-brand-950/40"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={() => set('isActive', !form.isActive)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition',
              form.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700',
            )}
            aria-pressed={form.isActive}
            aria-label="Active toggle"
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white shadow transition',
                form.isActive ? 'translate-x-6' : 'translate-x-1',
              )}
            />
          </button>
          <div>
            <p className="text-sm font-semibold">Room is active</p>
            <p className="text-xs text-slate-500">Inactive rooms won&apos;t appear in availability searches.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!valid} loading={submitting}>
          {initial ? 'Save changes' : 'Add room'}
        </Button>
      </div>
    </form>
  );
}
