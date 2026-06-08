'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Eye, EyeOff, Hotel, KeyRound, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const { user, isHydrated, login } = useAuth();
  const [email, setEmail] = useState('owner@hotel.com');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isHydrated && user) router.replace('/dashboard');
  }, [isHydrated, user, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);
      router.replace('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const fill = (kind: 'owner' | 'reception') => {
    if (kind === 'owner') {
      setEmail('owner@hotel.com');
    } else {
      setEmail('reception@hotel.com');
    }
    setPassword('demo1234');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-mesh-blue opacity-90 dark:opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-grid-slate bg-[size:32px_32px] opacity-30" />

      <div className="absolute right-6 top-6 z-10">
        <ThemeToggle />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2">
          {/* Marketing panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:block"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              New: Real-time occupancy charts
            </div>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              Run your hotel
              <br />
              like a <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-teal-500 bg-clip-text text-transparent">five-star concierge.</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-slate-600 dark:text-slate-300">
              Al Noor Palace gives owners a single pane of glass for rooms, reservations, and revenue —
              while keeping reception staff laser-focused on check-ins and guest happiness.
            </p>

            <div className="mt-8 grid max-w-md grid-cols-2 gap-3 text-sm">
              {[
                { icon: ShieldCheck, label: 'Role-based access' },
                { icon: Hotel, label: 'Smart room grid' },
                { icon: Sparkles, label: 'Beautiful by default' },
                { icon: KeyRound, label: 'Mocked auth — no setup' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2.5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Login form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="mx-auto w-full max-w-md"
          >
            <div className="card-elevated relative overflow-hidden p-8 sm:p-10">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-brand-500/20 to-teal-500/20 blur-3xl" />
              <div className="relative">
                <div className="mb-6 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-500 text-white shadow-glow">
                    <Hotel className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display text-lg font-extrabold leading-tight">Al Noor Palace</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Reservation Suite</p>
                  </div>
                </div>

                <h2 className="font-display text-2xl font-extrabold tracking-tight">Sign in to your suite</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Use the demo accounts below — password is anything.
                </p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="label">Email</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        className="input pl-10"
                        placeholder="you@hotel.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="input pl-10 pr-10"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" loading={loading} size="lg">
                    Sign in
                  </Button>
                </form>

                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-4 text-xs dark:border-slate-800">
                  <p className="mb-2 font-semibold uppercase tracking-wider text-slate-500">Demo accounts</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => fill('owner')}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-brand-500 hover:bg-brand-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500 dark:hover:bg-brand-950/30"
                    >
                      <p className="font-semibold text-slate-800 dark:text-slate-100">Owner</p>
                      <p className="text-[11px] text-slate-500">owner@hotel.com</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => fill('reception')}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-teal-500 hover:bg-teal-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-500 dark:hover:bg-teal-950/30"
                    >
                      <p className="font-semibold text-slate-800 dark:text-slate-100">Reception</p>
                      <p className="text-[11px] text-slate-500">reception@hotel.com</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Demo build · No data leaves your browser
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
