import type { AppData, Room, Reservation, User } from '@/types';
import { seedRooms, seedReservations } from '@/utils/seedData';

const ROOMS_KEY = 'hr.rooms';
const RESERVATIONS_KEY = 'hr.reservations';
const AUTH_KEY = 'hr.auth';

const isBrowser = typeof window !== 'undefined';

export function loadRooms(): Room[] {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(ROOMS_KEY);
    if (!raw) {
      const seeded = seedRooms();
      window.localStorage.setItem(ROOMS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as Room[];
  } catch {
    return seedRooms();
  }
}

export function saveRooms(rooms: Room[]): void {
  if (!isBrowser) return;
  window.localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
}

export function loadReservations(): Reservation[] {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(RESERVATIONS_KEY);
    if (!raw) {
      const seeded = seedReservations();
      window.localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as Reservation[];
  } catch {
    return seedReservations();
  }
}

export function saveReservations(items: Reservation[]): void {
  if (!isBrowser) return;
  window.localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(items));
}

export function loadAuth(): User | null {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function saveAuth(user: User | null): void {
  if (!isBrowser) return;
  if (user) {
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(AUTH_KEY);
  }
}

export function resetData(): void {
  if (!isBrowser) return;
  window.localStorage.removeItem(ROOMS_KEY);
  window.localStorage.removeItem(RESERVATIONS_KEY);
}

export function exportData(): AppData {
  return {
    rooms: loadRooms(),
    reservations: loadReservations(),
  };
}
