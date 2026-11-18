import type { SchoolStatus } from '@/lib/constants';

export function SchoolStatusBadge({ status }: { status: SchoolStatus }) {
  const active = status === 'active';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
      }`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${active ? 'bg-success' : 'bg-warning'}`}
      />
      {active ? 'Active' : 'Suspended'}
    </span>
  );
}
