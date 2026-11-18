import type { UserRole } from './constants';
import { getCurrentUser } from './auth';
import type { AuthenticatedUser } from './auth';
import { AppError } from './errors';
import { ZodError, type ZodType } from 'zod';

export type AuthOptions = {
  roles?: readonly UserRole[];
  allowForcedPasswordChange?: boolean;
};

type AuthenticatedHandler = (request: Request, user: AuthenticatedUser) => Promise<Response>;

export function withAuth(
  handler: AuthenticatedHandler,
  options: AuthOptions = {}
): (request: Request) => Promise<Response> {
  return async (request) => {
    try {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        assertSameOrigin(request);
      }

      const user = await getCurrentUser();
      if (!user) throw new AppError('Sign in to continue.', 401, 'unauthorized');
      if (user.mustChangePassword && !options.allowForcedPasswordChange) {
        throw new AppError('Change your temporary password before continuing.', 428, 'bad_request');
      }
      if (options.roles && !options.roles.includes(user.role)) {
        throw new AppError('You do not have access to this resource.', 403, 'forbidden');
      }

      return await handler(request, user);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

export function assertSameOrigin(request: Request): void {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') {
    throw new AppError('Cross-site request blocked.', 403, 'forbidden');
  }

  const origin = request.headers.get('origin');
  if (origin) {
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
    const host = forwardedHost ?? request.headers.get('host') ?? requestUrl.host;
    const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
    const protocol = forwardedProtocol ?? requestUrl.protocol.slice(0, -1);

    let originUrl: URL;
    try {
      originUrl = new URL(origin);
    } catch {
      throw new AppError('Cross-site request blocked.', 403, 'forbidden');
    }

    if (
      originUrl.host.toLowerCase() !== host.toLowerCase() ||
      originUrl.protocol !== `${protocol}:`
    ) {
      throw new AppError('Cross-site request blocked.', 403, 'forbidden');
    }
  }
}

export function parseInput<T>(schema: ZodType<T>, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of error.issues) {
        const field = issue.path.join('.') || 'form';
        fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message];
      }
      throw new AppError('Check the highlighted fields.', 400, 'bad_request', fieldErrors);
    }
    throw error;
  }
}

export async function parseJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  const length = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(length) && length > 16_384) {
    throw new AppError('The request is too large.', 413, 'payload_too_large');
  }

  const contentType = request.headers.get('content-type')?.split(';')[0]?.trim();
  if (contentType !== 'application/json') {
    throw new AppError('Send this request as JSON.', 415, 'bad_request');
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (Buffer.byteLength(text, 'utf8') > 16_384) {
      throw new AppError('The request is too large.', 413, 'payload_too_large');
    }
    body = JSON.parse(text);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('The request body must contain valid JSON.', 400, 'bad_request');
  }

  return parseInput(schema, body);
}

export function errorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
        },
      },
      { status: error.status }
    );
  }

  console.error('EduSphere API request failed.', {
    errorName: error instanceof Error ? error.name : 'UnknownError',
  });
  return Response.json(
    {
      error: {
        code: 'internal_error',
        message: 'Something went wrong. Try again.',
      },
    },
    { status: 500 }
  );
}
