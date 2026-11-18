import { GraduationCap, Menu } from 'lucide-react';
import type { ReactNode } from 'react';
import { ROLE_LABELS } from '@/lib/constants';
import type { AuthenticatedUser } from '@/lib/auth';
import { DashboardNavigation } from './dashboard-navigation';
import { LogoutButton } from './logout-button';

function Brand() {
  return (
    <div className="flex items-center gap-3 px-1 py-2">
      <span className="bg-sidebar-foreground/10 text-sidebar-foreground grid size-10 place-items-center rounded-md">
        <GraduationCap aria-hidden="true" className="size-5" />
      </span>
      <span>
        <span className="font-heading block text-[15px] font-semibold tracking-tight text-white">
          EduSphere
        </span>
        <span className="text-sidebar-muted block text-[10px] font-medium tracking-[0.18em] uppercase">
          School ERP
        </span>
      </span>
    </div>
  );
}

export function AppShell({ user, children }: { user: AuthenticatedUser; children: ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-sidebar hidden w-[252px] shrink-0 flex-col gap-8 px-4 py-5 md:flex">
        <Brand />
        <DashboardNavigation role={user.role} />
        <p className="text-sidebar-muted/70 mt-auto px-2 text-[11px] leading-5">
          One connected workspace for every school.
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border/70 bg-card sticky top-0 z-20 flex min-h-[72px] items-center justify-between gap-4 border-b px-4 sm:px-6 lg:px-9">
          <details className="relative md:hidden">
            <summary className="border-border text-foreground hover:bg-muted focus-visible:outline-ring grid size-10 cursor-pointer list-none place-items-center rounded-md border focus-visible:outline-2 focus-visible:outline-offset-2">
              <Menu aria-hidden="true" className="size-5" />
              <span className="sr-only">Open navigation</span>
            </summary>
            <div className="border-border bg-sidebar absolute top-12 left-0 z-30 w-72 rounded-md border p-4 shadow-lg">
              <Brand />
              <div className="mt-5">
                <DashboardNavigation role={user.role} />
              </div>
            </div>
          </details>

          <div className="hidden min-w-0 md:block">
            <p className="text-muted-foreground text-xs font-medium">
              {user.role === 'platform_super_admin' ? 'Platform workspace' : 'School workspace'}
            </p>
            <p className="text-foreground truncate text-sm font-semibold">EduSphere ERP</p>
          </div>

          <div className="ml-auto flex items-center gap-3 sm:gap-5">
            <div className="hidden text-right sm:block">
              <p className="text-sm leading-5 font-semibold">{user.name}</p>
              <p className="text-muted-foreground text-xs">{ROLE_LABELS[user.role]}</p>
            </div>
            <span
              aria-label={user.name}
              className="bg-primary/10 text-primary grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold"
            >
              {user.name.trim().slice(0, 1).toUpperCase()}
            </span>
            <LogoutButton />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-7 sm:px-6 sm:py-9 lg:px-9">
          {children}
        </main>
      </div>
    </div>
  );
}
