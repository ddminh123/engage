import { PlanningStepList } from "@/features/settings/components/PlanningStepList";

export default function PlanningStepsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Cấu hình bước kế hoạch</h1>
      <p className="mt-2 text-muted-foreground">
        Quản lý và sắp xếp các bước trong tab Kế hoạch của cuộc kiểm toán.
        Các bước cố định không thể xóa, chỉ có thể ẩn/hiện và thay đổi thứ tự.
        Bạn có thể thêm các bước tài liệu tùy chỉnh.
      </p>
      <div className="mt-6 max-w-2xl">
        <PlanningStepList />
      </div>
    </div>
  );
}
