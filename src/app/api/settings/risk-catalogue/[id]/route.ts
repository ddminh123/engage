import { withAccess } from '@/server/middleware/withAccess';
import { updateRiskCatalogueItem, deleteRiskCatalogueItem, updateRiskCatalogueSchema } from '@/server/actions/risk-catalogue';
import { logAudit } from '@/server/actions/teams';

export const PATCH = withAccess('settings:manage', async (req, ctx, session) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const parsed = updateRiskCatalogueSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  try {
    const item = await updateRiskCatalogueItem(id, parsed.data);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'update',
      entityType: 'risk_catalogue_item',
      entityId: id,
    });

    return Response.json({ data: item });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update risk catalogue item';
    return Response.json(
      { error: { code: 'UPDATE_ERROR', message } },
      { status: 400 }
    );
  }
});

export const DELETE = withAccess('settings:manage', async (_req, ctx, session) => {
  const { id } = await ctx.params;

  try {
    await deleteRiskCatalogueItem(id);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'delete',
      entityType: 'risk_catalogue_item',
      entityId: id,
    });

    return Response.json({ data: { success: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete risk catalogue item';
    return Response.json(
      { error: { code: 'DELETE_ERROR', message } },
      { status: 400 }
    );
  }
});
