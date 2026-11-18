import { cookies } from 'next/headers';
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from '@/lib/constants';
import { authenticateUser } from '@/lib/auth';
import { errorResponse, assertSameOrigin, parseJson } from '@/lib/http';
import { loginSchema } from '@/lib/schemas';

export async function POST(request: Request): Promise<Response> {
  try {
    assertSameOrigin(request);
    const input = await parseJson(request, loginSchema);
    const result = await authenticateUser(input);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return Response.json({
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        mustChangePassword: result.user.mustChangePassword,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
