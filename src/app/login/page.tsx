import { GraduationCap, LockKeyhole, ShieldCheck } from 'lucide-react';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/login-form';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user?.mustChangePassword) redirect('/change-password');
  if (user) redirect('/dashboard');

  return (
    <main className="bg-background grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(450px,0.82fr)]">
      <section className="bg-sidebar text-sidebar-foreground relative hidden overflow-hidden px-10 py-10 lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="flex items-center gap-3">
          <span className="bg-sidebar-foreground/10 text-sidebar-foreground grid size-11 place-items-center rounded-md">
            <GraduationCap aria-hidden="true" className="size-6" />
          </span>
          <div>
            <p className="font-heading text-sidebar-foreground text-lg font-semibold">EduSphere</p>
            <p className="text-sidebar-muted text-[10px] font-semibold tracking-[0.2em] uppercase">
              ERP
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl pb-10">
          <p className="border-sidebar-foreground/15 bg-sidebar-foreground/5 text-sidebar-muted mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium">
            <span className="bg-secondary size-1.5 rounded-full" />
            One workspace, each school independent
          </p>
          <h1 className="font-heading text-sidebar-foreground text-4xl leading-[1.15] font-semibold tracking-tight xl:text-5xl">
            School operations,
            <br />
            <span className="text-sidebar-muted">beautifully connected.</span>
          </h1>
          <p className="text-sidebar-muted/75 mt-5 max-w-md text-sm leading-7">
            A dependable place for school leaders to manage their community and for the platform
            team to support every campus.
          </p>
          <div className="text-sidebar-muted/80 mt-9 flex flex-wrap gap-3 text-xs">
            <span className="border-sidebar-foreground/10 inline-flex items-center gap-2 rounded-full border px-3 py-2">
              <ShieldCheck aria-hidden="true" className="text-sidebar-muted size-4" />
              Private school workspaces
            </span>
            <span className="border-sidebar-foreground/10 inline-flex items-center gap-2 rounded-full border px-3 py-2">
              <LockKeyhole aria-hidden="true" className="text-sidebar-muted size-4" />
              Secure sign in
            </span>
          </div>
        </div>
        <p className="text-sidebar-muted/55 text-xs">A calmer way to run school operations.</p>
        <div
          aria-hidden="true"
          className="border-sidebar-foreground/10 pointer-events-none absolute -top-28 -right-36 size-[480px] rounded-full border"
        />
        <div
          aria-hidden="true"
          className="border-sidebar-foreground/10 pointer-events-none absolute -top-8 -right-16 size-[340px] rounded-full border"
        />
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[440px]">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="bg-primary text-primary-foreground grid size-10 place-items-center rounded-md">
              <GraduationCap aria-hidden="true" className="size-5" />
            </span>
            <span className="font-heading text-base font-semibold">EduSphere ERP</span>
          </div>
          <div className="mb-8">
            <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase">
              Welcome back
            </p>
            <h2 className="font-heading mt-2 text-3xl font-semibold tracking-tight">
              Sign in to your workspace
            </h2>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              Use the administrator account created for your role.
            </p>
          </div>
          <LoginForm />
          <p className="text-muted-foreground mt-7 text-center text-xs leading-5">
            Need access? Ask your Platform Super Admin to set up your account.
          </p>
        </div>
      </section>
    </main>
  );
}
