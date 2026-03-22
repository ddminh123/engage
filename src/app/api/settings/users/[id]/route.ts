import { withAccess } from '@/server/middleware/withAccess';
import { getUserById, updateUser, updateUserSchema } from '@/server/actions/user';
import { logAudit } from '@/server/actions/teams';

export const GET = withAccess('teams:read', async (_req, ctx, _session) => {
  const { id } = await ctx.params;
  const user = await getUserById(id);

  if (!user) {
    return Response.json(
      { error: { code: 'NOT_FOUND', message: 'User not found' } },
      { status: 404 }
    );
  }

  return Response.json({ data: user });
});

export const PATCH = withAccess('teams:update', async (req, ctx, session) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  try {
    const user = await updateUser(id, parsed.data);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'update',
      entityType: 'user',
      entityId: id,
    });

    return Response.json({ data: user });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update user';
    return Response.json(
      { error: { code: 'UPDATE_ERROR', message } },
      { status: 400 }
    );
  }
});
