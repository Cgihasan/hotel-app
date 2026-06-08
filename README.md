# Aurora Stay — Hotel Reservation Suite

A modern, role-based hotel reservation dashboard built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Zustand**, **Recharts** and **react-datepicker**. Fully client-side — all data is stored in `localStorage` and seeded with realistic demo content on first run.

## ✨ Features

- **Two roles, two experiences**
  - **Owner** — full dashboard, manage rooms, create / edit / cancel / delete reservations, run exports, restore demo data.
  - **Reception** — view all reservations, process check-in / check-out, check availability. No create / edit / delete.
- **Dashboard** — KPI cards, 7-day occupancy area chart, upcoming arrivals, quick actions.
- **Reservations** — searchable + filterable table with live status updates, animated row transitions, role-aware action buttons.
- **Rooms** — beautiful room cards with active toggle, amenity chips, capacity & price.
- **Availability** — date-range check across all rooms with available / booked badges and one-tap booking (owner only).
- **Settings** — JSON export and demo data reset (owner only).
- **Polished UX** — glassmorphism, micro-interactions, dark / light theme, responsive layout, accessible keyboard navigation, animated page transitions.

## 🚀 Getting started

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## 🔐 Demo accounts

| Role     | Email                  | Password (any) |
|----------|------------------------|----------------|
| Owner    | owner@hotel.com        | demo1234       |
| Reception| reception@hotel.com    | demo1234       |

> Tip: use the demo-account quick-fill chips on the login page.

## 🗂️ Project structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── login/                # Public login
│   ├── dashboard/            # Role-aware dashboard
│   ├── reservations/         # Reservation table
│   ├── rooms/                # Owner-only
│   ├── availability/         # Both roles (booking is owner-only)
│   └── settings/             # Owner-only
├── components/
│   ├── layout/               # AppShell, Sidebar, Header, RoleGuard, ThemeToggle, Providers
│   ├── ui/                   # Button, Modal, Card, StatCard, StatusBadge, DateRangeField, EmptyState
│   └── forms/                # ReservationForm, RoomForm
├── context/                  # AuthContext (Zustand) + DataContext (Zustand store)
├── lib/                      # storage, availability, utility helpers
├── types/                    # Shared TypeScript interfaces
└── utils/                    # seedData
```

## 🧪 Edge cases handled

- **Double-booking prevention** when creating / editing reservations.
- Check-out date must be after check-in.
- Computed total price = nights × nightly rate.
- Reception users are redirected away from owner-only routes.
- Logout clears auth from `localStorage` and routes back to `/login`.
