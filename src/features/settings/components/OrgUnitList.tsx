"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { SETTINGS_LABELS } from "@/constants/labels";
import { useOrgUnits } from "../hooks/useOrgUnits";
import {
  getOrgUnitColumns,
  defaultOrgUnitColumnVisibility,
} from "./OrgUnitColumns";
import type { OrgUnit } from "../types";

const L = SETTINGS_LABELS.orgUnit;

interface OrgUnitNode extends OrgUnit {
  subRows?: OrgUnitNode[];
}

function buildTree(flat: OrgUnit[]): OrgUnitNode[] {
  const map = new Map<string, OrgUnitNode>();
  const roots: OrgUnitNode[] = [];

  flat.forEach((u) => map.set(u.id, { ...u, subRows: [] }));

  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.subRows!.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

interface OrgUnitListProps {
  onSelect: (unit: OrgUnit) => void;
  onCreate: () => void;
  onEdit: (unit: OrgUnit) => void;
  onAddChild: (unit: OrgUnit) => void;
}

export function OrgUnitList({
  onSelect,
  onCreate,
  onEdit,
  onAddChild,
}: OrgUnitListProps) {
  const [search, setSearch] = useState("");
  const { data: units = [], isLoading } = useOrgUnits(
    search ? { search } : undefined,
  );

  const treeData = useMemo(() => buildTree(units), [units]);
  const columns = useMemo(
    () => getOrgUnitColumns({ onEdit, onAddChild }),
    [onEdit, onAddChild],
  );

  const handleSearch = useCallback((q: string) => setSearch(q), []);

  return (
    <DataTable
      columns={columns}
      data={treeData}
      getSubRows={(row) => (row as OrgUnitNode).subRows}
      searchPlaceholder={L.search}
      isLoading={isLoading}
      emptyMessage={L.noData}
      onRowClick={onSelect}
      onSearch={handleSearch}
      defaultColumnVisibility={defaultOrgUnitColumnVisibility}
      renderContextMenu={(unit) => (
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onEdit(unit)}>
            <Pencil className="mr-2 h-4 w-4" />
            {L.editTitle}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => onAddChild(unit)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm đơn vị con
          </ContextMenuItem>
        </ContextMenuContent>
      )}
      actions={
        <Button onClick={onCreate} size="sm" className="h-8">
          <Plus className="mr-2 h-4 w-4" />
          {L.createTitle}
        </Button>
      }
    />
  );
}
