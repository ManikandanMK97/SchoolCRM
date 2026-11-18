import { PLATFORM_SUPER_ADMIN } from '@/lib/constants';
import { createSchoolWithAdmin, listSchools } from '@/lib/schools';
import { errorResponse, parseInput, parseJson, withAuth } from '@/lib/http';
import { createSchoolSchema, schoolListQuerySchema } from '@/lib/schemas';

export const GET = withAuth(
  async (request) => {
    try {
      const url = new URL(request.url);
      const query = parseInput(schoolListQuerySchema, {
        q: url.searchParams.get('q') ?? '',
        status: url.searchParams.get('status') ?? undefined,
        sort: url.searchParams.get('sort') ?? 'created',
        page: url.searchParams.get('page') ?? '1',
      });
      return Response.json(await listSchools(query));
    } catch (error) {
      return errorResponse(error);
    }
  },
  { roles: [PLATFORM_SUPER_ADMIN] }
);

export const POST = withAuth(
  async (request) => {
    try {
      const input = await parseJson(request, createSchoolSchema);
      return Response.json(await createSchoolWithAdmin(input), { status: 201 });
    } catch (error) {
      return errorResponse(error);
    }
  },
  { roles: [PLATFORM_SUPER_ADMIN] }
);
