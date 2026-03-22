import { withAccess } from '@/server/middleware/withAccess';
import { updateExpertise, deleteExpertise, updateExpertiseSchema } from '@/server/actions/expertise';
import { logAudit } from '@/server/actions/teams';

export const PATCH = withAccess('settings:manage', async (req, ctx, session) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const parsed = updateExpertiseSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  try {
    const expertise = await updateExpertise(id, parsed.data);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'update',
      entityType: 'expertise',
      entityId: id,
    });

    return Response.json({ data: expertise });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update expertise';
    return Response.json(
      { error: { code: 'UPDATE_ERROR', message } },
      { status: 400 }
    );
  }
});

export const DELETE = withAccess('settings:manage', async (_req, ctx, session) => {
  const { id } = await ctx.params;

  try {
    await deleteExpertise(id);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'delete',
      entityType: 'expertise',
      entityId: id,
    });

    return Response.json({ data: { success: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete expertise';
    return Response.json(
      { error: { code: 'DELETE_ERROR', message } },
      { status: 400 }
    );
  }
});
