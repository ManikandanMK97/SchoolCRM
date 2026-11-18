export default function DashboardLoading() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading your dashboard" className="space-y-6">
      <span className="sr-only">Loading your dashboard</span>
      <div aria-hidden="true" className="bg-muted h-8 w-52 animate-pulse rounded-md" />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.8fr)]">
        <section className="min-w-0 space-y-4" aria-hidden="true">
          <div className="bg-muted h-6 w-40 animate-pulse rounded" />
          <div className="border-border bg-card flex gap-3 rounded-md border p-3">
            <div className="bg-muted h-10 flex-1 animate-pulse rounded" />
            <div className="bg-muted h-10 w-28 animate-pulse rounded" />
            <div className="bg-muted h-10 w-28 animate-pulse rounded" />
          </div>
          <div className="border-border bg-card overflow-hidden rounded-md border">
            <div className="bg-muted/50 flex gap-4 px-4 py-3">
              <div className="bg-muted h-3 w-1/3 animate-pulse rounded" />
              <div className="bg-muted h-3 w-1/4 animate-pulse rounded" />
              <div className="bg-muted h-3 w-20 animate-pulse rounded" />
            </div>
            {Array.from({ length: 5 }, (_, row) => (
              <div key={row} className="border-border flex items-center gap-4 border-t px-4 py-4">
                <div className="bg-muted h-4 flex-1 animate-pulse rounded" />
                <div className="bg-muted h-4 w-1/4 animate-pulse rounded" />
                <div className="bg-muted h-6 w-20 animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        </section>
        <aside aria-hidden="true" className="border-border bg-card space-y-5 rounded-md border p-5">
          <div className="bg-muted h-5 w-36 animate-pulse rounded" />
          {Array.from({ length: 5 }, (_, row) => (
            <div key={row} className="space-y-2">
              <div className="bg-muted h-3 w-24 animate-pulse rounded" />
              <div className="bg-muted h-10 animate-pulse rounded" />
            </div>
          ))}
          <div className="bg-muted h-11 animate-pulse rounded" />
        </aside>
      </div>
    </div>
  );
}
