'use client';

import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export function PasswordChangeForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const password = String(values.get('password') ?? '');
    const confirmation = String(values.get('confirmPassword') ?? '');
    if (password !== confirmation) {
      setError('Those passwords do not match.');
      return;
    }

    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const payload = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) {
        setError(payload.error?.message ?? 'We couldn’t update your password.');
        return;
      }
      router.replace('/dashboard');
      router.refresh();
    } catch {
      setError('We couldn’t reach EduSphere ERP. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={changePassword} className="space-y-5" noValidate>
      {error && (
        <p
          role="alert"
          className="border-destructive/20 bg-destructive/10 text-destructive rounded-md border px-3 py-2.5 text-sm"
        >
          {error}
        </p>
      )}
      <label htmlFor="new-password" className="grid gap-2 text-sm font-semibold">
        New password
        <input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={72}
          className="border-border bg-card focus-visible:ring-ring min-h-12 rounded-md border px-3.5 text-sm font-normal outline-none focus-visible:ring-2"
        />
        <span className="text-muted-foreground text-xs font-normal">
          Use at least 12 characters.
        </span>
      </label>
      <label htmlFor="confirm-password" className="grid gap-2 text-sm font-semibold">
        Confirm new password
        <input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={72}
          className="border-border bg-card focus-visible:ring-ring min-h-12 rounded-md border px-3.5 text-sm font-normal outline-none focus-visible:ring-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="group bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? 'Updating password…' : 'Set new password'}
        {!pending && (
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-0.5"
          />
        )}
        {pending && <ShieldCheck aria-hidden="true" className="size-4" />}
      </button>
    </form>
  );
}
