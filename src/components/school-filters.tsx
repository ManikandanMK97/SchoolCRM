'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function SchoolFilters({
  query,
  status,
  sort,
}: {
  query: string;
  status: string;
  sort: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState(query);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateFilters(changes: Record<string, string>) {
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.set('page', '1');
    const queryString = next.toString();
    router.replace(queryString ? `/dashboard?${queryString}` : '/dashboard', {
      scroll: false,
    });
  }

  function changeSearch(value: string) {
    setSearchText(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => updateFilters({ q: value }), 300);
  }

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  return (
    <div className="flex flex-wrap items-end gap-3" role="search" aria-label="Filter schools">
      <label className="text-foreground grid min-w-[220px] flex-1 gap-1.5 text-xs font-semibold">
        Search schools and contacts
        <input
          key={query}
          value={searchText}
          onChange={(event) => changeSearch(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              if (searchTimer.current) clearTimeout(searchTimer.current);
              updateFilters({ q: searchText });
            }
          }}
          placeholder="Name, email, address or phone"
          className="border-border bg-card placeholder:text-muted-foreground/70 focus-visible:ring-ring min-h-10 rounded-md border px-3 text-sm font-normal transition-shadow outline-none focus-visible:ring-2"
        />
      </label>
      <label className="text-foreground grid w-full gap-1.5 text-xs font-semibold sm:w-36">
        Status
        <select
          value={searchParams.get('status') ?? status}
          onChange={(event) => updateFilters({ status: event.currentTarget.value })}
          className="border-border bg-card focus-visible:ring-ring min-h-10 rounded-md border px-3 text-sm font-normal outline-none focus-visible:ring-2"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </label>
      <label className="text-foreground grid w-full gap-1.5 text-xs font-semibold sm:w-40">
        Sort by
        <select
          value={searchParams.get('sort') ?? sort}
          onChange={(event) => updateFilters({ sort: event.currentTarget.value })}
          className="border-border bg-card focus-visible:ring-ring min-h-10 rounded-md border px-3 text-sm font-normal outline-none focus-visible:ring-2"
        >
          <option value="created">Recently added</option>
          <option value="name">School name</option>
        </select>
      </label>
    </div>
  );
}
