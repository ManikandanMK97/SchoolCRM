import { redirect } from 'next/navigation';
import { PlatformDashboard } from '@/components/platform-dashboard';
import { SchoolAdminDashboard } from '@/components/school-admin-dashboard';
import { SCHOOL_ADMIN } from '@/lib/constants';
import { getCurrentUser } from '@/lib/auth';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.mustChangePassword) redirect('/change-password');

  if (user.role === SCHOOL_ADMIN) return <SchoolAdminDashboard user={user} />;
  return <PlatformDashboard searchParams={searchParams} />;
}
