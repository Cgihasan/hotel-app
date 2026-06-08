import type { Reservation } from '@/types';
import { fromISODate, nightsBetween } from './utils';

export interface AvailabilityRange {
  checkIn: string;
  checkOut: string;
}

/**
 * Returns true if a room is available for the given [checkIn, checkOut) range.
 * A reservation blocks availability from checkIn (inclusive) to checkOut (exclusive).
 */
export function isRoomAvailable(
  roomId: string,
  range: AvailabilityRange,
  reservations: Reservation[],
  ignoreReservationId?: string,
): boolean {
  if (!range.checkIn || !range.checkOut) return true;
  const start = fromISODate(range.checkIn).getTime();
  const end = fromISODate(range.checkOut).getTime();
  if (end <= start) return false;

  for (const r of reservations) {
    if (ignoreReservationId && r.id === ignoreReservationId) continue;
    if (r.roomId !== roomId) continue;
    if (r.status === 'cancelled' || r.status === 'checked-out') continue;
    const rStart = fromISODate(r.checkIn).getTime();
    const rEnd = fromISODate(r.checkOut).getTime();
    // Overlap if rStart < end && start < rEnd
    if (rStart < end && start < rEnd) return false;
  }
  return true;
}

export function isCurrentlyOccupied(reservation: Reservation, today = new Date()): boolean {
  if (reservation.status === 'cancelled' || reservation.status === 'checked-out') return false;
  const start = fromISODate(reservation.checkIn).getTime();
  const end = fromISODate(reservation.checkOut).getTime();
  const t = today.setHours(0, 0, 0, 0);
  return start <= t && t < end;
}

export function computeTotalPrice(pricePerNight: number, checkIn: string, checkOut: string): number {
  const nights = nightsBetween(checkIn, checkOut);
  return nights * pricePerNight;
}

export function reservationCoversDate(r: Reservation, isoDate: string): boolean {
  if (r.status === 'cancelled' || r.status === 'checked-out') return false;
  const t = fromISODate(isoDate).getTime();
  const s = fromISODate(r.checkIn).getTime();
  const e = fromISODate(r.checkOut).getTime();
  return s <= t && t < e;
}
