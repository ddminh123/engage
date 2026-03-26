"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApprovalWorkflowList } from "./ApprovalWorkflowList";
import { EntityMappingTable } from "./EntityMappingTable";
import { ApprovalStatusList } from "./ApprovalStatusList";

export function ApprovalWorkflowSettings() {
  return (
    <Tabs defaultValue="mappings" className="w-full">
      <TabsList>
        <TabsTrigger value="mappings">Quản lý</TabsTrigger>
        <TabsTrigger value="workflows">Quy trình</TabsTrigger>
        <TabsTrigger value="statuses">Trạng thái</TabsTrigger>
      </TabsList>
      <TabsContent value="mappings" className="mt-4">
        <EntityMappingTable />
      </TabsContent>
      <TabsContent value="workflows" className="mt-4">
        <ApprovalWorkflowList />
      </TabsContent>
      <TabsContent value="statuses" className="mt-4">
        <ApprovalStatusList />
      </TabsContent>
    </Tabs>
  );
}
