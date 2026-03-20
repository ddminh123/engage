"use client";

import { useParams } from "next/navigation";
import { DetailPageLayout } from "@/components/shared/DetailPageLayout";
import { UNIVERSE_LABELS } from "@/constants/labels";
import { PAGE_ROUTES } from "@/constants";
import {
  useEntity,
  useRiskAssessments,
} from "@/features/universe/hooks/useEntities";
import { RiskAssessmentContent } from "@/features/universe/components/RiskAssessmentContent";

const L = UNIVERSE_LABELS.entity;

export default function RiskAssessmentDetailPage() {
  const params = useParams<{ id: string; raId: string }>();
  const entityId = params.id;
  const raId = params.raId;

  const { data: entity, isLoading: entityLoading } = useEntity(
    entityId ?? null,
  );
  const { data: riskAssessments = [], isLoading: raLoading } =
    useRiskAssessments(entityId ?? null);

  const ra = riskAssessments.find((r) => r.id === raId);
  const isLoading = entityLoading || raLoading;

  return (
    <DetailPageLayout
      title={
        ra
          ? `Đánh giá rủi ro — ${new Date(ra.evaluationDate).toLocaleDateString("vi-VN")}`
          : isLoading
            ? "…"
            : "Không tìm thấy"
      }
      backHref={PAGE_ROUTES.ENTITY_DETAIL(entityId!)}
      backLabel={entity?.name ?? L.title}
      isLoading={isLoading}
    >
      {ra && <RiskAssessmentContent ra={ra} />}
    </DetailPageLayout>
  );
}
