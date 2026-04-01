import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { getEngagementSignoffs } from '@/server/actions/approvalEngine';

// GET /api/engagement/[id]/wp-signoffs — all sign-offs for the engagement
export const GET = withAccess(
  'engagement:read',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }, _session: Session) => {
    const { id: engagementId } = await context.params;

    try {
      const signoffs = await getEngagementSignoffs(engagementId);

      const data = signoffs.map((s) => ({
        id: s.id,
        engagementId: s.engagement_id,
        entityType: s.entity_type,
        entityId: s.entity_id,
        signoffType: s.signoff_type,
        signoffOrder: s.signoff_order,
        userId: s.user_id,
        signedAt: s.signed_at.toISOString(),
        version: s.version,
        transitionId: s.transition_id,
        invalidatedAt: s.invalidated_at?.toISOString() ?? null,
        invalidatedBy: s.invalidated_by,
        invalidationReason: s.invalidation_reason,
        comment: s.comment,
        user: {
          id: s.user.id,
          name: s.user.name,
          email: s.user.email,
          avatarUrl: s.user.avatar_url,
          title: s.user.title,
        },
      }));

      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json({ error: { code: 'FETCH_ERROR', message } }, { status: 500 });
    }
  },
);
