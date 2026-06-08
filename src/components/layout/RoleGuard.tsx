'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

interface RoleGuardProps {
  allow: UserRole[];
  children: React.ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ allow, children, redirectTo = '/dashboard' }: RoleGuardProps) {
  const router = useRouter();
  const { user, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!allow.includes(user.role)) {
      router.replace(redirectTo);
    }
  }, [allow, isHydrated, redirectTo, router, user]);

  if (!isHydrated || !user || !allow.includes(user.role)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
