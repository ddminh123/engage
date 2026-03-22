import { withAccess } from '@/server/middleware/withAccess';
import { removeTeamMember, promoteToOwner, demoteToMember, logAudit } from '@/server/actions/teams';

export const PATCH = withAccess('teams:update', async (req, ctx, session) => {
  const params = await ctx.params;
  const teamId = params.id;
  const userId = params.userId;
  const body = await req.json();
  const { action } = body;

  try {
    if (action === 'promote') {
      await promoteToOwner(teamId, userId);
    } else if (action === 'demote') {
      await demoteToMember(teamId, userId);
    } else {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'action must be "promote" or "demote"' } },
        { status: 400 }
      );
    }

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'update',
      entityType: 'team_member',
      entityId: `${teamId}:${userId}`,
      changes: { role: { old: action === 'promote' ? 'member' : 'owner', new: action === 'promote' ? 'owner' : 'member' } },
    });

    return Response.json({ data: { success: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update member';
    return Response.json(
      { error: { code: 'MEMBER_ERROR', message } },
      { status: 400 }
    );
  }
});

export const DELETE = withAccess('teams:update', async (_req, ctx, session) => {
  const params = await ctx.params;
  const teamId = params.id;
  const userId = params.userId;

  try {
    await removeTeamMember(teamId, userId);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'delete',
      entityType: 'team_member',
      entityId: `${teamId}:${userId}`,
    });

    return Response.json({ data: { success: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to remove member';
    return Response.json(
      { error: { code: 'MEMBER_ERROR', message } },
      { status: 400 }
    );
  }
});
