import type { FieldErrors } from '@/lib/platform-school-api';
import { FirstError, inputClassName, labelClassName } from './school-create-fields';

export function SchoolAdminFields({ errors }: { errors: FieldErrors }) {
  return (
    <fieldset className="border-border space-y-3 border-t pt-4">
      <legend className="text-muted-foreground mb-3 text-xs font-semibold tracking-[0.12em] uppercase">
        School Admin
      </legend>
      <label className={labelClassName} htmlFor="admin-name">
        Full name
        <input
          id="admin-name"
          name="adminName"
          required
          maxLength={120}
          autoComplete="name"
          aria-describedby={errors.adminName ? 'adminName-error' : undefined}
          className={inputClassName}
        />
        <FirstError errors={errors} field="adminName" />
      </label>
      <label className={labelClassName} htmlFor="admin-email">
        Email address
        <input
          id="admin-email"
          name="adminEmail"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          aria-describedby={errors.adminEmail ? 'adminEmail-error' : undefined}
          className={inputClassName}
        />
        <FirstError errors={errors} field="adminEmail" />
      </label>
    </fieldset>
  );
}
