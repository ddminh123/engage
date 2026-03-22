"use client";

import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "./UserAvatar";
import { getRoleLabel } from "@/constants/labels/teams";
import { Mail, Phone, Users, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UserCardData {
  id: string;
  name: string;
  avatarUrl?: string | null;
  email?: string;
  phone?: string | null;
  title?: string | null;
  role?: string;
  teamName?: string | null;
}

interface UserCardContentProps {
  user: UserCardData;
  className?: string;
}

function UserCardContent({ user, className }: UserCardContentProps) {
  return (
    <div className={cn("flex gap-3", className)}>
      <UserAvatar user={user} size="lg" />
      <div className="min-w-0 flex-1 space-y-1">
        <div>
          <p className="text-sm font-semibold leading-none truncate">{user.name}</p>
          {user.title && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{user.title}</p>
          )}
        </div>
        <div className="space-y-0.5">
          {user.email && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          )}
          {user.phone && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0" />
              <span className="truncate">{user.phone}</span>
            </div>
          )}
          {user.role && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Briefcase className="h-3 w-3 shrink-0" />
              <span className="truncate">{getRoleLabel(user.role)}</span>
            </div>
          )}
          {user.teamName && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3 w-3 shrink-0" />
              <span className="truncate">{user.teamName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Standalone card mode
export interface UserCardProps {
  user: UserCardData;
  className?: string;
}

export function UserCard({ user, className }: UserCardProps) {
  return (
    <Card className={cn("w-72", className)}>
      <CardContent className="p-3">
        <UserCardContent user={user} />
      </CardContent>
    </Card>
  );
}

// Popover content (used by UserBadge and UserAvatar hover)
export function UserCardPopoverContent({ user }: { user: UserCardData }) {
  return (
    <div className="w-64 p-3">
      <UserCardContent user={user} />
    </div>
  );
}
