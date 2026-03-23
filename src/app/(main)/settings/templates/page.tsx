import { TemplateList } from "@/features/settings/components/TemplateList";

export default function TemplatesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Thư viện mẫu</h1>
      <p className="mt-2 text-muted-foreground">
        Quản lý các mẫu workpaper dùng cho thủ tục kiểm toán và đánh giá rủi ro.
      </p>
      <div className="mt-6">
        <TemplateList />
      </div>
    </div>
  );
}
