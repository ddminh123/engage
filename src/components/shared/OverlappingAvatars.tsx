"use client";

import { Plus } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import { cn } from "@/lib/utils";

export interface AvatarUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

interface OverlappingAvatarsProps {
  users: AvatarUser[];
  max?: number;
  size?: "sm" | "default";
  onAdd?: () => void;
  /** Show the + placeholder as a non-interactive element (safe inside PopoverTrigger) */
  showAddPlaceholder?: boolean;
  className?: string;
}

export function OverlappingAvatars({
  users,
  max = 5,
  size = "sm",
  onAdd,
  showAddPlaceholder,
  className,
}: OverlappingAvatarsProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className={cn("flex items-center", className)}>
      {visible.map((user, i) => (
        <div
          key={user.id}
          title={user.name}
          className={cn(
            "relative rounded-full ring-2 ring-background",
            i > 0 && "-ml-2",
          )}
        >
          <UserAvatar user={user} size={size} />
        </div>
      ))}

      {overflow > 0 && (
        <div
          title={users
            .slice(max)
            .map((u) => u.name)
            .join(", ")}
          className={cn(
            "relative -ml-2 flex items-center justify-center rounded-full bg-muted text-muted-foreground ring-2 ring-background text-xs font-medium",
            size === "sm" ? "h-6 w-6" : "h-8 w-8",
          )}
        >
          +{overflow}
        </div>
      )}

      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className={cn(
            "relative flex items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors",
            users.length > 0 && "-ml-1",
            size === "sm" ? "h-6 w-6" : "h-8 w-8",
          )}
          title="Thêm thành viên"
        >
          <Plus className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
        </button>
      )}

      {!onAdd && showAddPlaceholder && (
        <div
          className={cn(
            "relative flex items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 text-muted-foreground",
            users.length > 0 && "-ml-1",
            size === "sm" ? "h-6 w-6" : "h-8 w-8",
          )}
        >
          <Plus className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
        </div>
      )}
    </div>
  );
}
