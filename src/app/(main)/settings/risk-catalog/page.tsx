import { RiskCatalogManager } from "@/features/settings/components/RiskCatalogManager";
import { SETTINGS_LABELS } from "@/constants/labels";

const L = SETTINGS_LABELS.riskCatalog;

export default function RiskCatalogPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">{L.title}</h1>
      <p className="mt-2 text-muted-foreground">{L.description}</p>
      <div className="mt-6">
        <RiskCatalogManager />
      </div>
    </div>
  );
}
