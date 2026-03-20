"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import {
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { SETTINGS_LABELS } from "@/constants/labels";
import { useContacts } from "../hooks/useContacts";
import {
  contactColumns,
  defaultContactColumnVisibility,
} from "./ContactColumns";
import type { Contact } from "../types";

const LC = SETTINGS_LABELS.contact;

interface ContactListProps {
  onSelect: (contact: Contact) => void;
  onCreate: () => void;
  onEdit: (contact: Contact) => void;
}

export function ContactList({ onSelect, onCreate, onEdit }: ContactListProps) {
  const [search, setSearch] = useState("");
  const { data: contacts = [], isLoading } = useContacts(search);

  const handleSearch = useCallback((q: string) => setSearch(q), []);

  return (
    <DataTable
      columns={contactColumns}
      data={contacts}
      searchPlaceholder={LC.search}
      isLoading={isLoading}
      emptyMessage={LC.noData}
      onRowClick={onSelect}
      onSearch={handleSearch}
      defaultColumnVisibility={defaultContactColumnVisibility}
      renderContextMenu={(contact) => (
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onEdit(contact)}>
            <Pencil className="mr-2 h-4 w-4" />
            {LC.editTitle}
          </ContextMenuItem>
        </ContextMenuContent>
      )}
      actions={
        <Button onClick={onCreate} size="sm" className="h-8">
          <Plus className="mr-2 h-4 w-4" />
          {LC.createTitle}
        </Button>
      }
    />
  );
}
