"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserAvatar } from "./UserAvatar";
import { UserCardPopoverContent, type UserCardData } from "./UserCard";
import { cn } from "@/lib/utils";

export interface UserBadgeProps {
  user: UserCardData;
  showCard?: boolean;
  className?: string;
}

export function UserBadge({
  user,
  showCard = true,
  className,
}: UserBadgeProps) {
  const badgeClasses = cn(
    "inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium transition-colors",
    showCard && "cursor-pointer hover:bg-muted",
    className,
  );

  if (!showCard) {
    return (
      <span className={badgeClasses}>
        <UserAvatar user={user} size="sm" />
        <span className="truncate max-w-[120px]">{user.name}</span>
      </span>
    );
  }

  return (
    <Popover>
      <PopoverTrigger className={badgeClasses}>
        <UserAvatar user={user} size="sm" />
        <span className="truncate max-w-[120px]">{user.name}</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <UserCardPopoverContent user={user} />
      </PopoverContent>
    </Popover>
  );
}
