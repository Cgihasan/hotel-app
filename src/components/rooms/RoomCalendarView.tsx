'use client';

import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ChevronDown
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  differenceInDays,
} from 'date-fns';

import { useData } from '@/context/DataContext';
import { cn, fromISODate } from '@/lib/utils';
import type { Room } from '@/types';

export function RoomCalendarView() {
  const { rooms, reservations } = useData();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const days = useMemo(() => {
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [monthStart, monthEnd]);

  const roomsByFloor = useMemo(() => {
    const grouped: Record<string, Room[]> = {};
    rooms.forEach(room => {
      const floor = room.floor || 'Other';
      if (!grouped[floor]) grouped[floor] = [];
      grouped[floor].push(room);
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
  }, [rooms]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const getRoomStatusAtDate = (room: Room, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isActiveRes = reservations.find(r =>
        r.roomId === room.id &&
        r.status !== 'cancelled' &&
        dateStr >= r.checkIn &&
        dateStr < r.checkOut
    );

    if (isActiveRes) {
        return isActiveRes.status === 'checked-in' ? 'O' : 'R'; // O for Occupied, R for Reserved
    }
    return 'V'; // V for Vacant
  };

  // Summary counts for today
  const summary = useMemo(() => {
    const today = new Date();
    const counts = { V: 0, O: 0, R: 0, Total: rooms.length };
    rooms.forEach(room => {
      const status = getRoomStatusAtDate(room, today);
      if (status === 'O') counts.O++;
      else if (status === 'R') counts.R++;
      else counts.V++;
    });
    return counts;
  }, [rooms, reservations]);

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[400px] bg-white dark:bg-slate-900 rounded-xl shadow-soft overflow-hidden border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between p-3 sm:p-4 gap-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-sm sm:text-lg font-bold min-w-[100px] sm:min-w-[120px]">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button onClick={prevMonth} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition shadow-sm">
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <button onClick={goToToday} className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold hover:bg-white dark:hover:bg-slate-700 rounded transition shadow-sm mx-1">
              Today
            </button>
            <button onClick={nextMonth} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition shadow-sm">
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
          <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <FilterButton label="Room Types" />
          <FilterButton label="Status" />
          <FilterButton label="Arrival Mode" />
        </div>
      </div>

      {/* Legend Summary */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 sm:px-4 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] sm:text-[11px] font-semibold">
        <LegendItem color="bg-emerald-500" label="Vacant" count={summary.V} />
        <LegendItem color="bg-rose-500" label="Occupied" count={summary.O} />
        <LegendItem color="bg-amber-500" label="Reserved" count={summary.R} />
        <div className="hidden xs:flex items-center gap-x-4">
            <LegendItem color="bg-cyan-500" label="Dirty" count={0} />
            <LegendItem color="bg-purple-500" label="Block" count={0} />
        </div>
        <div className="ml-auto flex items-center gap-2">
            <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-slate-500 text-[8px] sm:text-[10px] text-white font-bold">T</span>
            <span className="text-slate-500 uppercase tracking-wider">Total</span>
            <span className="text-slate-900 dark:text-white font-bold">{summary.Total}</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-max">
          {/* Calendar Header Row */}
          <div className="flex sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-32 sm:w-48 p-2 sm:p-3 border-r border-slate-200 dark:border-slate-800 font-bold text-[10px] sm:text-xs bg-emerald-50 dark:bg-emerald-950/30 sticky left-0 z-40">
              {format(currentMonth, 'MMM yyyy')}
            </div>
            {days.map(day => (
              <div
                key={day.toString()}
                className={cn(
                  "w-10 sm:w-12 p-1 sm:p-2 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-[8px] sm:text-[10px] font-bold",
                  isToday(day) ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-emerald-50/50 dark:bg-emerald-950/20"
                )}
              >
                <div className="text-slate-500 uppercase">{format(day, 'EEE')}</div>
                <div className={cn(
                  "mt-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full",
                  isToday(day) ? "bg-emerald-500 text-white" : "text-slate-700 dark:text-slate-300"
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Room Rows */}
          {Object.entries(roomsByFloor).map(([floor, rooms]) => (
            <div key={floor}>
              {/* Floor Header Row */}
              <div className="flex bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                <div className="w-32 sm:w-48 p-2 border-r border-slate-200 dark:border-slate-800 flex items-center gap-2 sticky left-0 z-20 bg-slate-50 dark:bg-slate-800">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 flex items-center justify-center text-[8px] sm:text-[10px] text-slate-400">▼</div>
                  <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-widest text-brand-700 dark:text-brand-400">
                    {floor} ({rooms.length})
                  </span>
                </div>
                {days.map(day => (
                  <div key={day.toString()} className="w-10 sm:w-12 h-6 sm:h-8 border-r border-slate-200 dark:border-slate-800 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-slate-400">
                    {rooms.length}
                  </div>
                ))}
              </div>

              {/* Room Data Rows */}
              {rooms.map(room => (
                <div key={room.id} className="flex border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="w-32 sm:w-48 p-2 border-r border-slate-200 dark:border-slate-800 flex items-center gap-2 sm:gap-3 bg-white dark:bg-slate-900 sticky left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                    <StatusIcon status={getRoomStatusAtDate(room, new Date())} />
                    <span className="font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200">{room.number}</span>
                  </div>
                  <div className="flex relative">
                    {days.map(day => (
                      <div key={day.toString()} className="w-10 sm:w-12 h-10 sm:h-12 border-r border-slate-200 dark:border-slate-800 relative flex-shrink-0" />
                    ))}

                    {/* Reservations Overlay */}
                    {reservations
                        .filter(r => r.roomId === room.id && r.status !== 'cancelled')
                        .map(res => {
                            const checkInDate = fromISODate(res.checkIn);
                            const checkOutDate = fromISODate(res.checkOut);

                            if (checkOutDate <= monthStart || checkInDate >= monthEnd) return null;

                            const displayStart = checkInDate < monthStart ? monthStart : checkInDate;
                            const displayEnd = checkOutDate > monthEnd ? monthEnd : checkOutDate;

                            const startOffset = differenceInDays(displayStart, monthStart);
                            const duration = differenceInDays(displayEnd, displayStart);

                            const isStartingThisMonth = checkInDate >= monthStart;

                            return (
                                <div
                                    key={res.id}
                                    className={cn(
                                        "absolute top-1 z-10 rounded p-1 shadow-sm overflow-hidden whitespace-nowrap text-[7px] sm:text-[8px] font-bold text-white transition-all cursor-pointer",
                                        res.status === 'checked-in' ? "bg-rose-400" : "bg-amber-400",
                                        !isStartingThisMonth && "rounded-l-none"
                                    )}
                                    style={{
                                        left: `calc(${startOffset} * var(--day-width, 48px) + 4px)`,
                                        width: `calc(${Math.max(1, duration)} * var(--day-width, 48px) - 8px)`,
                                        height: 'calc(100% - 8px)'
                                    }}
                                >
                                    <div className="truncate uppercase">{res.guestName}</div>
                                    <div className="text-[6px] sm:text-[7px] opacity-90 mt-0.5">
                                        {format(fromISODate(res.checkIn), 'hh:mm a')}
                                    </div>
                                </div>
                            );
                        })
                    }
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .min-w-max {
          --day-width: 48px;
        }
        @media (max-width: 640px) {
          .min-w-max {
            --day-width: 40px;
          }
        }
      `}</style>
    </div>
  );
}

function FilterButton({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700">
      <span className="text-slate-500">{label}</span>
      <ChevronDown className="h-3 w-3 text-slate-400" />
    </button>
  );
}

function LegendItem({ color, label, count }: { color: string; label: string; count: number }) {
  const initial = label.charAt(0).toUpperCase();
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className={cn("flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full text-[8px] sm:text-[10px] text-white font-bold shadow-sm", color)}>
        {initial}
      </div>
      <span className="text-slate-600 dark:text-slate-300">{label}</span>
      <span className="text-slate-900 dark:text-white font-bold">{count}</span>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
    const color = status === 'V' ? 'bg-emerald-500' : (status === 'O' ? 'bg-rose-500' : 'bg-amber-500');
    return (
        <div className={cn("flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[8px] sm:text-[10px] text-white font-bold shadow-sm shrink-0", color)}>
            {status}
        </div>
    );
}
