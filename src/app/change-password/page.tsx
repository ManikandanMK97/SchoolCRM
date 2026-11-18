import { GraduationCap, ShieldCheck } from 'lucide-react';
import { redirect } from 'next/navigation';
import { PasswordChangeForm } from '@/components/password-change-form';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!user.mustChangePassword) redirect('/dashboard');

  return (
    <main className="bg-background grid min-h-screen place-items-center px-5 py-12">
      <section className="border-border bg-card w-full max-w-[460px] rounded-md border p-6 shadow-sm sm:p-9">
        <div className="mb-7 flex items-center gap-3">
          <span className="bg-primary/10 text-primary grid size-10 place-items-center rounded-md">
            <GraduationCap aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="font-heading text-sm font-semibold">EduSphere ERP</p>
            <p className="text-muted-foreground text-xs">School workspace</p>
          </div>
        </div>
        <span className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold">
          <ShieldCheck aria-hidden="true" className="size-3.5" />
          First sign-in security
        </span>
        <h1 className="font-heading mt-4 text-2xl font-semibold tracking-tight">
          Choose a new password
        </h1>
        <p className="text-muted-foreground mt-2 mb-6 text-sm leading-6">
          Hi {user.name.split(' ')[0]}, replace your temporary password before opening your school
          dashboard.
        </p>
        <PasswordChangeForm />
      </section>
    </main>
  );
}
