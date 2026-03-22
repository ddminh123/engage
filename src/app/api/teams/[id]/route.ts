import { withAccess } from '@/server/middleware/withAccess';
import { getTeamById, updateTeam, deleteTeam, updateTeamSchema, logAudit } from '@/server/actions/teams';

export const GET = withAccess('teams:read', async (_req, ctx, _session) => {
  const { id } = await ctx.params;
  const team = await getTeamById(id);

  if (!team) {
    return Response.json(
      { error: { code: 'NOT_FOUND', message: 'Team not found' } },
      { status: 404 }
    );
  }

  return Response.json({ data: team });
});

export const PATCH = withAccess('teams:update', async (req, ctx, session) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const parsed = updateTeamSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  try {
    const team = await updateTeam(id, parsed.data);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'update',
      entityType: 'team',
      entityId: id,
    });

    return Response.json({ data: team });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update team';
    return Response.json(
      { error: { code: 'UPDATE_ERROR', message } },
      { status: 400 }
    );
  }
});

export const DELETE = withAccess('teams:delete', async (_req, ctx, session) => {
  const { id } = await ctx.params;

  try {
    await deleteTeam(id);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'delete',
      entityType: 'team',
      entityId: id,
    });

    return Response.json({ data: { success: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete team';
    return Response.json(
      { error: { code: 'DELETE_ERROR', message } },
      { status: 400 }
    );
  }
});
