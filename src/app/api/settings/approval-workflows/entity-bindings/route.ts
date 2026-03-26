import { withAccess } from '@/server/middleware/withAccess';
import { getEntityBindings, upsertEntityBinding, deleteEntityBinding } from '@/server/actions/approvalWorkflow';
import { logAudit } from '@/server/actions/teams';

export const GET = withAccess('settings:read', async () => {
  const data = await getEntityBindings();
  return Response.json({ data });
});

export const POST = withAccess('settings:manage', async (req, _ctx, session) => {
  try {
    const body = await req.json();
    const data = await upsertEntityBinding(body);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'update',
      entityType: 'approval_entity_binding',
      entityId: data.entityType,
    });

    return Response.json({ data });
  } catch (error) {
    const message = (error as Error).message;
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message } },
      { status: 400 },
    );
  }
});

export const DELETE = withAccess('settings:manage', async (req, _ctx, session) => {
  try {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType');
    if (!entityType) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'entityType is required' } },
        { status: 400 },
      );
    }

    await deleteEntityBinding(entityType);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'delete',
      entityType: 'approval_entity_binding',
      entityId: entityType,
    });

    return Response.json({ data: { success: true } });
  } catch (error) {
    const message = (error as Error).message;
    return Response.json(
      { error: { code: 'SERVER_ERROR', message } },
      { status: 500 },
    );
  }
});
