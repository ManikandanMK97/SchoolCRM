'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  requestSchoolCreation,
  type CreatedSchoolAccount,
  type FieldErrors,
} from '@/lib/platform-school-api';
import { CreatedSchoolNotice } from './created-school-notice';
import { SchoolAdminFields } from './school-admin-fields';
import { SchoolDetailsFields } from './school-create-fields';

export function SchoolCreateForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [createdAccount, setCreatedAccount] = useState<CreatedSchoolAccount | null>(null);
  const [copied, setCopied] = useState(false);

  async function submitSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setMessage('');
    setFieldErrors({});
    setCreatedAccount(null);
    setCopied(false);

    try {
      const { response, payload } = await requestSchoolCreation(new FormData(form));

      if (!response.ok) {
        setMessage(payload.error?.message ?? 'The school could not be created.');
        setFieldErrors(payload.error?.fieldErrors ?? {});
        return;
      }

      if (!payload.school || !payload.admin || !payload.temporaryPassword) {
        throw new Error('The server did not return the new School Admin credentials.');
      }

      setCreatedAccount({
        school: payload.school,
        admin: payload.admin,
        temporaryPassword: payload.temporaryPassword,
      });
      form.reset();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The school could not be created.');
    } finally {
      setPending(false);
    }
  }

  async function copyTemporaryPassword() {
    if (!createdAccount) return;
    try {
      await navigator.clipboard.writeText(createdAccount.temporaryPassword);
      setCopied(true);
    } catch {
      setMessage('Clipboard access is unavailable. Select and copy the password instead.');
    }
  }

  return (
    <section className="border-border bg-card rounded-md border p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="bg-primary/10 text-primary grid size-9 shrink-0 place-items-center rounded-md">
          <Plus aria-hidden="true" className="size-4" />
        </span>
        <div>
          <h2 className="font-heading text-base font-semibold">Add a school</h2>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            The School Admin account is created with the school.
          </p>
        </div>
      </div>

      {message && (
        <p
          role="alert"
          className="border-destructive/20 bg-destructive/10 text-destructive mb-4 rounded-md border px-3 py-2 text-sm"
        >
          {message}
        </p>
      )}
      {createdAccount && (
        <CreatedSchoolNotice
          account={createdAccount}
          copied={copied}
          onCopy={copyTemporaryPassword}
        />
      )}

      <form onSubmit={submitSchool} className="space-y-4" noValidate>
        <SchoolDetailsFields errors={fieldErrors} />
        <SchoolAdminFields errors={fieldErrors} />
        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? 'Creating school…' : 'Create school and admin'}
        </button>
      </form>
    </section>
  );
}
