import { ApprovalWorkflowSettings } from "@/features/settings/components/ApprovalWorkflowSettings";

export default function ApprovalWorkflowsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Quy trình soát xét</h1>
      <p className="mt-2 text-muted-foreground">
        Quản lý quy trình soát xét và gán cho các loại thực thể. Mỗi loại thực
        thể sử dụng một quy trình riêng, hoặc quy trình mặc định nếu chưa gán.
      </p>
      <div className="mt-6">
        <ApprovalWorkflowSettings />
      </div>
    </div>
  );
}
