"use client";

import { useState } from "react";
import { Plus, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserBadge } from "./UserBadge";
import { UserSearch } from "./UserSearch";
import type { UserCardData } from "./UserCard";

export interface MemberItem {
  userId: string;
  role: string;
  user: UserCardData;
}

const ROLE_OPTIONS = [
  { value: "lead", label: "Trưởng nhóm" },
  { value: "member", label: "Thành viên" },
  { value: "reviewer", label: "Soát xét" },
  { value: "observer", label: "Quan sát" },
];

const ROLE_LABEL: Record<string, string> = {
  lead: "Trưởng nhóm",
  member: "Thành viên",
  reviewer: "Soát xét",
  observer: "Quan sát",
};

export interface MemberManagerProps {
  members: MemberItem[];
  onAdd: (userId: string, role: string) => void;
  onUpdateRole: (userId: string, role: string) => void;
  onRemove: (userId: string) => void;
  isAdding?: boolean;
  isUpdating?: boolean;
  isRemoving?: boolean;
  readOnly?: boolean;
}

export function MemberManager({
  members,
  onAdd,
  onUpdateRole,
  onRemove,
  isAdding = false,
  isUpdating = false,
  isRemoving = false,
  readOnly = false,
}: MemberManagerProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [selectedRole, setSelectedRole] = useState("member");

  const existingIds = members.map((m) => m.userId);

  const handleSelect = (userId: string | null) => {
    if (userId === null) return;
    onAdd(userId, selectedRole);
    setShowSearch(false);
    setSelectedRole("member");
  };

  return (
    <div className="space-y-2">
      {/* Member list */}
      {members.length === 0 && !showSearch && (
        <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Chưa có thành viên</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {members.map((member) => (
          <div
            key={member.userId}
            className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-1 text-xs"
          >
            <UserBadge
              user={member.user}
              className="border-0 bg-transparent px-0 py-0"
            />
            {!readOnly && (
              <Select
                value={member.role}
                onValueChange={(v) => {
                  if (v) onUpdateRole(member.userId, v);
                }}
                disabled={isUpdating}
              >
                <SelectTrigger className="h-5 w-auto min-w-[80px] border-0 bg-transparent px-1 py-0 text-xs font-normal text-muted-foreground shadow-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-xs"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {readOnly && (
              <span className="text-xs text-muted-foreground">
                {ROLE_LABEL[member.role] ?? member.role}
              </span>
            )}
            {!readOnly && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(member.userId)}
                disabled={isRemoving}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Add member */}
      {!readOnly && (
        <div>
          {showSearch ? (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <UserSearch
                  value={null}
                  onSelect={handleSelect}
                  excludeIds={existingIds}
                  placeholder="Tìm kiếm người dùng..."
                />
              </div>
              <Select
                value={selectedRole}
                onValueChange={(v) => {
                  if (v) setSelectedRole(v);
                }}
              >
                <SelectTrigger className="h-9 w-[120px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-xs"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowSearch(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowSearch(true)}
              disabled={isAdding}
            >
              <Plus className="mr-1 h-3 w-3" />
              Thêm thành viên
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
