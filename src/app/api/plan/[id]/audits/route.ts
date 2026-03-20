import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { addPlannedAudit } from '@/server/actions/plan';

export const POST = withAccess(
  'plan:update',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { id } = await context.params;
    try {
      const body = await req.json();
      const data = await addPlannedAudit(id, body, session.user.id, session.user.name);
      return Response.json({ data }, { status: 201 });
    } catch (error) {
      const message = (error as Error).message;
      if (message === 'Plan not found') {
        return Response.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });
      }
      const status = message.includes('Unique constraint') ? 409 : 400;
      return Response.json(
        { error: { code: status === 409 ? 'DUPLICATE' : 'VALIDATION_ERROR', message } },
        { status },
      );
    }
  },
);
