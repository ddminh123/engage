import { withAccess } from '@/server/middleware/withAccess';
import { getTeams, createTeam, createTeamSchema, logAudit } from '@/server/actions/teams';

export const GET = withAccess('teams:read', async (req, _ctx, _session) => {
  const { searchParams } = new URL(req.url);
  const filters = {
    search: searchParams.get('search') || undefined,
    status: searchParams.get('status') || undefined,
  };

  const teams = await getTeams(filters);
  return Response.json({ data: teams });
});

export const POST = withAccess('teams:create', async (req, _ctx, session) => {
  const body = await req.json();
  const parsed = createTeamSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  try {
    const team = await createTeam(parsed.data);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'create',
      entityType: 'team',
      entityId: team.id,
    });

    return Response.json({ data: team }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create team';
    return Response.json(
      { error: { code: 'CREATE_ERROR', message } },
      { status: 400 }
    );
  }
});
