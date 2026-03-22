"use client";

import * as React from "react";
import { Award, ShieldAlert } from "lucide-react";
import { SettingsCard } from "@/components/shared/SettingsCard";
import { SettingsSheet } from "@/components/shared/SettingsSheet";
import { ExpertiseList } from "@/features/teams/components/ExpertiseList";
import { RiskCatalogueList } from "@/features/universe/components/RiskCatalogueList";

type SheetType = "expertise" | "riskCatalogue" | null;

export default function ReferenceDataPage() {
  const [openSheet, setOpenSheet] = React.useState<SheetType>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dữ liệu gốc</h1>
        <p className="mt-1 text-muted-foreground">
          Quản lý dữ liệu tham chiếu: chuyên môn, chức danh, v.v.
        </p>
      </div>

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
