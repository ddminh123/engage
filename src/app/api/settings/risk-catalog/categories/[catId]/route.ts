import { NextRequest } from 'next/server';
import { withAccess } from '@/server/middleware/withAccess';
import { updateRiskCatalogCategory, deleteRiskCatalogCategory } from '@/server/actions/riskCatalog';

// PATCH /api/settings/risk-catalog/categories/[catId]
export const PATCH = withAccess(
  'settings:manage',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const { catId } = await context.params;
    const body = await req.json();

    try {
      const data = await updateRiskCatalogCategory(catId, body);
      return Response.json({ data });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update category';

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

// DELETE /api/settings/risk-catalog/categories/[catId]
export const DELETE = withAccess(
  'settings:manage',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const { catId } = await context.params;

    try {
      await deleteRiskCatalogCategory(catId);
      return Response.json({ data: { success: true } });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete category';

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
