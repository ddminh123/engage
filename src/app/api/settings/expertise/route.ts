import { withAccess } from '@/server/middleware/withAccess';
import { getExpertises, createExpertise, createExpertiseSchema } from '@/server/actions/expertise';
import { logAudit } from '@/server/actions/teams';

export const GET = withAccess('settings:read', async (_req, _ctx, _session) => {
  const expertises = await getExpertises(true);
  return Response.json({ data: expertises });
});

export const POST = withAccess('settings:manage', async (req, _ctx, session) => {
  const body = await req.json();
  const parsed = createExpertiseSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  try {
    const expertise = await createExpertise(parsed.data);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'create',
      entityType: 'expertise',
      entityId: expertise.id,
    });

    return Response.json({ data: expertise }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create expertise';
    return Response.json(
      { error: { code: 'CREATE_ERROR', message } },
      { status: 400 }
    );
  }
});
