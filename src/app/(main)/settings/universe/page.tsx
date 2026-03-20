"use client";

import * as React from "react";
import { Layers, FolderTree, AlertTriangle, FileSearch } from "lucide-react";
import { SettingsCard } from "@/components/shared/SettingsCard";
import { SettingsSheet } from "@/components/shared/SettingsSheet";
import { RiskFactorList } from "@/features/universe/components/RiskFactorList";
import { AssessmentSourceList } from "@/features/universe/components/AssessmentSourceList";
import { EntityTypeList } from "@/features/settings/components/EntityTypeList";
import { AuditAreaList } from "@/features/settings/components/AuditAreaList";

type SheetType =
  | "entityType"
  | "auditArea"
  | "riskFactor"
  | "assessmentSource"
  | null;

export default function UniverseSettingsPage() {
  const [openSheet, setOpenSheet] = React.useState<SheetType>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Phạm vi kiểm toán</h1>
        <p className="mt-1 text-muted-foreground">
          Cấu hình danh mục loại đối tượng, lĩnh vực, yếu tố rủi ro và nguồn
          đánh giá.
        </p>
      </div>

      <div className="space-y-3">
        <SettingsCard
          icon={Layers}
          title="Loại đối tượng kiểm toán"
          description="Phân loại đối tượng kiểm toán theo bản chất (Quy trình, Hệ thống, Đơn vị...)"
          onClick={() => setOpenSheet("entityType")}
        />

        <SettingsCard
          icon={FolderTree}
          title="Lĩnh vực kiểm toán"
          description="Phân loại theo lĩnh vực nghiệp vụ (Tài chính, Vận hành, CNTT...)"
          onClick={() => setOpenSheet("auditArea")}
        />

        <SettingsCard
          icon={AlertTriangle}
          title="Yếu tố đánh giá rủi ro"
          description="Danh sách các yếu tố có thể chọn khi đánh giá rủi ro đối tượng kiểm toán"
          onClick={() => setOpenSheet("riskFactor")}
        />

        <SettingsCard
          icon={FileSearch}
          title="Nguồn đánh giá"
          description="Danh sách nguồn đánh giá rủi ro (Kiểm toán trước, Ý kiến BLĐ, Sự cố...)"
          onClick={() => setOpenSheet("assessmentSource")}
        />
      </div>

      <SettingsSheet
        open={openSheet === "entityType"}
        onOpenChange={(open) => !open && setOpenSheet(null)}
        title="Loại đối tượng kiểm toán"
        description="Phân loại đối tượng kiểm toán theo bản chất (Quy trình, Hệ thống, Đơn vị...)"
      >
        <EntityTypeList />
      </SettingsSheet>

      <SettingsSheet
        open={openSheet === "auditArea"}
        onOpenChange={(open) => !open && setOpenSheet(null)}
        title="Lĩnh vực kiểm toán"
        description="Phân loại theo lĩnh vực nghiệp vụ (Tài chính, Vận hành, CNTT...). Mỗi đối tượng có thể thuộc nhiều lĩnh vực."
      >
        <AuditAreaList />
      </SettingsSheet>

      <SettingsSheet
        open={openSheet === "riskFactor"}
        onOpenChange={(open) => !open && setOpenSheet(null)}
        title="Yếu tố đánh giá rủi ro"
        description="Danh sách các yếu tố có thể chọn khi đánh giá rủi ro đối tượng kiểm toán."
      >
        <RiskFactorList />
      </SettingsSheet>

      <SettingsSheet
        open={openSheet === "assessmentSource"}
        onOpenChange={(open) => !open && setOpenSheet(null)}
        title="Nguồn đánh giá"
        description="Danh sách nguồn đánh giá rủi ro có thể chọn khi đánh giá đối tượng kiểm toán."
      >
        <AssessmentSourceList />
      </SettingsSheet>
    </div>
  );
}
