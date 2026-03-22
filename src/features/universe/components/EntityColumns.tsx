"use client";

import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/shared/DataTable";
import { RiskLevelBadge } from "@/components/shared/RiskLevelBadge";
import { ControlEffectivenessBadge } from "@/components/shared/ControlEffectivenessBadge";
import { UNIVERSE_LABELS } from "@/constants/labels";
import { OrgUnitCardPopover } from "@/features/settings/components/OrgUnitCard";
import type { AuditableEntity } from "../types";

const L = UNIVERSE_LABELS.entity;

export const defaultEntityColumnVisibility: VisibilityState = {
  code: false,
  // areas: false,
  auditSponsor: false,
  contactPoints: false,
  status: false,
  createdAt: false,
  updatedAt: false,
  description: false,
  auditCycle: false,
};

interface EntityColumnsOptions {
  onRateRisk?: (entity: AuditableEntity) => void;
  onViewRisk?: (entity: AuditableEntity) => void;
}

export function getEntityColumns(
  options: EntityColumnsOptions = {},
): ColumnDef<AuditableEntity>[] {
  const { onRateRisk, onViewRisk } = options;

  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.name} />
      ),
      cell: ({ row }) => {
        const entity = row.original;
        return (
          <div className="leading-tight">
            <div className="font-medium">{entity.name}</div>
            {entity.code && (
              <div className="text-xs text-muted-foreground">{entity.code}</div>
            )}
          </div>
        );
      },
      meta: { label: L.field.name },
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.code} />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.getValue("code") || (
            <span className="text-muted-foreground">—</span>
          )}
        </span>
      ),
      meta: { label: L.field.code },
    },
    {
      id: "entityType",
      accessorFn: (row) => row.entityType?.name ?? null,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.entityType} />
      ),
      cell: ({ row }) => {
        const entityType = row.original.entityType;
        if (!entityType)
          return <span className="text-muted-foreground">—</span>;
        return <span className="text-sm">{entityType.name}</span>;
      },
      filterFn: (row, _id, value) => {
        const typeId = row.original.entityTypeId;
        return typeId ? value.includes(typeId) : false;
      },
      meta: { label: L.field.entityType },
    },
    {
      id: "areas",
      accessorFn: (row) => row.areas.map((a) => a.name).join(", "),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.area} />
      ),
      cell: ({ row }) => {
        const areas = row.original.areas;
        if (!areas || areas.length === 0)
          return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {areas.map((a) => (
              <Badge
                key={a.id}
                variant="secondary"
                className="text-xs font-normal px-1.5 py-0"
              >
                {a.name}
              </Badge>
            ))}
          </div>
        );
      },
      filterFn: (row, _id, value) => {
        const areaIds = row.original.areas.map((a) => a.id);
        return value.some((v: string) => areaIds.includes(v));
      },
      meta: { label: L.field.area },
    },
    {
      id: "ownerUnits",
      accessorFn: (row) => row.ownerUnits.map((u) => u.name).join(", "),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.ownerUnit} />
      ),
      cell: ({ row }) => {
        const units = row.original.ownerUnits;
        if (!units || units.length === 0)
          return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {units.map((u) => (
              <Badge
                key={u.id}
                variant="secondary"
                className="text-xs font-normal px-1.5 py-0"
              >
                <OrgUnitCardPopover id={u.id}>
                  <Building2 className="inline h-3 w-3 mr-1" />
                  {u.name}
                </OrgUnitCardPopover>
              </Badge>
            ))}
          </div>
        );
      },
      meta: { label: L.field.ownerUnit },
    },
    {
      id: "latestInherentLevel",
      accessorFn: (row) => row.latestInherentLevel,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.inherentLevel} />
      ),
      cell: ({ row }) => {
        const level = row.original.latestInherentLevel;
        if (!level) {
          return onRateRisk ? (
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onRateRisk(row.original);
              }}
            >
              {L.action.rateRisk}
            </Button>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        }
        const label = L.riskLevel[level as keyof typeof L.riskLevel] ?? level;
        return onViewRisk ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewRisk(row.original);
            }}
          >
            <RiskLevelBadge
              level={level}
              label={label}
              className="hover:opacity-80 cursor-pointer"
            />
          </button>
        ) : (
          <RiskLevelBadge level={level} label={label} />
        );
      },
      filterFn: (row, _id, value) =>
        value.includes(row.original.latestInherentLevel),
      meta: { label: L.field.inherentLevel },
    },
    {
      id: "latestControlEffectiveness",
      accessorFn: (row) => row.latestControlEffectiveness,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={L.field.controlEffectiveness}
        />
      ),
      cell: ({ row }) => {
        const ce = row.original.latestControlEffectiveness;
        if (!ce) return <span className="text-muted-foreground">—</span>;
        const label =
          L.controlEffectiveness[ce as keyof typeof L.controlEffectiveness] ??
          ce;
        return onViewRisk ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewRisk(row.original);
            }}
          >
            <ControlEffectivenessBadge
              value={ce}
              label={label}
              className="hover:opacity-80 cursor-pointer"
            />
          </button>
        ) : (
          <ControlEffectivenessBadge value={ce} label={label} />
        );
      },
      meta: { label: L.field.controlEffectiveness },
    },
    {
      id: "latestResidualLevel",
      accessorFn: (row) => row.latestResidualLevel,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.residualRisk} />
      ),
      cell: ({ row }) => {
        const level = row.original.latestResidualLevel;
        if (!level) return <span className="text-muted-foreground">—</span>;
        const label = L.riskLevel[level as keyof typeof L.riskLevel] ?? level;
        return onViewRisk ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewRisk(row.original);
            }}
            className="cursor-pointer"
          >
            <RiskLevelBadge
              level={level}
              label={label}
              className="hover:opacity-80 cursor-pointer"
            />
          </button>
        ) : (
          <RiskLevelBadge level={level} label={label} />
        );
      },
      filterFn: (row, _id, value) =>
        value.includes(row.original.latestResidualLevel),
      meta: { label: L.field.residualRisk },
    },
    {
      accessorKey: "auditCycle",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.auditCycle} />
      ),
      cell: ({ row }) => {
        const cycle = row.getValue("auditCycle") as string | null;
        if (!cycle) return <span className="text-muted-foreground">—</span>;
        const label = L.auditCycle[cycle as keyof typeof L.auditCycle] ?? cycle;
        return <span className="text-sm">{label}</span>;
      },
      meta: { label: L.field.auditCycle },
    },
    {
      accessorKey: "lastAuditedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.lastAuditedAt} />
      ),
      cell: ({ row }) => {
        const date = row.getValue("lastAuditedAt") as string | null;
        if (!date) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString("vi-VN")}
          </span>
        );
      },
      meta: { label: L.field.lastAuditedAt },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.status} />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const label = L.status[status as keyof typeof L.status] ?? status;
        const variant =
          status === "active"
            ? "default"
            : status === "archived"
              ? "outline"
              : "secondary";
        return <Badge variant={variant}>{label}</Badge>;
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
      meta: { label: L.field.status },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.updatedAt} />
      ),
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as string;
        if (!date) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString("vi-VN")}
          </span>
        );
      },
      meta: { label: L.field.updatedAt },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.createdAt} />
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        if (!date) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString("vi-VN")}
          </span>
        );
      },
      meta: { label: L.field.createdAt },
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.description} />
      ),
      cell: ({ row }) => {
        const desc = row.getValue("description") as string | null;
        if (!desc) return <span className="text-muted-foreground">—</span>;
        return <span className="text-sm line-clamp-2">{desc}</span>;
      },
      meta: { label: L.field.description },
    },
    {
      id: "auditSponsor",
      accessorFn: (row) =>
        row.auditSponsors.map((c) => c.name).join(", ") || null,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.auditSponsor} />
      ),
      cell: ({ row }) => {
        const sponsors = row.original.auditSponsors;
        if (!sponsors || sponsors.length === 0)
          return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-col gap-0.5">
            {sponsors.map((c) => (
              <div key={c.id} className="text-sm leading-tight">
                <div>{c.name}</div>
                {c.position && (
                  <div className="text-xs text-muted-foreground">
                    {c.position}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      },
      meta: { label: L.field.auditSponsor },
    },
    {
      id: "contactPoints",
      accessorFn: (row) =>
        row.contactPoints.map((c) => c.name).join(", ") || null,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={L.field.contactPoint} />
      ),
      cell: ({ row }) => {
        const pts = row.original.contactPoints;
        if (!pts || pts.length === 0)
          return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-col gap-0.5">
            {pts.map((c) => (
              <div key={c.id} className="text-sm leading-tight">
                <div>{c.name}</div>
                {c.position && (
                  <div className="text-xs text-muted-foreground">
                    {c.position}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      },
      meta: { label: L.field.contactPoint },
    },
  ];
}
