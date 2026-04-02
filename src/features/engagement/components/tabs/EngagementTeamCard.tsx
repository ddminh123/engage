"use client";

import * as React from "react";
import { Plus, X, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserSearch } from "@/components/shared/UserSearch";
import {
  useAddEngagementMember,
  useUpdateEngagementMember,
  useRemoveEngagementMember,
} from "../../hooks/useEngagements";
import type { EngagementMember } from "../../types";

const ROLE_OPTIONS = [
  { value: "lead", label: "Trưởng nhóm" },
  { value: "member", label: "Thành viên" },
  { value: "reviewer", label: "Soát xét" },
  { value: "observer", label: "Quan sát" },
] as const;

const ROLE_LABEL: Record<string, string> = Object.fromEntries(
  ROLE_OPTIONS.map((r) => [r.value, r.label]),
);

const ROLE_COLOR: Record<string, string> = {
  lead: "bg-blue-100 text-blue-700",
  reviewer: "bg-amber-100 text-amber-700",
  member: "bg-gray-100 text-gray-700",
  observer: "bg-gray-50 text-gray-500",
};

interface EngagementTeamCardProps {
  engagementId: string;
  members: EngagementMember[];
}

export function EngagementTeamCard({
  engagementId,
  members,
}: EngagementTeamCardProps) {
  const addMember = useAddEngagementMember();
  const updateRole = useUpdateEngagementMember();
  const removeMember = useRemoveEngagementMember();

  const [addRole, setAddRole] = React.useState("member");
  const [showAdd, setShowAdd] = React.useState(false);

  const excludeIds = members.map((m) => m.userId);

  // Group members by role for display order: lead → reviewer → member → observer
  const sortedMembers = React.useMemo(() => {
    const order: Record<string, number> = {
      lead: 0,
      reviewer: 1,
      member: 2,
      observer: 3,
    };
    return [...members].sort(
      (a, b) => (order[a.role] ?? 9) - (order[b.role] ?? 9),
    );
  }, [members]);

  const handleAdd = (userId: string) => {
    addMember.mutate(
      { engagementId, data: { userId, role: addRole } },
      { onSuccess: () => setShowAdd(false) },
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Đoàn kiểm toán
            <Badge variant="secondary" className="text-xs font-normal ml-1">
              {members.length}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowAdd((v) => !v)}
            title="Thêm thành viên"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add member row */}
        {showAdd && (
          <div className="flex items-center gap-2 rounded-md border border-dashed p-2">
            <div className="flex-1">
              <UserSearch
                onSelect={(userId) => {
                  if (userId) handleAdd(userId);
                }}
                excludeIds={excludeIds}
                placeholder="Tìm người dùng..."
              />
            </div>
            <Select
              value={addRole}
              onValueChange={(v) => {
                if (v) setAddRole(v);
              }}
            >
              <SelectTrigger className="h-8 w-[110px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    label={opt.label}
                    className="text-xs"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Members list */}
        {sortedMembers.length > 0 ? (
          <div className="space-y-1">
            {sortedMembers.map((m) => (
              <div
                key={m.userId}
                className="group flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
              >
                <UserAvatar user={m.user} size="default" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{m.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {m.user.email}
                    {m.user.title && ` · ${m.user.title}`}
                  </p>
                </div>
                <Select
                  value={m.role}
                  onValueChange={(v) => {
                    if (v)
                      updateRole.mutate({
                        engagementId,
                        userId: m.userId,
                        data: { role: v },
                      });
                  }}
                >
                  <SelectTrigger className="h-6 w-auto min-w-[90px] border-0 bg-transparent px-1.5 py-0 text-xs shadow-none focus:ring-0">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLOR[m.role] ?? ROLE_COLOR.member}`}
                    >
                      {ROLE_LABEL[m.role] ?? m.role}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        label={opt.label}
                        className="text-xs"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() =>
                    removeMember.mutate({ engagementId, userId: m.userId })
                  }
                  className="opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-destructive transition-opacity"
                  title="Xóa khỏi đoàn"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
            <Users className="h-6 w-6" />
            <p className="text-sm">Chưa có thành viên</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
