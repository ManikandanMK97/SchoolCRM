import { SCHOOL_ADMIN } from '@/lib/constants';
import { errorResponse, withAuth } from '@/lib/http';
import { getSchoolDashboard } from '@/lib/schools';

export const GET = withAuth(
  async (_request, user) => {
    try {
      return Response.json({ school: await getSchoolDashboard(user) });
    } catch (error) {
      return errorResponse(error);
    }
  },
  { roles: [SCHOOL_ADMIN] }
);
