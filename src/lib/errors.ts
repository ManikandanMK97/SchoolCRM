export type ApiErrorCode =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'payload_too_large'
  | 'internal_error';

export class AppError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: ApiErrorCode,
    readonly fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function uniqueConflict(error: unknown): boolean {
  let current = error;
  const seen = new Set<object>();

  while (typeof current === 'object' && current !== null && !seen.has(current)) {
    seen.add(current);
    if ('code' in current && current.code === '23505') return true;
    current = 'cause' in current ? current.cause : undefined;
  }

  return false;
}
