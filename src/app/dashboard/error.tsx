'use client';

import { useEffect } from 'react';

export default function DashboardError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error('The dashboard failed to load.', error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-heading text-2xl font-semibold">We couldn’t load your dashboard</h1>
      <p className="text-muted-foreground text-sm leading-6">
        Your school information is safe. Try again to reload the dashboard.
      </p>
      <button
        type="button"
        onClick={retry}
        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-ring min-h-11 rounded-md px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Try again
      </button>
    </main>
  );
}
