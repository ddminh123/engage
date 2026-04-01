import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateList } from "@/features/settings/components/TemplateList";
import { TemplateMappingTable } from "@/features/settings/components/TemplateMappingTable";

export default function TemplatesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Thư viện mẫu</h1>
      <p className="mt-2 text-muted-foreground">
        Quản lý các mẫu workpaper và gán mẫu mặc định cho từng loại đối tượng.
      </p>
      <div className="mt-6">
        <Tabs defaultValue="library" className="w-full">
          <TabsList>
            <TabsTrigger value="library">Thư viện</TabsTrigger>
            <TabsTrigger value="mappings">Quản lý</TabsTrigger>
          </TabsList>
          <TabsContent value="library" className="mt-4">
            <TemplateList />
          </TabsContent>
          <TabsContent value="mappings" className="mt-4">
            <TemplateMappingTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
