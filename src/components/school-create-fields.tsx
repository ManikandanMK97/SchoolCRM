import type { FieldErrors } from '@/lib/platform-school-api';

export const labelClassName = 'grid gap-1.5 text-xs font-semibold';
export const inputClassName =
  'min-h-10 rounded-md border border-border bg-card px-3 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring';
export const textAreaClassName =
  'resize-y rounded-md border border-border bg-card px-3 py-2 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function FirstError({ errors, field }: { errors: FieldErrors; field: string }) {
  const message = errors[field]?.[0];
  return message ? (
    <span id={`${field}-error`} className="text-destructive text-xs">
      {message}
    </span>
  ) : null;
}

export function SchoolDetailsFields({ errors }: { errors: FieldErrors }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-muted-foreground mb-3 text-xs font-semibold tracking-[0.12em] uppercase">
        School details
      </legend>
      <label className={labelClassName} htmlFor="school-name">
        School name
        <input
          id="school-name"
          name="name"
          required
          maxLength={120}
          autoComplete="organization"
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={inputClassName}
        />
        <FirstError errors={errors} field="name" />
      </label>
      <label className={labelClassName} htmlFor="school-email">
        School email
        <input
          id="school-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={inputClassName}
        />
        <FirstError errors={errors} field="email" />
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={labelClassName} htmlFor="school-phone">
          Phone
          <input
            id="school-phone"
            name="phone"
            type="tel"
            required
            maxLength={30}
            autoComplete="tel"
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            className={inputClassName}
          />
          <FirstError errors={errors} field="phone" />
        </label>
        <label className={labelClassName} htmlFor="school-status">
          Status
          <select id="school-status" name="status" defaultValue="active" className={inputClassName}>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </label>
      </div>
      <label className={labelClassName} htmlFor="school-address">
        Address
        <textarea
          id="school-address"
          name="address"
          required
          maxLength={240}
          rows={2}
          aria-describedby={errors.address ? 'address-error' : undefined}
          className={textAreaClassName}
        />
        <FirstError errors={errors} field="address" />
      </label>
    </fieldset>
  );
}
