"use client";

import * as React from "react";
import { useState } from "react";
import { BarChart2, CalendarPlus, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { UNIVERSE_LABELS } from "@/constants/labels";
import { useEntities } from "../hooks/useEntities";
import {
  getEntityColumns,
  defaultEntityColumnVisibility,
} from "./EntityColumns";
import type { AuditableEntity } from "../types";

const L = UNIVERSE_LABELS.entity;

interface EntityListProps {
  onSelect: (entity: AuditableEntity) => void;
  onCreate: () => void;
  onEdit: (entity: AuditableEntity) => void;
  onDelete?: (entity: AuditableEntity) => void;
  onRateRisk?: (entity: AuditableEntity) => void;
  onViewRisk?: (entity: AuditableEntity) => void;
  onAddToPlan?: (entity: AuditableEntity) => void;
}

export function EntityList({
  onSelect,
  onCreate,
  onEdit,
  onDelete,
  onRateRisk,
  onViewRisk,
  onAddToPlan,
}: EntityListProps) {
  const [search, setSearch] = useState("");
  const { data: entities = [], isLoading } = useEntities(search || undefined);
  const columns = React.useMemo(
    () => getEntityColumns({ onRateRisk, onViewRisk }),
    [onRateRisk, onViewRisk],
  );

  return (
    <DataTable
      columns={columns}
      data={entities}
      isLoading={isLoading}
      emptyMessage={L.noData}
      searchPlaceholder={L.search}
      onSearch={setSearch}
      onRowClick={onSelect}
      defaultColumnVisibility={defaultEntityColumnVisibility}
      renderContextMenu={(entity) => (
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onEdit(entity)}>
            <Pencil className="mr-2 h-4 w-4" />
            {L.editTitle}
          </ContextMenuItem>
          {onRateRisk && (
            <ContextMenuItem onClick={() => onRateRisk(entity)}>
              <BarChart2 className="mr-2 h-4 w-4" />
              Đánh giá rủi ro mới
            </ContextMenuItem>
          )}
          {onAddToPlan && (
            <ContextMenuItem onClick={() => onAddToPlan(entity)}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Thêm vào kế hoạch kiểm toán
            </ContextMenuItem>
          )}
          {onDelete && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => onDelete(entity)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {L.deleteTitle}
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      )}
      actions={
        <Button size="sm" className="h-8" onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {L.createTitle}
        </Button>
      }
    />
  );
}
