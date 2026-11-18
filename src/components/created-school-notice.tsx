'use client';

import { Check, Copy } from 'lucide-react';
import type { CreatedSchoolAccount } from '@/lib/platform-school-api';

export function CreatedSchoolNotice({
  account,
  copied,
  onCopy,
}: {
  account: CreatedSchoolAccount;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div role="status" className="border-success/20 bg-success/10 mb-5 rounded-md border p-4">
      <div className="flex items-start gap-2">
        <Check aria-hidden="true" className="text-success mt-0.5 size-4 shrink-0" />
        <div className="min-w-0">
          <p className="text-success text-sm font-semibold">{account.school.name} is ready</p>
          <p className="text-success mt-1 text-xs leading-5">
            Share this one-time password with {account.admin.name} ({account.admin.email}). They
            must replace it when they first sign in. It will not be shown again.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="border-success/20 bg-card text-success rounded border px-2.5 py-2 font-mono text-sm font-semibold select-all">
              {account.temporaryPassword}
            </code>
            <button
              type="button"
              onClick={onCopy}
              className="border-success/40 text-success hover:bg-success/10 focus-visible:outline-ring inline-flex min-h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Copy aria-hidden="true" className="size-3.5" />
              {copied ? 'Copied' : 'Copy password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
