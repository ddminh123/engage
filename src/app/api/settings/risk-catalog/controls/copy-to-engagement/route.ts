import { NextRequest } from 'next/server';
import { withAccess } from '@/server/middleware/withAccess';
import { copyControlsToEngagement } from '@/server/actions/riskCatalog';

// POST /api/settings/risk-catalog/controls/copy-to-engagement
export const POST = withAccess(
  'settings:read',
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const { catalogControlIds, engagementId, linkToRiskId } = body;

      if (!Array.isArray(catalogControlIds) || !engagementId) {
        return Response.json(
          { error: { code: 'VALIDATION_ERROR', message: 'catalogControlIds and engagementId are required' } },
          { status: 400 },
        );
      }

      const data = await copyControlsToEngagement(catalogControlIds, engagementId, linkToRiskId);
      return Response.json({ data }, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to copy controls';
      return Response.json(
        { error: { code: 'INTERNAL_ERROR', message } },
        { status: 500 },
      );
    }
  },
);
