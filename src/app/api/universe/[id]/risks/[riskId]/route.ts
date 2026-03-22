import { withAccess } from '@/server/middleware/withAccess';
import { updateEntityRisk, deleteEntityRisk, updateEntityRiskSchema } from '@/server/actions/entity-risk';
import { logAudit } from '@/server/actions/teams';

export const PATCH = withAccess('universe:update', async (req, ctx, session) => {
  const { riskId } = await ctx.params;
  const body = await req.json();
  const parsed = updateEntityRiskSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  try {
    const risk = await updateEntityRisk(riskId, parsed.data);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'update',
      entityType: 'entity_risk',
      entityId: riskId,
    });

    return Response.json({ data: risk });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update entity risk';
    return Response.json(
      { error: { code: 'UPDATE_ERROR', message } },
      { status: 400 }
    );
  }
});

export const DELETE = withAccess('universe:update', async (_req, ctx, session) => {
  const { riskId } = await ctx.params;

  try {
    await deleteEntityRisk(riskId);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'delete',
      entityType: 'entity_risk',
      entityId: riskId,
    });

    return Response.json({ data: { success: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete entity risk';
    return Response.json(
      { error: { code: 'DELETE_ERROR', message } },
      { status: 400 }
    );
  }
});
