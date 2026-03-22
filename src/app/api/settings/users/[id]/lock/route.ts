import { withAccess } from '@/server/middleware/withAccess';
import { lockUser } from '@/server/actions/user';
import { logAudit } from '@/server/actions/teams';

export const POST = withAccess('teams:manage', async (_req, ctx, session) => {
  const { id } = await ctx.params;

  try {
    await lockUser(id);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'update',
      entityType: 'user',
      entityId: id,
      changes: { status: { old: 'active', new: 'locked' } },
    });

    return Response.json({ data: { success: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to lock user';
    return Response.json(
      { error: { code: 'LOCK_ERROR', message } },
      { status: 400 }
    );
  }
});
