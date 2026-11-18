import { getSessionToken, updateInitialPassword } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { errorResponse, parseJson, withAuth } from '@/lib/http';
import { changePasswordSchema } from '@/lib/schemas';

export const POST = withAuth(
  async (request, user) => {
    try {
      const { password } = await parseJson(request, changePasswordSchema);
      const sessionToken = await getSessionToken();
      if (!sessionToken) {
        throw new AppError('Your session has expired. Sign in again.', 401, 'unauthorized');
      }
      await updateInitialPassword(user, password, sessionToken);
      return Response.json({ success: true });
    } catch (error) {
      return errorResponse(error);
    }
  },
  { allowForcedPasswordChange: true }
);
