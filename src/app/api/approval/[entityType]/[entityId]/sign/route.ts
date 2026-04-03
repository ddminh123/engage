import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { manualSign } from '@/server/actions/approvalEngine';
import { resolveEngagementId } from '@/server/actions/resolveEngagement';

export const POST = withAccess(
  'engagement:update',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { entityType, entityId } = await context.params;
    try {
      const body = await req.json();
      const { signoffType, signoffOrder, subType } = body as {
        signoffType: string;
        signoffOrder: number;
        subType?: string;
      };

      if (!signoffType || !signoffOrder) {
        return Response.json(
          { error: { code: 'VALIDATION_ERROR', message: 'signoffType and signoffOrder are required' } },
          { status: 400 },
        );
      }

      const engagementId = await resolveEngagementId(entityType, entityId);
      if (!engagementId) {
        return Response.json(
          { error: { code: 'NOT_FOUND', message: 'Entity not found' } },
          { status: 404 },
        );
      }

      await manualSign({
        entityType,
        entityId,
        engagementId,
        signoffType,
        signoffOrder,
        userId: session.user.id,
        subType: subType ?? '',
      });

      return Response.json({ data: { ok: true } });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json({ error: { code: 'SIGN_ERROR', message } }, { status: 400 });
    }
  },
);
