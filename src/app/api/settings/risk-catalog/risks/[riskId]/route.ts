import { NextRequest } from 'next/server';
import { withAccess } from '@/server/middleware/withAccess';
import { updateRiskCatalogItem, deleteRiskCatalogItem } from '@/server/actions/riskCatalog';

// PATCH /api/settings/risk-catalog/risks/[riskId]
export const PATCH = withAccess(
  'settings:manage',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const { riskId } = await context.params;
    const body = await req.json();

    try {
      const data = await updateRiskCatalogItem(riskId, body);
      return Response.json({ data });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update risk';

      if (message.includes('not found')) {
        return Response.json(
          { error: { code: 'NOT_FOUND', message } },
          { status: 404 },
        );
      }

      return Response.json(
        { error: { code: 'UPDATE_ERROR', message } },
        { status: 400 },
      );
    }
  },
);

// DELETE /api/settings/risk-catalog/risks/[riskId]
export const DELETE = withAccess(
  'settings:manage',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const { riskId } = await context.params;

    try {
      await deleteRiskCatalogItem(riskId);
      return Response.json({ data: { success: true } });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete risk';

      if (message.includes('not found')) {
        return Response.json(
          { error: { code: 'NOT_FOUND', message } },
          { status: 404 },
        );
      }

      return Response.json(
        { error: { code: 'DELETE_ERROR', message } },
        { status: 400 },
      );
    }
  },
);
