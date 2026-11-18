import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '@/lib/constants';
import { revokeSession } from '@/lib/auth';
import { assertSameOrigin, errorResponse } from '@/lib/http';

export async function POST(request: Request): Promise<Response> {
  try {
    assertSameOrigin(request);
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    await revokeSession(token);
    cookieStore.delete(SESSION_COOKIE);
    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
