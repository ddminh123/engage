"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserAvatar } from "./UserAvatar";
import { OverlappingAvatars, type AvatarUser } from "./OverlappingAvatars";
import { UserSearch } from "./UserSearch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS = [
  { value: "lead", label: "Trưởng nhóm" },
  { value: "member", label: "Thành viên" },
  { value: "reviewer", label: "Soát xét" },
  { value: "observer", label: "Quan sát" },
];

export interface TeamMember {
  userId: string;
  role: string;
  user: AvatarUser & { email?: string; title?: string | null };
}

interface TeamAvatarManagerProps {
  members: TeamMember[];
  onAdd: (userId: string, role: string) => void;
  onUpdateRole: (userId: string, role: string) => void;
  onRemove: (userId: string) => void;
  className?: string;
}

export function TeamAvatarManager({
  members,
  onAdd,
  onUpdateRole,
  onRemove,
  className,
}: TeamAvatarManagerProps) {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("member");

  const avatarUsers: AvatarUser[] = members.map((m) => m.user);
  const excludeIds = members.map((m) => m.userId);

  return (
    <div className={cn("flex items-center", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              title="Quản lý nhóm kiểm toán"
              className="flex items-center"
            />
          }
        >
          <OverlappingAvatars
            users={avatarUsers}
            max={5}
            size="sm"
            onAdd={() => setOpen(true)}
          />
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          {/* Current members */}
          <div className="p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Nhóm kiểm toán ({members.length})
            </p>
            {members.length > 0 ? (
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {members.map((m) => (
                  <div
                    key={m.userId}
                    className="group flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-muted/50"
                  >
                    <UserAvatar user={m.user} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{m.user.name}</p>
                    </div>
                    <Select
                      value={m.role}
                      onValueChange={(v) => {
                        if (v) onUpdateRole(m.userId, v);
                      }}
                    >
                      <SelectTrigger className="h-5 w-auto min-w-[70px] border-0 bg-transparent px-1 py-0 text-xs text-muted-foreground shadow-none focus:ring-0">
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
                    <button
                      type="button"
                      onClick={() => onRemove(m.userId)}
                      className="opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-destructive transition-opacity"
                      title="Xóa"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-1">
                Chưa có thành viên nào.
              </p>
            )}
          </div>

          {/* Divider + add member */}
          <div className="border-t p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <UserSearch
                  onSelect={(userId) => {
                    if (userId) {
                      onAdd(userId, selectedRole);
                    }
                  }}
                  excludeIds={excludeIds}
                  placeholder="Tìm người dùng..."
                />
              </div>
              <Select
                value={selectedRole}
                onValueChange={(v) => {
                  if (v) setSelectedRole(v);
                }}
              >
                <SelectTrigger className="h-8 w-[100px] text-xs">
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
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
