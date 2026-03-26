import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { prisma } from '@/lib/prisma';
import { publishEntity, buildProcedureSnapshot } from '@/server/actions/entityVersion';

export const POST = withAccess(
  'engagement:update',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { procedureId } = await context.params;
    try {
      const body = await req.json().catch(() => ({}));
      const comment = (body as Record<string, unknown>).comment as string | undefined;

      // 1. Load the current procedure
      const procedure = await prisma.engagementProcedure.findUnique({
        where: { id: procedureId },
      });

      if (!procedure) {
        return Response.json(
          { error: { code: 'NOT_FOUND', message: 'Procedure not found' } },
          { status: 404 },
        );
      }

      // 2. Build snapshot from current state
      const snapshot = buildProcedureSnapshot(procedure as unknown as Record<string, unknown>);

      // 3. Create version
      const version = await publishEntity(
        'procedure',
        procedureId,
        snapshot,
        session.user.id,
        session.user.name,
        comment,
      );

      // 4. Update procedure's version tracking fields
      await prisma.engagementProcedure.update({
        where: { id: procedureId },
        data: {
          current_version: version.version,
        },
      });

      return Response.json({ data: version });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json({ error: { code: 'PUBLISH_ERROR', message } }, { status: 400 });
    }
  },
);
