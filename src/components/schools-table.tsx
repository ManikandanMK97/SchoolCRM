import Link from 'next/link';
import { ArrowLeft, ArrowRight, School as SchoolIcon } from 'lucide-react';
import { SCHOOL_PAGE_SIZE } from '@/lib/constants';
import type { SchoolListItem } from '@/lib/schools';
import { SchoolStatusBadge } from './school-status-badge';

type SchoolPage = {
  items: SchoolListItem[];
  total: number;
  page: number;
  pages: number;
};

function pageHref(page: number, filters: { q: string; status: string; sort: string }) {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.status) params.set('status', filters.status);
  if (filters.sort !== 'created') params.set('sort', filters.sort);
  if (page > 1) params.set('page', String(page));
  return `/dashboard${params.size ? `?${params.toString()}` : ''}`;
}

export function SchoolsTable({
  result,
  filters,
}: {
  result: SchoolPage;
  filters: { q: string; status: string; sort: string };
}) {
  if (result.total === 0) {
    return (
      <div className="border-border bg-card grid min-h-64 place-items-center rounded-md border border-dashed px-6 py-10 text-center">
        <div className="max-w-sm">
          <span className="bg-primary/10 text-primary mx-auto mb-4 grid size-12 place-items-center rounded-full">
            <SchoolIcon aria-hidden="true" className="size-5" />
          </span>
          <h2 className="font-heading text-base font-semibold">
            {filters.q || filters.status ? 'No schools match those filters' : 'No schools yet'}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {filters.q || filters.status
              ? 'Try a different search or clear the filters to see every school.'
              : 'Create the first school using the form. Its School Admin account is created at the same time.'}
          </p>
          {(filters.q || filters.status) && (
            <Link
              href="/dashboard"
              className="border-border hover:bg-muted focus-visible:outline-ring mt-4 inline-flex min-h-10 items-center rounded-md border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Clear filters
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border-border bg-card overflow-hidden rounded-md border">
      <div className="border-border flex items-center justify-between gap-4 border-b px-4 py-3 sm:px-5">
        <p className="text-sm font-semibold">
          {result.total} {result.total === 1 ? 'school' : 'schools'}
        </p>
        <p className="text-muted-foreground text-xs">
          Page {result.page} of {result.pages}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-muted/60 text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            <tr>
              <th scope="col" className="px-5 py-3">
                School
              </th>
              <th scope="col" className="px-5 py-3">
                School Admin
              </th>
              <th scope="col" className="px-5 py-3">
                Contact
              </th>
              <th scope="col" className="px-5 py-3">
                Status
              </th>
              <th scope="col" className="px-5 py-3">
                Added
              </th>
            </tr>
          </thead>
          <tbody className="divide-border/70 divide-y">
            {result.items.map((school) => (
              <tr key={school.id} className="hover:bg-muted/40 transition-colors">
                <td className="max-w-[280px] px-5 py-4">
                  <p className="text-foreground truncate font-semibold">{school.name}</p>
                  <p className="text-muted-foreground mt-1 truncate text-xs">{school.email}</p>
                  <p className="text-muted-foreground mt-1 truncate text-xs">{school.address}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium">{school.adminName ?? 'Not provisioned'}</p>
                  <p className="text-muted-foreground mt-1 text-xs">{school.adminEmail ?? '—'}</p>
                </td>
                <td className="text-muted-foreground px-5 py-4 text-sm">{school.phone}</td>
                <td className="px-5 py-4">
                  <SchoolStatusBadge status={school.status} />
                </td>
                <td className="text-muted-foreground px-5 py-4 text-xs whitespace-nowrap">
                  {new Intl.DateTimeFormat('en', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }).format(school.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result.pages > 1 && (
        <nav
          aria-label="School list pages"
          className="border-border flex items-center justify-between border-t px-4 py-3 sm:px-5"
        >
          <Link
            aria-disabled={result.page <= 1}
            tabIndex={result.page <= 1 ? -1 : undefined}
            className="border-border hover:bg-muted focus-visible:outline-ring inline-flex min-h-9 items-center gap-2 rounded-md border px-3 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 aria-disabled:pointer-events-none aria-disabled:opacity-40"
            href={pageHref(Math.max(1, result.page - 1), filters)}
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" /> Previous
          </Link>
          <span className="text-muted-foreground text-xs">
            Showing {(result.page - 1) * SCHOOL_PAGE_SIZE + 1}–
            {Math.min(result.page * SCHOOL_PAGE_SIZE, result.total)} of {result.total}
          </span>
          <Link
            aria-disabled={result.page >= result.pages}
            tabIndex={result.page >= result.pages ? -1 : undefined}
            className="border-border hover:bg-muted focus-visible:outline-ring inline-flex min-h-9 items-center gap-2 rounded-md border px-3 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 aria-disabled:pointer-events-none aria-disabled:opacity-40"
            href={pageHref(Math.min(result.pages, result.page + 1), filters)}
          >
            Next <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </nav>
      )}
    </div>
  );
}
