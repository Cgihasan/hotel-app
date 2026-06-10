'use client';

import { LayoutGrid, Calendar, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewType = 'grid' | 'table' | 'calendar';

interface ViewToggleProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  options?: ViewType[];
}

export function ViewToggle({ view, onViewChange, options = ['grid', 'calendar'] }: ViewToggleProps) {
  return (
    <div className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-soft md:flex dark:border-slate-800 dark:bg-slate-900">
      {options.includes('grid') && (
        <button
          onClick={() => onViewChange('grid')}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg transition',
            view === 'grid'
              ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300'
              : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
          )}
          title="Grid view"
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
      )}
      {options.includes('table') && (
        <button
          onClick={() => onViewChange('table')}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg transition',
            view === 'table'
              ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300'
              : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
          )}
          title="Table view"
        >
          <List className="h-4 w-4" />
        </button>
      )}
      {options.includes('calendar') && (
        <button
          onClick={() => onViewChange('calendar')}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg transition',
            view === 'calendar'
              ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300'
              : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
          )}
          title="Calendar view"
        >
          <Calendar className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
