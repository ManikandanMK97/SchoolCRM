'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function logOut() {
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Could not sign out. Try again.');
      router.replace('/login');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not sign out.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={logOut}
        disabled={pending}
        className="border-border bg-card text-foreground hover:bg-muted focus-visible:outline-ring inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        <LogOut aria-hidden="true" className="size-4" />
        <span className="hidden sm:inline">{pending ? 'Signing out…' : 'Sign out'}</span>
        <span className="sr-only sm:hidden">{pending ? 'Signing out' : 'Sign out'}</span>
      </button>
      {error && (
        <p
          role="alert"
          className="text-destructive absolute top-12 right-0 w-52 text-right text-xs"
        >
          {error}
        </p>
      )}
    </div>
  );
}
