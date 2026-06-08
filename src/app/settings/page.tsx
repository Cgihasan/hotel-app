'use client';

import { useState } from 'react';
import { AlertTriangle, Database, Download, RefreshCw, Hotel } from 'lucide-react';
import toast from 'react-hot-toast';

import { AppShell } from '@/components/layout/AppShell';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useData } from '@/context/DataContext';
import { exportData } from '@/lib/storage';

export default function SettingsPage() {
  return (
    <RoleGuard allow={['owner']}>
      <SettingsContent />
    </RoleGuard>
  );
}

function SettingsContent() {
  const { rooms, reservations, resetAll } = useData();
  const [confirming, setConfirming] = useState(false);

  const onExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `al-noor-palace-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  };

  const onReset = () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
      return;
    }
    resetAll();
    toast.success('Demo data restored');
  };

  return (
    <AppShell title="Settings" subtitle="Property configuration and data tools.">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
              <Hotel className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold">Property</h3>
              <p className="text-xs text-slate-500">Demo configuration</p>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <Item label="Property name" value="Al Noor Palace" />
            <Item label="Currency" value="INR" />
            <Item label="Rooms" value={String(rooms.length)} />
            <Item label="Reservations" value={String(reservations.length)} />
          </dl>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Database className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold">Data tools</h3>
              <p className="text-xs text-slate-500">Export or restore the demo dataset</p>
            </div>
          </div>
          <div className="mt-5 space-y-2.5">
            <Button
              variant="secondary"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={onExport}
              className="w-full"
            >
              Export data as JSON
            </Button>
            <Button
              variant={confirming ? 'danger' : 'outline'}
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={onReset}
              className="w-full"
            >
              {confirming ? 'Click again to confirm' : 'Restore demo dataset'}
            </Button>
            {confirming && (
              <p className="flex items-center gap-1.5 text-xs text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5" />
                This will overwrite your current data with the seed dataset.
              </p>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold">{value}</dd>
    </div>
  );
}
