"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Star, Library, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EntityRiskForm } from "./EntityRiskForm";
import { RISK_TYPE_LABELS, RISK_DOMAIN_LABELS } from "./RiskCatalogueForm";
import {
  useEntityRisks,
  useDeleteEntityRisk,
  useCopyRisksFromCatalogue,
  useUpdateEntityRisk,
} from "../hooks/useEntityRisks";
import { useRiskCatalogueItems } from "../hooks/useRiskCatalogue";
import type { EntityRisk } from "../types";

// ── Copy from Catalogue — Command picker ──

function CopyFromCatalogueCommand({
  entityId,
  existingCatalogueIds,
}: {
  entityId: string;
  existingCatalogueIds: Set<string>;
}) {
  const { data: catalogueItems = [] } = useRiskCatalogueItems(false);
  const copyMutation = useCopyRisksFromCatalogue();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [open, setOpen] = React.useState(false);

  const available = catalogueItems.filter(
    (item) => !existingCatalogueIds.has(item.id),
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = async () => {
    if (selected.size === 0) return;
    try {
      await copyMutation.mutateAsync({
        entityId,
        catalogueItemIds: Array.from(selected),
      });
      setSelected(new Set());
      setOpen(false);
    } catch {
      // handled by mutation
    }
  };

  const grouped = React.useMemo(() => {
    const map = new Map<string, typeof available>();
    for (const item of available) {
      const list = map.get(item.riskType) ?? [];
      list.push(item);
      map.set(item.riskType, list);
    }
    return map;
  }, [available]);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setSelected(new Set());
      }}
    >
      <PopoverTrigger className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium h-8 rounded-md px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
        <Library className="h-4 w-4" />
        Thư viện
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Tìm rủi ro..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy rủi ro phù hợp.</CommandEmpty>
            {Array.from(grouped.entries()).map(([type, items]) => (
              <CommandGroup key={type} heading={RISK_TYPE_LABELS[type] ?? type}>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.name} ${item.code ?? ""}`}
                    onSelect={() => toggle(item.id)}
                    data-checked={selected.has(item.id) || undefined}
                  >
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.code && (
                      <span className="text-xs text-muted-foreground">
                        {item.code}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
          <div className="border-t p-1.5">
            <Button
              size="sm"
              className="w-full h-8"
              disabled={selected.size === 0 || copyMutation.isPending}
              onClick={handleConfirm}
            >
              Thêm{selected.size > 0 ? ` (${selected.size})` : " vào danh sách"}
            </Button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ── Risk Row ──

function RiskRow({
  risk,
  entityId,
  onEdit,
  onDelete,
}: {
  risk: EntityRisk;
  entityId: string;
  onEdit: (r: EntityRisk) => void;
  onDelete: (r: EntityRisk) => void;
}) {
  const updateMutation = useUpdateEntityRisk();

  const togglePrimary = () => {
    updateMutation.mutate({
      entityId,
      riskId: risk.id,
      data: { isPrimary: !risk.isPrimary },
    });
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3 group">
      <button
        type="button"
        onClick={togglePrimary}
        className="mt-0.5 shrink-0"
        title={
          risk.isPrimary ? "Bỏ đánh dấu rủi ro chính" : "Đánh dấu rủi ro chính"
        }
      >
        <Star
          className={`h-4 w-4 ${
            risk.isPrimary
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/40 hover:text-amber-400"
          }`}
        />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{risk.name}</span>
          {risk.code && (
            <span className="text-xs text-muted-foreground">({risk.code})</span>
          )}
          {risk.catalogueItem && (
            <Badge variant="outline" className="text-[10px] h-4 px-1">
              Thư viện
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
            {RISK_TYPE_LABELS[risk.riskType] ?? risk.riskType}
          </Badge>
          {risk.riskDomain && (
            <Badge variant="outline" className="text-[10px] h-4 px-1.5">
              {RISK_DOMAIN_LABELS[risk.riskDomain] ?? risk.riskDomain}
            </Badge>
          )}
        </div>
        {risk.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {risk.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button variant="ghost" size="icon-sm" onClick={() => onEdit(risk)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(risk)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── Main Panel ──

interface EntityRiskPanelProps {
  entityId: string | null;
}

export function EntityRiskPanel({ entityId }: EntityRiskPanelProps) {
  const { data: risks = [], isLoading } = useEntityRisks(entityId);
  const deleteMutation = useDeleteEntityRisk();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EntityRisk | null>(null);
  const [deleting, setDeleting] = React.useState<EntityRisk | null>(null);

  const existingCatalogueIds = React.useMemo(
    () =>
      new Set(
        risks.filter((r) => r.catalogueItemId).map((r) => r.catalogueItemId!),
      ),
    [risks],
  );

  const primaryRisks = risks.filter((r) => r.isPrimary);
  const otherRisks = risks.filter((r) => !r.isPrimary);

  const handleEdit = (risk: EntityRisk) => {
    setEditing(risk);
    setFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleting || !entityId) return;
    await deleteMutation.mutateAsync({ entityId, riskId: deleting.id });
    setDeleting(null);
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  if (!entityId) return null;

  return (
    <div className="space-y-3">
      {/* Header — action buttons only visible when risks exist */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold uppercase tracking-wide">
            Rủi ro của đối tượng
          </h3>
          {risks.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {risks.length}
            </Badge>
          )}
        </div>
        {!isLoading && risks.length > 0 && (
          <div className="flex items-center gap-2">
            <CopyFromCatalogueCommand
              entityId={entityId}
              existingCatalogueIds={existingCatalogueIds}
            />
            <Button size="sm" className="h-8" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              Tạo mới
            </Button>
          </div>
        )}
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : risks.length === 0 ? (
        /* Empty state — buttons live here */
        <div className="rounded-lg border border-dashed p-6 flex flex-col items-center gap-4 text-center">
          <div>
            <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              Chưa có rủi ro nào được gán cho đối tượng này.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CopyFromCatalogueCommand
              entityId={entityId}
              existingCatalogueIds={existingCatalogueIds}
            />
            <Button size="sm" className="h-8" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              Tạo mới
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {primaryRisks.length > 0 && (
            <>
              <p className="text-xs font-medium text-muted-foreground">
                Rủi ro chính ({primaryRisks.length})
              </p>
              {primaryRisks.map((risk) => (
                <RiskRow
                  key={risk.id}
                  risk={risk}
                  entityId={entityId}
                  onEdit={handleEdit}
                  onDelete={setDeleting}
                />
              ))}
            </>
          )}
          {otherRisks.length > 0 && (
            <>
              {primaryRisks.length > 0 && (
                <p className="text-xs font-medium text-muted-foreground pt-2">
                  Rủi ro khác ({otherRisks.length})
                </p>
              )}
              {otherRisks.map((risk) => (
                <RiskRow
                  key={risk.id}
                  risk={risk}
                  entityId={entityId}
                  onEdit={handleEdit}
                  onDelete={setDeleting}
                />
              ))}
            </>
          )}
        </div>
      )}

      <EntityRiskForm
        entityId={entityId}
        open={formOpen}
        onOpenChange={(open: boolean) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        initialData={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open: boolean) => !open && setDeleting(null)}
        title="Xóa rủi ro"
        description={`Bạn có chắc muốn xóa "${deleting?.name}" khỏi đối tượng này?`}
        confirmLabel="Xóa"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
