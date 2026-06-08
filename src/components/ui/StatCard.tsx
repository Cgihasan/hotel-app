'use client';

import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: number; // percentage
  iconClassName?: string;
  accent?: 'brand' | 'teal' | 'amber' | 'rose' | 'emerald';
  delay?: number;
}

const ACCENTS: Record<NonNullable<StatCardProps['accent']>, string> = {
  brand: 'from-brand-500/15 to-brand-500/0 text-brand-600 dark:text-brand-300',
  teal: 'from-teal-500/15 to-teal-500/0 text-teal-600 dark:text-teal-300',
  amber: 'from-amber-500/15 to-amber-500/0 text-amber-600 dark:text-amber-300',
  rose: 'from-rose-500/15 to-rose-500/0 text-rose-600 dark:text-rose-300',
  emerald: 'from-emerald-500/15 to-emerald-500/0 text-emerald-600 dark:text-emerald-300',
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  iconClassName,
  accent = 'brand',
  delay = 0,
}: StatCardProps) {
  const isUp = (trend ?? 0) > 0;
  const isDown = (trend ?? 0) < 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -2 }}
      className="card-elevated relative overflow-hidden p-5"
    >
      <div className={cn('absolute inset-x-0 top-0 h-24 bg-gradient-to-b', ACCENTS[accent])} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-900 dark:text-white">
            {value}
          </p>
          {typeof trend === 'number' && (
            <p
              className={cn(
                'mt-2 inline-flex items-center gap-1 text-xs font-semibold',
                isUp && 'text-emerald-600',
                isDown && 'text-rose-600',
                !isUp && !isDown && 'text-slate-500',
              )}
            >
              {isUp && <ArrowUp className="h-3 w-3" />}
              {isDown && <ArrowDown className="h-3 w-3" />}
              {Math.abs(trend)}% vs last week
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-soft ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-slate-800',
            iconClassName,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
