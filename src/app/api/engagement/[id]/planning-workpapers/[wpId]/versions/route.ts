import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { getVersionHistory, publishEntity } from '@/server/actions/entityVersion';
import { buildEntitySnapshot } from '@/server/actions/workpaperContent';

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

export const POST = withAccess(
  'engagement:write',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { wpId } = await context.params;
    try {
      const snapshot = await buildEntitySnapshot('planning_workpaper', wpId);
      if (!snapshot) {
        return Response.json(
          { error: { code: 'NOT_FOUND', message: 'Planning workpaper not found' } },
          { status: 404 },
        );
      }
      const version = await publishEntity(
        'planning_workpaper',
        wpId,
        snapshot,
        session.user.id,
        session.user.name ?? '',
        { actionLabel: 'Lưu phiên bản', versionType: 'manual' },
      );
      return Response.json({ data: version });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json({ error: { code: 'SAVE_ERROR', message } }, { status: 400 });
    }
  },
);
