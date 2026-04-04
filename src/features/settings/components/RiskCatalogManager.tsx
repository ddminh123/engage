"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RiskCatalogList } from "./RiskCatalogList";
import { ControlCatalogList } from "./ControlCatalogList";
import { ProcedureCatalogList } from "./ProcedureCatalogList";
import { CatalogDomainTree } from "./CatalogDomainTree";
import { SETTINGS_LABELS } from "@/constants/labels";

const L = SETTINGS_LABELS.riskCatalog;

export function RiskCatalogManager() {
  const [selectedDomainId, setSelectedDomainId] = useState<string | undefined>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >();

  return (
    <Tabs
      defaultValue="risks"
      onValueChange={() => {
        setSelectedDomainId(undefined);
        setSelectedCategoryId(undefined);
      }}
    >
      <TabsList>
        <TabsTrigger value="risks">{L.tab.risks}</TabsTrigger>
        <TabsTrigger value="controls">{L.tab.controls}</TabsTrigger>
        <TabsTrigger value="procedures">{L.tab.procedures}</TabsTrigger>
      </TabsList>
      <div className="flex gap-6 mt-4">
        {/* Left sidebar -- domain tree */}
        <div className="w-64 shrink-0">
          <CatalogDomainTree
            selectedDomainId={selectedDomainId}
            selectedCategoryId={selectedCategoryId}
            onSelectDomain={(id) => {
              setSelectedDomainId(id);
              setSelectedCategoryId(undefined);
            }}
            onSelectCategory={(id, domainId) => {
              setSelectedCategoryId(id);
              setSelectedDomainId(domainId);
            }}
            onClear={() => {
              setSelectedDomainId(undefined);
              setSelectedCategoryId(undefined);
            }}
          />
        </div>
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <TabsContent value="risks" className="mt-0">
            <RiskCatalogList
              domainId={selectedDomainId}
              categoryId={selectedCategoryId}
            />
          </TabsContent>
          <TabsContent value="controls" className="mt-0">
            <ControlCatalogList
              domainId={selectedDomainId}
              categoryId={selectedCategoryId}
            />
          </TabsContent>
          <TabsContent value="procedures" className="mt-0">
            <ProcedureCatalogList
              domainId={selectedDomainId}
              categoryId={selectedCategoryId}
            />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
}
