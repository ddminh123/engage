import { withAccess } from '@/server/middleware/withAccess';
import { unlockUser } from '@/server/actions/user';
import { logAudit } from '@/server/actions/teams';

export const POST = withAccess('teams:manage', async (_req, ctx, session) => {
  const { id } = await ctx.params;

  try {
    await unlockUser(id);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'update',
      entityType: 'user',
      entityId: id,
      changes: { status: { old: 'locked', new: 'active' } },
    });

    return Response.json({ data: { success: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to unlock user';
    return Response.json(
      { error: { code: 'UNLOCK_ERROR', message } },
      { status: 400 }
    );
  }
});
