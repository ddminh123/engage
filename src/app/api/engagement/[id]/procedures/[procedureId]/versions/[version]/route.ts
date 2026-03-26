import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { getVersion } from '@/server/actions/entityVersion';

export const GET = withAccess(
  'engagement:read',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const { procedureId, version } = await context.params;
    try {
      const versionNum = parseInt(version, 10);
      if (isNaN(versionNum)) {
        return Response.json(
          { error: { code: 'INVALID_VERSION', message: 'Version must be a number' } },
          { status: 400 },
        );
      }
      const data = await getVersion('procedure', procedureId, versionNum);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json({ error: { code: 'FETCH_ERROR', message } }, { status: 400 });
    }
  },
);
