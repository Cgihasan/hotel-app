import { cn } from '@/lib/utils';
import type { ReservationStatus } from '@/types';

const STYLES: Record<ReservationStatus, string> = {
  confirmed:
    'bg-amber-50 text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900/50',
  'checked-in':
    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900/50',
  'checked-out':
    'bg-slate-100 text-slate-600 ring-1 ring-slate-200/70 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700',
  cancelled:
    'bg-rose-50 text-rose-700 ring-1 ring-rose-200/70 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900/50',
};

const LABEL: Record<ReservationStatus, string> = {
  confirmed: 'Confirmed',
  'checked-in': 'Checked-in',
  'checked-out': 'Checked-out',
  cancelled: 'Cancelled',
};

export function StatusBadge({ status, className }: { status: ReservationStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        STYLES[status],
        className,
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'confirmed' && 'bg-amber-500',
          status === 'checked-in' && 'bg-emerald-500',
          status === 'checked-out' && 'bg-slate-500',
          status === 'cancelled' && 'bg-rose-500',
        )}
      />
      {LABEL[status]}
    </span>
  );
}
