"use client";

import { UserList } from "@/features/teams/components/UserList";

export default function UsersSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <p className="mt-1 text-muted-foreground">
          Thêm, chỉnh sửa, khóa/mở khóa tài khoản người dùng trong hệ thống.
        </p>
      </div>

      <UserList />
    </div>
  );
}
