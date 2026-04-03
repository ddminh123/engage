import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { getVersionHistory, publishEntity } from '@/server/actions/entityVersion';
import { buildEntitySnapshot } from '@/server/actions/workpaperContent';

export const GET = withAccess(
  'engagement:read',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }, _session: Session) => {
    const { procedureId } = await context.params;
    try {
      const data = await getVersionHistory('procedure', procedureId);
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
    const { procedureId } = await context.params;
    try {
      const snapshot = await buildEntitySnapshot('procedure', procedureId);
      if (!snapshot) {
        return Response.json(
          { error: { code: 'NOT_FOUND', message: 'Procedure not found' } },
          { status: 404 },
        );
      }
      const version = await publishEntity(
        'procedure',
        procedureId,
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
