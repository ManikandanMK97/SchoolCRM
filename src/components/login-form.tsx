'use client';

import { ArrowRight, LockKeyhole } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    setPending(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as {
        error?: { message?: string };
        user?: { mustChangePassword: boolean };
      };
      if (!response.ok || !payload.user) {
        setError(
          payload.error?.message ?? 'We couldn’t sign you in. Check your details and try again.'
        );
        return;
      }

      router.replace(payload.user.mustChangePassword ? '/change-password' : '/dashboard');
      router.refresh();
    } catch {
      setError('We couldn’t reach EduSphere ERP. Check your connection and try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={signIn} className="space-y-5" noValidate>
      {error && (
        <p
          role="alert"
          className="border-destructive/20 bg-destructive/10 text-destructive rounded-md border px-3 py-2.5 text-sm"
        >
          {error}
        </p>
      )}
      <label htmlFor="email" className="grid gap-2 text-sm font-semibold">
        Email address
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
          className="border-border bg-card placeholder:text-muted-foreground/70 focus-visible:ring-ring min-h-12 rounded-md border px-3.5 text-sm font-normal transition-shadow outline-none focus-visible:ring-2"
          placeholder="you@school.edu"
        />
      </label>
      <label htmlFor="password" className="grid gap-2 text-sm font-semibold">
        Password
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={72}
          className="border-border bg-card placeholder:text-muted-foreground/70 focus-visible:ring-ring min-h-12 rounded-md border px-3.5 text-sm font-normal transition-shadow outline-none focus-visible:ring-2"
          placeholder="Enter your password"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="group bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? 'Signing in…' : 'Sign in'}
        {!pending && (
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-0.5"
          />
        )}
        {pending && <LockKeyhole aria-hidden="true" className="size-4" />}
      </button>
    </form>
  );
}
