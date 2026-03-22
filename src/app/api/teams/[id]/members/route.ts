import { withAccess } from '@/server/middleware/withAccess';
import { addTeamMember, moveTeamMember, logAudit } from '@/server/actions/teams';

export const POST = withAccess('teams:update', async (req, ctx, session) => {
  const { id: teamId } = await ctx.params;
  const body = await req.json();
  const { userId, role, fromTeamId } = body;

  if (!userId) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'userId is required' } },
      { status: 400 }
    );
  }

  try {
    // If fromTeamId is provided, this is a move operation
    if (fromTeamId) {
      await moveTeamMember(userId, fromTeamId, teamId);

      await logAudit({
        userId: session.user.id,
        userName: session.user.name,
        action: 'update',
        entityType: 'team_member',
        entityId: userId,
        changes: { team: { old: fromTeamId, new: teamId } },
      });

      return Response.json({ data: { success: true } });
    }

    // Otherwise, add new member
    const member = await addTeamMember(teamId, userId, role || 'member');

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'create',
      entityType: 'team_member',
      entityId: `${teamId}:${userId}`,
    });

    return Response.json({ data: member }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add member';
    return Response.json(
      { error: { code: 'MEMBER_ERROR', message } },
      { status: 400 }
    );
  }
});
