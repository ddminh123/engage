"use client";

import { useState, useMemo } from "react";
import { Plus, Check, X, User } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { cn } from "@/lib/utils";
import { getRoleLabel } from "@/constants/labels/teams";
import type { WpAssignment, EngagementMember } from "../../types";

// ── Avatar with user-card popover ──

function AssigneeAvatar({
  assignment,
  engagementRole,
  onRemove,
  index,
}: {
  assignment: WpAssignment;
  engagementRole?: string;
  onRemove: (userId: string) => void;
  index: number;
}) {
  const [cardOpen, setCardOpen] = useState(false);
  const u = assignment.user;

  return (
    <Popover open={cardOpen} onOpenChange={setCardOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            title={u.name}
            className={cn(
              "relative rounded-full ring-2 ring-background cursor-pointer hover:ring-primary transition-colors",
              index > 0 && "-ml-1.5",
            )}
          />
        }
      >
        <UserAvatar
          user={{ id: u.id, name: u.name, avatarUrl: u.avatarUrl }}
          size="sm"
        />
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-3" align="start">
        <div className="flex items-start gap-2.5">
          <UserAvatar
            user={{ id: u.id, name: u.name, avatarUrl: u.avatarUrl }}
            size="default"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{u.name}</p>
            {u.title && (
              <p className="text-xs text-muted-foreground truncate">
                {u.title}
              </p>
            )}
            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
            {engagementRole && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {engagementRole}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 h-7 text-xs text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(assignment.userId);
            setCardOpen(false);
          }}
        >
          <X className="h-3 w-3 mr-1" />
          Bỏ phân công
        </Button>
      </PopoverContent>
    </Popover>
  );
}

// ── Main Component ──

interface WpAssigneePickerProps {
  entityType: "section" | "objective" | "procedure";
  entityId: string;
  assignments: WpAssignment[];
  members: EngagementMember[];
  onAdd: (userId: string) => void;
  onRemove: (userId: string) => void;
  label?: string;
  className?: string;
}

export function WpAssigneePicker({
  entityType,
  entityId,
  assignments,
  members,
  onAdd,
  onRemove,
  label = "Người thực hiện",
  className,
}: WpAssigneePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const entityAssignments = useMemo(
    () =>
      assignments.filter(
        (a) => a.entityType === entityType && a.entityId === entityId,
      ),
    [assignments, entityType, entityId],
  );

  const assignedUserIds = useMemo(
    () => new Set(entityAssignments.map((a) => a.userId)),
    [entityAssignments],
  );

  const filteredMembers = useMemo(
    () =>
      members.filter(
        (m) =>
          !search || m.user.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [members, search],
  );

  // Build a map of userId → engagement role label for the user card
  const memberRoleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) {
      const ENGAGEMENT_ROLES: Record<string, string> = {
        lead: "Trưởng nhóm",
        member: "Thành viên",
        reviewer: "Soát xét",
        observer: "Quan sát",
      };
      map.set(m.userId, ENGAGEMENT_ROLES[m.role] ?? m.role);
    }
    return map;
  }, [members]);

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Assigned avatars — click opens user card */}
      {entityAssignments.map((a, i) => (
        <AssigneeAvatar
          key={a.userId}
          assignment={a}
          engagementRole={memberRoleMap.get(a.userId)}
          onRemove={onRemove}
          index={i}
        />
      ))}

      {/* Label (when no assignees) or Plus button → toggle member search */}
      <Popover open={open} onOpenChange={setOpen}>
        {entityAssignments.length === 0 && label ? (
          <PopoverTrigger
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Phân công"
          >
            <User className="h-3 w-3" />
            {label}
          </PopoverTrigger>
        ) : (
          <PopoverTrigger
            render={
              <button
                type="button"
                title="Phân công"
                className={cn(
                  "flex items-center justify-center rounded-full border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors h-5 w-5",
                  entityAssignments.length > 0 && "-ml-1",
                )}
              />
            }
          >
            <Plus className="h-3 w-3" />
          </PopoverTrigger>
        )}
        <PopoverContent className="w-[220px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Tìm thành viên..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>Không tìm thấy.</CommandEmpty>
              <CommandGroup>
                {filteredMembers.map((m) => {
                  const isAssigned = assignedUserIds.has(m.userId);
                  return (
                    <CommandItem
                      key={m.userId}
                      value={m.userId}
                      onSelect={() => {
                        if (isAssigned) {
                          onRemove(m.userId);
                        } else {
                          onAdd(m.userId);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <UserAvatar
                          user={{
                            id: m.user.id,
                            name: m.user.name,
                            avatarUrl: m.user.avatarUrl,
                          }}
                          size="sm"
                        />
                        <span className="text-sm truncate">{m.user.name}</span>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4 shrink-0",
                          isAssigned ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
