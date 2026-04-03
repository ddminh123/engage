import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { executeAutoTransition } from '@/server/actions/approvalEngine';

// POST /api/approval/[entityType]/[entityId]/auto-transition
// Body: { actionType: "start" }
export const POST = withAccess(
  'engagement:update',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { entityType, entityId } = await context.params;
    const body = await req.json();
    const actionType = body.actionType as string;
    const subType = (body.subType as string) ?? '';

    if (!actionType) {
      return Response.json(
        { error: { code: 'INVALID_INPUT', message: 'actionType is required' } },
        { status: 400 },
      );
    }

    try {
      const result = await executeAutoTransition(
        entityType,
        entityId,
        actionType,
        session.user.id,
        session.user.name,
        subType,
      );

      if (!result) {
        // No matching transition — not an error, just a no-op
        return Response.json({ data: null });
      }

      return Response.json({ data: result });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json({ error: { code: 'TRANSITION_ERROR', message } }, { status: 400 });
    }
  },
);
