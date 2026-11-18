'use client';

export default function AppErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
        EduSphere ERP
      </span>
      <h1 className="font-heading text-2xl font-semibold">We couldn’t load this page</h1>
      <p className="text-muted-foreground text-sm leading-6">
        Your school information is safe. Try again, or return to your dashboard.
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
