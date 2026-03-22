import { withAccess } from '@/server/middleware/withAccess';
import {
  getEntityRisks,
  createEntityRisk,
  createEntityRiskSchema,
  copyFromCatalogue,
  copyFromCatalogueSchema,
} from '@/server/actions/entity-risk';
import { logAudit } from '@/server/actions/teams';

export const GET = withAccess('universe:read', async (_req, ctx, _session) => {
  const { id } = await ctx.params;
  const risks = await getEntityRisks(id);
  return Response.json({ data: risks });
});

export const POST = withAccess('universe:update', async (req, ctx, session) => {
  const { id: entityId } = await ctx.params;
  const body = await req.json();

  // Check if this is a "copy from catalogue" request
  if (body.catalogueItemIds) {
    const parsed = copyFromCatalogueSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      );
    }

    try {
      const risks = await copyFromCatalogue(entityId, parsed.data.catalogueItemIds);

      await logAudit({
        userId: session.user.id,
        userName: session.user.name,
        action: 'create',
        entityType: 'entity_risk',
        entityId,
      });

      return Response.json({ data: risks }, { status: 201 });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to copy risks from catalogue';
      return Response.json(
        { error: { code: 'CREATE_ERROR', message } },
        { status: 400 }
      );
    }
  }

  // Regular create
  const parsed = createEntityRiskSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  try {
    const risk = await createEntityRisk(entityId, parsed.data);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'create',
      entityType: 'entity_risk',
      entityId: risk.id,
    });

    return Response.json({ data: risk }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create entity risk';
    return Response.json(
      { error: { code: 'CREATE_ERROR', message } },
      { status: 400 }
    );
  }
});
