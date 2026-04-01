"use client";

import { useState, useMemo, useCallback } from "react";
import { Check, User, UserCircle } from "lucide-react";
import { useSession } from "next-auth/react";
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
  CommandSeparator,
} from "@/components/ui/command";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { cn } from "@/lib/utils";
import type { WpAssignment, EngagementMember } from "../../types";

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
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const entityAssignments = useMemo(
    () =>
      assignments.filter(
        (a) => a.entityType === entityType && a.entityId === entityId,
      ),
    [assignments, entityType, entityId],
  );

  // Single-mode: take first assignment only
  const currentAssignment = entityAssignments[0] ?? null;
  const currentUserId = currentAssignment?.userId ?? null;

  const filteredMembers = useMemo(
    () =>
      members.filter(
        (m) =>
          !search || m.user.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [members, search],
  );

  // Single-mode: selecting replaces the current assignee
  const handleSelect = useCallback(
    (userId: string) => {
      if (userId === currentUserId) {
        // Clicking the already-assigned user → unassign
        onRemove(userId);
      } else {
        // Remove old assignee first (if any), then add new
        if (currentUserId) {
          onRemove(currentUserId);
        }
        onAdd(userId);
      }
      setOpen(false);
    },
    [currentUserId, onAdd, onRemove],
  );

  const handleUnassign = useCallback(() => {
    if (currentUserId) {
      onRemove(currentUserId);
    }
    setOpen(false);
  }, [currentUserId, onRemove]);

  const handleAssignToMe = useCallback(() => {
    const myId = session?.user?.id;
    if (!myId) return;
    if (myId === currentUserId) return; // already me
    if (currentUserId) onRemove(currentUserId);
    onAdd(myId);
    setOpen(false);
  }, [session?.user?.id, currentUserId, onAdd, onRemove]);

  const showAssignToMe =
    !!session?.user?.id && session.user.id !== currentUserId;
  const u = currentAssignment?.user;

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Assignee trigger — click opens dropdown */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              title={u ? `${label}: ${u.name}` : label}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-muted cursor-pointer"
            />
          }
        >
          {u ? (
            <>
              <UserAvatar
                user={{ id: u.id, name: u.name, avatarUrl: u.avatarUrl }}
                size="sm"
              />
              <span className="font-medium text-foreground max-w-[100px] truncate">
                {u.name}
              </span>
            </>
          ) : (
            <>
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Chưa phân công</span>
            </>
          )}
        </PopoverTrigger>

        <PopoverContent className="w-[240px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Tìm thành viên..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>Không tìm thấy.</CommandEmpty>
              {/* Quick actions: assign to me / unassign */}
              {(showAssignToMe || currentUserId) && (
                <>
                  <CommandGroup>
                    {showAssignToMe && (
                      <CommandItem onSelect={handleAssignToMe}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <UserCircle className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm text-primary font-medium">
                            Phân công cho tôi
                          </span>
                        </div>
                      </CommandItem>
                    )}
                    {currentUserId && (
                      <CommandItem onSelect={handleUnassign}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <User className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            Bỏ phân công
                          </span>
                        </div>
                      </CommandItem>
                    )}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}
              <CommandGroup>
                {filteredMembers.map((m) => {
                  const isSelected = m.userId === currentUserId;
                  return (
                    <CommandItem
                      key={m.userId}
                      value={m.userId}
                      onSelect={() => handleSelect(m.userId)}
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
                          isSelected ? "opacity-100" : "opacity-0",
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
