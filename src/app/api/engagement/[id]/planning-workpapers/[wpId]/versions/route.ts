import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { getVersionHistory } from '@/server/actions/entityVersion';

export const GET = withAccess(
  'engagement:read',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }, _session: Session) => {
    const { wpId } = await context.params;
    try {
      const data = await getVersionHistory('planning_workpaper', wpId);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json({ error: { code: 'FETCH_ERROR', message } }, { status: 400 });
    }
  },
);
