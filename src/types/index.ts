export type RoomType = 'family' | 'duplex';

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  isActive: boolean;
}

export type ReservationStatus = 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
export type ArrivalMode = 'walkin' | 'travel-agent' | 'ota' | 'company';
export type MealPlan = 'CP' | 'EP' | 'AP' | 'MAP';
export type PaymentMethod = 'cash' | 'gpay';

export interface Reservation {
  id: string;
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
  status: ReservationStatus;
  totalPrice: number;
  notes?: string;
  createdAt: string;
}

export type UserRole = 'owner' | 'reception';

export interface User {
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AppData {
  rooms: Room[];
  reservations: Reservation[];
}
