import { withAccess } from '@/server/middleware/withAccess';
import {
  reorderPlanningSteps,
  reorderPlanningStepsSchema,
} from '@/server/actions/planningStepConfig';
import { logAudit } from '@/server/actions/teams';

export const POST = withAccess('settings:manage', async (req, _ctx, session) => {
  const body = await req.json();
  const parsed = reorderPlanningStepsSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 },
    );
  }

  try {
    await reorderPlanningSteps(parsed.data.orderedIds);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'update',
      entityType: 'planning_step_config',
      entityId: 'reorder',
    });

    return Response.json({ data: { success: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to reorder planning steps';
    return Response.json(
      { error: { code: 'REORDER_ERROR', message } },
      { status: 400 },
    );
  }
});
