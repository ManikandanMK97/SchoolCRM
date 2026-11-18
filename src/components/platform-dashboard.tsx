import { Suspense } from 'react';
import { Building2 } from 'lucide-react';
import { SchoolCreateForm } from './school-create-form';
import { SchoolFilters } from './school-filters';
import { SchoolsTable } from './schools-table';
import { listSchools } from '@/lib/schools';
import { parseInput } from '@/lib/http';
import { schoolListQuerySchema } from '@/lib/schemas';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function PlatformDashboard({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = parseInput(schoolListQuerySchema, {
    q: firstValue(params.q) ?? '',
    status: firstValue(params.status),
    sort: firstValue(params.sort) ?? 'created',
    page: firstValue(params.page) ?? '1',
  });
  const result = await listSchools(query);

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase">
            Platform workspace
          </p>
          <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight">Schools</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
            Create independent school workspaces and provision their first administrator.
          </p>
        </div>
        <span className="border-border bg-card text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium">
          <Building2 aria-hidden="true" className="text-primary size-3.5" />
          {result.total} {result.total === 1 ? 'school' : 'schools'}
        </span>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.8fr)]">
        <section id="schools" className="min-w-0 space-y-4">
          <div>
            <h2 className="font-heading text-lg font-semibold">School directory</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Search and review the schools on your platform.
            </p>
          </div>
          <Suspense
            fallback={
              <div aria-hidden="true" className="bg-muted h-[76px] animate-pulse rounded-md" />
            }
          >
            <SchoolFilters
              key={`${query.q}:${query.status ?? ''}:${query.sort}`}
              query={query.q}
              status={query.status ?? ''}
              sort={query.sort}
            />
          </Suspense>
          <SchoolsTable
            result={result}
            filters={{ q: query.q, status: query.status ?? '', sort: query.sort }}
          />
        </section>

        <aside aria-label="Create a school">
          <SchoolCreateForm />
        </aside>
      </div>
    </div>
  );
}
