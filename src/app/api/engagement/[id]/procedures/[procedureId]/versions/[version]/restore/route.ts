import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { restoreProcedureVersion } from '@/server/actions/entityVersion';

export const POST = withAccess(
  'engagement:update',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { procedureId, version } = await context.params;
    try {
      const versionNum = parseInt(version, 10);
      if (isNaN(versionNum)) {
        return Response.json(
          { error: { code: 'INVALID_VERSION', message: 'Version must be a number' } },
          { status: 400 },
        );
      }
      const data = await restoreProcedureVersion(
        procedureId,
        versionNum,
        session.user.id,
        session.user.name,
      );
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json({ error: { code: 'RESTORE_ERROR', message } }, { status: 400 });
    }
  },
);
