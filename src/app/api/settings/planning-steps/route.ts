import { withAccess } from '@/server/middleware/withAccess';
import {
  getPlanningStepConfigs,
  createPlanningStepConfig,
  createPlanningStepSchema,
} from '@/server/actions/planningStepConfig';
import { logAudit } from '@/server/actions/teams';

export const GET = withAccess('settings:read', async () => {
  const items = await getPlanningStepConfigs();
  return Response.json({ data: items });
});

export const POST = withAccess('settings:manage', async (req, _ctx, session) => {
  const body = await req.json();
  const parsed = createPlanningStepSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 },
    );
  }

  try {
    const item = await createPlanningStepConfig(parsed.data);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'create',
      entityType: 'planning_step_config',
      entityId: item.id,
    });

    return Response.json({ data: item }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create planning step';
    return Response.json(
      { error: { code: 'CREATE_ERROR', message } },
      { status: 400 },
    );
  }
});
