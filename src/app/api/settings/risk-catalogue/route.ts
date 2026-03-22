import { withAccess } from '@/server/middleware/withAccess';
import { getRiskCatalogueItems, createRiskCatalogueItem, createRiskCatalogueSchema } from '@/server/actions/risk-catalogue';
import { logAudit } from '@/server/actions/teams';

export const GET = withAccess('settings:read', async (_req, _ctx, _session) => {
  const items = await getRiskCatalogueItems(true);
  return Response.json({ data: items });
});

export const POST = withAccess('settings:manage', async (req, _ctx, session) => {
  const body = await req.json();
  const parsed = createRiskCatalogueSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  try {
    const item = await createRiskCatalogueItem(parsed.data);

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      action: 'create',
      entityType: 'risk_catalogue_item',
      entityId: item.id,
    });

    return Response.json({ data: item }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create risk catalogue item';
    return Response.json(
      { error: { code: 'CREATE_ERROR', message } },
      { status: 400 }
    );
  }
});
