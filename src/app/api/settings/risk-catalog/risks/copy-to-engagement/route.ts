import { NextRequest } from 'next/server';
import { withAccess } from '@/server/middleware/withAccess';
import { copyRisksToEngagement } from '@/server/actions/riskCatalog';

// POST /api/settings/risk-catalog/risks/copy-to-engagement
export const POST = withAccess(
  'settings:read',
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const { catalogRiskIds, engagementId, rcmObjectiveId } = body;

      if (!Array.isArray(catalogRiskIds) || !engagementId) {
        return Response.json(
          { error: { code: 'VALIDATION_ERROR', message: 'catalogRiskIds and engagementId are required' } },
          { status: 400 },
        );
      }

      const data = await copyRisksToEngagement(catalogRiskIds, engagementId, rcmObjectiveId);
      return Response.json({ data }, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to copy risks';
      return Response.json(
        { error: { code: 'INTERNAL_ERROR', message } },
        { status: 500 },
      );
    }
  },
);
