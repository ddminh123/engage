import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { unsignSignoff } from '@/server/actions/approvalEngine';

export const POST = withAccess(
  'engagement:update',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { entityType, entityId } = await context.params;
    try {
      const body = await req.json();
      const { signoffType, signoffOrder } = body as {
        signoffType: string;
        signoffOrder: number;
      };

      if (!signoffType || !signoffOrder) {
        return Response.json(
          { error: { code: 'VALIDATION_ERROR', message: 'signoffType and signoffOrder are required' } },
          { status: 400 },
        );
      }

      await unsignSignoff({
        entityType,
        entityId,
        signoffType,
        signoffOrder,
        userId: session.user.id,
      });

      return Response.json({ data: { ok: true } });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json({ error: { code: 'UNSIGN_ERROR', message } }, { status: 400 });
    }
  },
);
