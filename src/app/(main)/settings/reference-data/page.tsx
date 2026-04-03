"use client";

import * as React from "react";
import { Award, ShieldAlert, Layers, FolderTree, AlertTriangle, FileSearch } from "lucide-react";
import { SettingsCard } from "@/components/shared/SettingsCard";
import { SettingsSheet } from "@/components/shared/SettingsSheet";
import { ExpertiseList } from "@/features/teams/components/ExpertiseList";
import { RiskCatalogueList } from "@/features/universe/components/RiskCatalogueList";
import { EntityTypeList } from "@/features/settings/components/EntityTypeList";
import { AuditAreaList } from "@/features/settings/components/AuditAreaList";
import { RiskFactorList } from "@/features/universe/components/RiskFactorList";
import { AssessmentSourceList } from "@/features/universe/components/AssessmentSourceList";

type SheetType =
  | "expertise"
  | "riskCatalogue"
  | "entityType"
  | "auditArea"
  | "riskFactor"
  | "assessmentSource"
  | null;

export default function ReferenceDataPage() {
  const [openSheet, setOpenSheet] = React.useState<SheetType>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dữ liệu gốc</h1>
        <p className="mt-1 text-muted-foreground">
          Quản lý dữ liệu tham chiếu: chuyên môn, phạm vi kiểm toán, yếu tố rủi ro, v.v.
        </p>
      </div>

      {/* Phạm vi kiểm toán */}
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Phạm vi kiểm toán
        </h2>
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
      </div>

      {/* Dữ liệu chung */}
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Dữ liệu chung
        </h2>
        <div className="space-y-3">
          <SettingsCard
            icon={Award}
            title="Chuyên môn"
            description="Danh sách lĩnh vực chuyên môn có thể gán cho kiểm toán viên"
            onClick={() => setOpenSheet("expertise")}
          />

          <SettingsCard
            icon={ShieldAlert}
            title="Thư viện rủi ro"
            description="Danh mục rủi ro theo loại (vận hành, công nghệ, tín dụng...) và lĩnh vực (ESG, BCTC...)"
            onClick={() => setOpenSheet("riskCatalogue")}
          />
        </div>
      </div>

      {/* Sheets — Phạm vi kiểm toán */}
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

      {/* Sheets — Dữ liệu chung */}
      <SettingsSheet
        open={openSheet === "expertise"}
        onOpenChange={(open) => !open && setOpenSheet(null)}
        title="Chuyên môn"
        description="Danh sách lĩnh vực chuyên môn có thể gán cho kiểm toán viên."
      >
        <ExpertiseList />
      </SettingsSheet>

      <SettingsSheet
        open={openSheet === "riskCatalogue"}
        onOpenChange={(open) => !open && setOpenSheet(null)}
        title="Thư viện rủi ro"
        description="Danh mục rủi ro chung của tổ chức, phân loại theo loại và lĩnh vực. Có thể gán cho đối tượng kiểm toán."
      >
        <RiskCatalogueList />
      </SettingsSheet>
    </div>
  );
}
