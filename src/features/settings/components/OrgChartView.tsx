"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Network } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { COMMON_LABELS, SETTINGS_LABELS } from "@/constants/labels";
import { useOrgChartState } from "../hooks/useOrgChartState";
import { OrgUnitList } from "./OrgUnitList";
import { OrgUnitForm } from "./OrgUnitForm";
import type { OrgUnitFormHandle } from "./OrgUnitForm";
import { OrgUnitDetail } from "./OrgUnitDetail";
import { ContactForm } from "./ContactForm";
import type { Contact, ContactInput } from "../types";

const L = SETTINGS_LABELS.orgUnit;
const C = COMMON_LABELS;

interface OrgChartViewProps {
  embedded?: boolean;
}

export function OrgChartView({ embedded = false }: OrgChartViewProps) {
  const orgUnitFormRef = React.useRef<OrgUnitFormHandle>(null);

  const {
    selectedUnit,
    detailOpen,
    formOpen,
    orgUnitFormHidden,
    editingUnit,
    presetParent,
    deleteDialogOpen,
    unitToDelete,
    contactFormOpen,
    contactRole,
    isMutating,
    isDeleting,
    mutationError,
    handleSelect,
    handleCreate,
    handleAddChild,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    handleConfirmDelete,
    handleCreateContact,
    handleContactFormSubmit,
    createContactPending,
    setDetailOpen,
    setFormOpen,
    setDeleteDialogOpen,
    setContactFormOpen,
  } = useOrgChartState();

  const onContactFormSubmit = async (data: ContactInput) => {
    const contact = await handleContactFormSubmit(data);
    if (contact) {
      if (contactRole === "leader") {
        orgUnitFormRef.current?.setLeader(contact);
      } else if (contactRole === "contactPoint") {
        orgUnitFormRef.current?.setContactPoint(contact);
      }
    }
  };

  return (
    <div className={embedded ? "" : "space-y-6"}>
      {!embedded && (
        <div>
          <h1 className="text-2xl font-bold">{L.title}</h1>
          <p className="mt-1 text-muted-foreground">
            Quản lý sơ đồ tổ chức của công ty
          </p>
        </div>
      )}

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            Danh sách
          </TabsTrigger>
          <TabsTrigger value="tree" className="gap-2">
            <Network className="h-4 w-4" />
            Sơ đồ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <OrgUnitList
            onSelect={handleSelect}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onAddChild={handleAddChild}
          />
        </TabsContent>

        <TabsContent value="tree" className="mt-4">
          <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center text-muted-foreground">
              <Network className="mx-auto h-12 w-12 mb-2" />
              <p>Sơ đồ tổ chức (d3-org-chart)</p>
              <p className="text-sm">Sẽ được triển khai sau</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Sheet */}
      <OrgUnitDetail
        unit={selectedUnit}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create/Edit OrgUnit — uses FormDialog internally */}
      <OrgUnitForm
        ref={orgUnitFormRef}
        open={formOpen}
        onOpenChange={setFormOpen}
        hidden={orgUnitFormHidden}
        initialData={editingUnit}
        defaultParent={presetParent}
        onSubmit={handleFormSubmit}
        onCreateContact={handleCreateContact}
        isLoading={isMutating}
        mutationError={mutationError}
      />

      {/* Create Contact — shown in place of OrgUnitForm (no nested modals) */}
      <ContactForm
        open={contactFormOpen}
        onOpenChange={setContactFormOpen}
        onSubmit={onContactFormSubmit}
        isLoading={createContactPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={C.confirm.deleteTitle}
        description={L.deleteDescription(unitToDelete?.name ?? "")}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
