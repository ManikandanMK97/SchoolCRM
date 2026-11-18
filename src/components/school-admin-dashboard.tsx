import { ArrowUpRight, Building2, Mail, MapPin, Phone } from 'lucide-react';
import type { AuthenticatedUser } from '@/lib/auth';
import { getSchoolDashboard } from '@/lib/schools';
import { SchoolStatusBadge } from './school-status-badge';

export async function SchoolAdminDashboard({ user }: { user: AuthenticatedUser }) {
  const school = await getSchoolDashboard(user);

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <header>
        <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase">
          School workspace
        </p>
        <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight">
          Welcome, {user.name.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Your school’s information is kept within its own private workspace.
        </p>
      </header>

      <section className="border-border bg-card overflow-hidden rounded-md border shadow-sm">
        <div className="border-border flex flex-wrap items-start justify-between gap-4 border-b px-5 py-5 sm:px-7">
          <div className="flex items-start gap-3">
            <span className="bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-md">
              <Building2 aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 className="font-heading text-xl font-semibold">{school.name}</h2>
              <p className="text-muted-foreground mt-1 text-sm">School details</p>
            </div>
          </div>
          <SchoolStatusBadge status={school.status} />
        </div>
        <dl className="grid gap-x-10 gap-y-6 p-5 sm:grid-cols-2 sm:p-7">
          <div className="flex items-start gap-3">
            <Mail aria-hidden="true" className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div>
              <dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                School email
              </dt>
              <dd className="mt-1 text-sm font-medium break-all">{school.email}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone aria-hidden="true" className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div>
              <dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Phone
              </dt>
              <dd className="mt-1 text-sm font-medium">{school.phone}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3 sm:col-span-2">
            <MapPin aria-hidden="true" className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div>
              <dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Address
              </dt>
              <dd className="mt-1 text-sm font-medium">{school.address}</dd>
            </div>
          </div>
        </dl>
      </section>

      <section className="border-border bg-card/70 rounded-md border border-dashed px-5 py-5">
        <h2 className="font-heading text-base font-semibold">Your school modules</h2>
        <p className="text-muted-foreground mt-1 text-sm leading-6">
          Students, teachers, classes, attendance, fees, exams and reports will be added in future
          phases.
        </p>
        <span className="text-primary mt-4 inline-flex items-center gap-2 text-xs font-semibold">
          Explore the navigation for the upcoming modules
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </span>
      </section>
    </div>
  );
}
