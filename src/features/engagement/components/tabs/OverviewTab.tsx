"use client";

import * as React from "react";
import { Building2, User, Calendar, Flag, AlertTriangle, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrgUnitCardPopover } from "@/features/settings/components/OrgUnitCard";
import { ContactCardPopoverById } from "@/features/settings/components/ContactCard";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import type { EngagementDetail } from "../../types";

const L = ENGAGEMENT_LABELS.engagement;
const LP = ENGAGEMENT_LABELS.planning;

interface OverviewTabProps {
  engagement: EngagementDetail;
}

export function OverviewTab({ engagement }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Main info card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Thông tin chung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            {/* Entity */}
            <InfoField label={L.field.entity} icon={<Building2 className="h-4 w-4" />}>
              <span className="font-medium">
                {engagement.entity?.name ?? "—"}
                {engagement.entity?.entityType && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({engagement.entity.entityType.name})
                  </span>
                )}
              </span>
            </InfoField>

            {/* Schedule */}
            <InfoField label={L.field.schedule} icon={<Calendar className="h-4 w-4" />}>
              <span className="font-medium">
                {new Date(engagement.startDate).toLocaleDateString("vi-VN")} —{" "}
                {new Date(engagement.endDate).toLocaleDateString("vi-VN")}
              </span>
            </InfoField>

            {/* Priority */}
            {engagement.priority && (
              <InfoField label={L.field.priority} icon={<Flag className="h-4 w-4" />}>
                <span className="font-medium">
                  {L.priority[engagement.priority] ?? engagement.priority}
                </span>
              </InfoField>
            )}

            {/* Inherent Risk */}
            {engagement.entity?.inherentRiskLevel && (
              <InfoField label="Rủi ro vốn có" icon={<AlertTriangle className="h-4 w-4" />}>
                <span className="font-medium">
                  {engagement.entity.inherentRiskLevel}
                </span>
              </InfoField>
            )}

            {/* Risk Level */}
            {engagement.entity?.riskLevel && (
              <InfoField label="Mức rủi ro tổng hợp" icon={<AlertTriangle className="h-4 w-4" />}>
                <span className="font-medium">{engagement.entity.riskLevel}</span>
              </InfoField>
            )}

            {/* Linked plan */}
            {engagement.plannedAudit?.plan && (
              <InfoField label={L.field.linkedPlan} icon={<Link2 className="h-4 w-4" />}>
                <span className="font-medium">
                  {engagement.plannedAudit.plan.title}
                </span>
              </InfoField>
            )}

            {/* Areas */}
            <InfoField label={LP.areas}>
              <div className="flex flex-wrap gap-1.5">
                {engagement.entity?.areas && engagement.entity.areas.length > 0 ? (
                  engagement.entity.areas.map((a) => (
                    <Badge key={a.id} variant="secondary">
                      {a.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">{LP.noAreas}</span>
                )}
              </div>
            </InfoField>

            {/* Estimated days */}
            {engagement.estimatedDays != null && (
              <InfoField label={L.field.estimatedDays}>
                <span className="font-medium">{engagement.estimatedDays} ngày</span>
              </InfoField>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Organization info card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Đơn vị & Liên hệ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            {/* Owner units */}
            <InfoField label="Đơn vị chủ quản">
              <div className="flex flex-wrap gap-1.5">
                {engagement.ownerUnits.length > 0 ? (
                  engagement.ownerUnits.map((u) => (
                    <Badge
                      key={u.id}
                      variant="secondary"
                      className="text-xs font-normal"
                    >
                      <OrgUnitCardPopover id={u.id}>
                        <Building2 className="inline h-3 w-3 mr-1" />
                        {u.name}
                      </OrgUnitCardPopover>
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
            </InfoField>

            {/* Participating units */}
            <InfoField label="Đơn vị phối hợp">
              <div className="flex flex-wrap gap-1.5">
                {engagement.participatingUnits.length > 0 ? (
                  engagement.participatingUnits.map((u) => (
                    <Badge
                      key={u.id}
                      variant="secondary"
                      className="text-xs font-normal"
                    >
                      <OrgUnitCardPopover id={u.id}>
                        <Building2 className="inline h-3 w-3 mr-1" />
                        {u.name}
                      </OrgUnitCardPopover>
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
            </InfoField>

            {/* Auditee reps */}
            <InfoField label="Đại diện đơn vị kiểm toán">
              <div className="flex flex-wrap gap-1.5">
                {engagement.auditeeReps.length > 0 ? (
                  engagement.auditeeReps.map((c) => (
                    <Badge
                      key={c.id}
                      variant="secondary"
                      className="text-xs font-normal"
                    >
                      <ContactCardPopoverById id={c.id}>
                        <User className="inline h-3 w-3 mr-1" />
                        {c.name}
                        {c.position && ` · ${c.position}`}
                      </ContactCardPopoverById>
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
            </InfoField>

            {/* Contact points */}
            <InfoField label="Đầu mối liên hệ">
              <div className="flex flex-wrap gap-1.5">
                {engagement.contactPoints.length > 0 ? (
                  engagement.contactPoints.map((c) => (
                    <Badge
                      key={c.id}
                      variant="secondary"
                      className="text-xs font-normal"
                    >
                      <ContactCardPopoverById id={c.id}>
                        <User className="inline h-3 w-3 mr-1" />
                        {c.name}
                        {c.position && ` · ${c.position}`}
                      </ContactCardPopoverById>
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
            </InfoField>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoField({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}
