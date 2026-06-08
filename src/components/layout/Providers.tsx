'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const hydrateAuth = useAuth((s) => s.hydrate);
  const hydrateData = useData((s) => s.hydrate);

  useEffect(() => {
    hydrateAuth();
    hydrateData();
  }, [hydrateAuth, hydrateData]);

  return <>{children}</>;
}
