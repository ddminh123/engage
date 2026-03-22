import { withAccess } from '@/server/middleware/withAccess';
import { getUsers, createUser, createUserSchema } from '@/server/actions/user';
import { logAudit } from '@/server/actions/teams';

export const GET = withAccess('teams:read', async (req, _ctx, _session) => {
  const { searchParams } = new URL(req.url);
  const filters = {
    search: searchParams.get('search') || undefined,
    role: searchParams.get('role') || undefined,
    status: searchParams.get('status') || undefined,
    teamId: searchParams.get('teamId') || undefined,
  };

  const users = await getUsers(filters);
  return Response.json({ data: users });
});

export const POST = withAccess('teams:create', async (req, _ctx, session) => {
  const body = await req.json();
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  try {
    const user = await createUser(parsed.data);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'create',
      entityType: 'user',
      entityId: user.id,
    });

    return Response.json({ data: user }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create user';
    return Response.json(
      { error: { code: 'CREATE_ERROR', message } },
      { status: 400 }
    );
  }
});
