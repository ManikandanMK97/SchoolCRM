import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold tracking-[0.14em] uppercase">
        Page not found
      </span>
      <h1 className="font-heading text-3xl font-semibold">This page isn’t here</h1>
      <p className="text-muted-foreground text-sm leading-6">
        The page may have moved, or it may not be part of this phase of EduSphere ERP.
      </p>
      <Link
        href="/dashboard"
        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-ring inline-flex min-h-11 items-center rounded-md px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Go to dashboard
      </Link>
    </main>
  );
}
