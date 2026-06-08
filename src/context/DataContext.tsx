'use client';

import { create } from 'zustand';
import type { Reservation, ReservationStatus, Room, ArrivalMode, MealPlan, PaymentMethod } from '@/types';
import {
  loadReservations,
  loadRooms,
  resetData,
  saveReservations,
  saveRooms,
} from '@/lib/storage';
import { computeTotalPrice, isRoomAvailable } from '@/lib/availability';
import { uid } from '@/lib/utils';

export interface CreateReservationInput {
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
  photoUrl?: string;
  documentUrl?: string;
  notes?: string;
}

export interface UpdateReservationInput extends CreateReservationInput {
  status?: ReservationStatus;
}

interface DataStore {
  rooms: Room[];
  reservations: Reservation[];
  isHydrated: boolean;
  hydrate: () => void;

  // Rooms
  addRoom: (input: Omit<Room, 'id'>) => Room;
  updateRoom: (id: string, input: Partial<Omit<Room, 'id'>>) => Room | undefined;
  deleteRoom: (id: string) => void;
  toggleRoomActive: (id: string) => void;

  // Reservations
  addReservation: (input: CreateReservationInput) => Reservation;
  updateReservation: (id: string, input: UpdateReservationInput) => Reservation;
  cancelReservation: (id: string) => void;
  deleteReservation: (id: string) => void;
  setStatus: (id: string, status: ReservationStatus) => void;

  resetAll: () => void;
}

function withTotal(room: Room, checkIn: string, checkOut: string): number {
  return computeTotalPrice(room.pricePerNight, checkIn, checkOut);
}

export const useData = create<DataStore>((set, get) => ({
  rooms: [],
  reservations: [],
  isHydrated: false,

  hydrate: () => {
    set({
      rooms: loadRooms(),
      reservations: loadReservations(),
      isHydrated: true,
    });
  },

  // ---------- Rooms ----------
  addRoom: (input) => {
    const room: Room = { ...input, id: 'room-' + uid() };
    const rooms = [...get().rooms, room];
    saveRooms(rooms);
    set({ rooms });
    return room;
  },
  updateRoom: (id, input) => {
    let updated: Room | undefined;
    const rooms = get().rooms.map((r) => {
      if (r.id === id) {
        updated = { ...r, ...input };
        return updated;
      }
      return r;
    });
    saveRooms(rooms);
    set({ rooms });
    return updated;
  },
  deleteRoom: (id) => {
    const rooms = get().rooms.filter((r) => r.id !== id);
    saveRooms(rooms);
    set({ rooms });
  },
  toggleRoomActive: (id) => {
    const rooms = get().rooms.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r));
    saveRooms(rooms);
    set({ rooms });
  },

  // ---------- Reservations ----------
  addReservation: (input) => {
    const room = get().rooms.find((r) => r.id === input.roomId);
    if (!room) throw new Error('Selected room not found.');
    if (!isRoomAvailable(room.id, input, get().reservations)) {
      throw new Error('Room is not available for the selected dates.');
    }
    const reservation: Reservation = {
      id: 'res-' + uid(),
      roomId: input.roomId,
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      guestPhone: input.guestPhone,
      guestCity: input.guestCity,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      arrivalDate: input.arrivalDate,
      arrivalTime: input.arrivalTime,
      arrivalMode: input.arrivalMode,
      isForeignGuest: input.isForeignGuest,
      paymentMethod: input.paymentMethod,
      mealPlan: input.mealPlan,
      noOfRooms: input.noOfRooms,
      paxAdults: input.paxAdults,
      paxChildren: input.paxChildren,
      paxExtra: input.paxExtra,
      photoUrl: input.photoUrl,
      documentUrl: input.documentUrl,
      status: 'confirmed',
      totalPrice: withTotal(room, input.checkIn, input.checkOut),
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };
    const reservations = [reservation, ...get().reservations];
    saveReservations(reservations);
    set({ reservations });
    return reservation;
  },

  updateReservation: (id, input) => {
    const existing = get().reservations.find((r) => r.id === id);
    if (!existing) throw new Error('Reservation not found.');
    const room = get().rooms.find((r) => r.id === input.roomId);
    if (!room) throw new Error('Selected room not found.');

    const datesOrRoomChanged =
      input.roomId !== existing.roomId ||
      input.checkIn !== existing.checkIn ||
      input.checkOut !== existing.checkOut;
    if (
      datesOrRoomChanged &&
      existing.status !== 'cancelled' &&
      existing.status !== 'checked-out' &&
      !isRoomAvailable(room.id, input, get().reservations, id)
    ) {
      throw new Error('Room is not available for the selected dates.');
    }

    const updated: Reservation = {
      ...existing,
      roomId: input.roomId,
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      guestPhone: input.guestPhone,
      guestCity: input.guestCity,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      arrivalDate: input.arrivalDate,
      arrivalTime: input.arrivalTime,
      arrivalMode: input.arrivalMode,
      isForeignGuest: input.isForeignGuest,
      paymentMethod: input.paymentMethod,
      mealPlan: input.mealPlan,
      noOfRooms: input.noOfRooms,
      paxAdults: input.paxAdults,
      paxChildren: input.paxChildren,
      paxExtra: input.paxExtra,
      photoUrl: input.photoUrl,
      documentUrl: input.documentUrl,
      status: input.status ?? existing.status,
      totalPrice: withTotal(room, input.checkIn, input.checkOut),
      notes: input.notes,
    };
    const reservations = get().reservations.map((r) => (r.id === id ? updated : r));
    saveReservations(reservations);
    set({ reservations });
    return updated;
  },

  cancelReservation: (id) => {
    const reservations = get().reservations.map((r) =>
      r.id === id ? { ...r, status: 'cancelled' as ReservationStatus } : r,
    );
    saveReservations(reservations);
    set({ reservations });
  },

  deleteReservation: (id) => {
    const reservations = get().reservations.filter((r) => r.id !== id);
    saveReservations(reservations);
    set({ reservations });
  },

  setStatus: (id, status) => {
    const reservations = get().reservations.map((r) => (r.id === id ? { ...r, status } : r));
    saveReservations(reservations);
    set({ reservations });
  },

  resetAll: () => {
    resetData();
    set({
      rooms: loadRooms(),
      reservations: loadReservations(),
    });
  },
}));
