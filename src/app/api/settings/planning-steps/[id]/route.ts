import { withAccess } from '@/server/middleware/withAccess';
import {
  updatePlanningStepConfig,
  deletePlanningStepConfig,
  updatePlanningStepSchema,
} from '@/server/actions/planningStepConfig';
import { logAudit } from '@/server/actions/teams';

export const PATCH = withAccess('settings:manage', async (req, ctx, session) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const parsed = updatePlanningStepSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 },
    );
  }

  try {
    const item = await updatePlanningStepConfig(id, parsed.data);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'update',
      entityType: 'planning_step_config',
      entityId: id,
    });

    return Response.json({ data: item });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update planning step';
    return Response.json(
      { error: { code: 'UPDATE_ERROR', message } },
      { status: 400 },
    );
  }
});

export const DELETE = withAccess('settings:manage', async (_req, ctx, session) => {
  const { id } = await ctx.params;

  try {
    await deletePlanningStepConfig(id);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'delete',
      entityType: 'planning_step_config',
      entityId: id,
    });

    return Response.json({ data: { success: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete planning step';
    return Response.json(
      { error: { code: 'DELETE_ERROR', message } },
      { status: 400 },
    );
  }
});
