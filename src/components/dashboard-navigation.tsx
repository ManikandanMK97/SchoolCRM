import Link from 'next/link';
import {
  BookOpen,
  CalendarCheck2,
  ChartNoAxesColumn,
  ClipboardCheck,
  LayoutDashboard,
  School,
  Users,
  WalletCards,
} from 'lucide-react';
import { PLATFORM_SUPER_ADMIN } from '@/lib/constants';
import type { UserRole } from '@/lib/constants';

const futureModules = [
  { label: 'Students', icon: Users },
  { label: 'Teachers', icon: BookOpen },
  { label: 'Classes', icon: School },
  { label: 'Attendance', icon: CalendarCheck2 },
  { label: 'Fees', icon: WalletCards },
  { label: 'Exams', icon: ClipboardCheck },
  { label: 'Reports', icon: ChartNoAxesColumn },
];

export function DashboardNavigation({ role }: { role: UserRole }) {
  return (
    <nav aria-label="Main navigation" className="space-y-7">
      <div className="space-y-1">
        <p className="text-sidebar-muted/80 px-3 text-[11px] font-semibold tracking-[0.16em] uppercase">
          Workspace
        </p>
        <Link
          href="/dashboard"
          aria-current="page"
          className="bg-sidebar-active text-sidebar-foreground hover:bg-sidebar-active/90 flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <LayoutDashboard aria-hidden="true" className="size-4" />
          Overview
        </Link>
        {role === PLATFORM_SUPER_ADMIN && (
          <Link
            href="/dashboard#schools"
            className="text-sidebar-foreground/85 hover:text-sidebar-foreground flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <School aria-hidden="true" className="size-4" />
            Schools
          </Link>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sidebar-muted/80 px-3 text-[11px] font-semibold tracking-[0.16em] uppercase">
          School modules
        </p>
        {futureModules.map(({ label, icon: Icon }) => (
          <div
            key={label}
            aria-disabled="true"
            className="text-sidebar-muted/70 flex min-h-10 items-center justify-between gap-2 rounded-md px-3 text-sm"
          >
            <span className="flex items-center gap-3">
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </span>
            <span className="text-sidebar-muted rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide uppercase">
              Soon
            </span>
          </div>
        ))}
      </div>
    </nav>
  );
}
