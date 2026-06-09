'use client';

import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import React from 'react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ title, subtitle, rightSlot, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} subtitle={subtitle} rightSlot={rightSlot} />
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="page-fade flex-1 px-4 py-6 md:px-8 md:py-8"
        >
          {children}
        </motion.main>

        {/* Mobile FAB */}
        {rightSlot && (
          <div className="fixed bottom-6 right-6 z-30 md:hidden">
            {React.isValidElement(rightSlot) ? (
              React.cloneElement(rightSlot as React.ReactElement<any>, {
                size: 'lg',
                className: cn(
                  'h-14 w-14 rounded-full shadow-2xl p-0 flex items-center justify-center',
                  (rightSlot.props as any).className,
                ),
                // To keep it icon-only, we check for leftIcon and use it as the only child.
                children: (rightSlot.props as any).leftIcon || rightSlot.props.children,
                leftIcon: null,
              })
            ) : (
              rightSlot
            )}
          </div>
        )}
      </div>
    </div>
  );
}
