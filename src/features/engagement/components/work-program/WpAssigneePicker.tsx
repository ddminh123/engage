"use client";

import { useState, useMemo } from "react";
import { Plus, Check } from "lucide-react";
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
import { UserAvatar } from "@/components/shared/UserAvatar";
import { cn } from "@/lib/utils";
import type { WpAssignment, EngagementMember } from "../../types";

interface WpAssigneePickerProps {
  entityType: "section" | "objective" | "procedure";
  entityId: string;
  assignments: WpAssignment[];
  members: EngagementMember[];
  onAdd: (userId: string) => void;
  onRemove: (userId: string) => void;
  className?: string;
}

export function WpAssigneePicker({
  entityType,
  entityId,
  assignments,
  members,
  onAdd,
  onRemove,
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

  return (
    <div
      className={cn("flex items-center", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Assigned avatars — overlapping */}
      {entityAssignments.map((a, i) => (
        <div
          key={a.userId}
          title={a.user.name}
          className={cn(
            "relative rounded-full ring-2 ring-background cursor-pointer",
            i > 0 && "-ml-1.5",
          )}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(a.userId);
          }}
        >
          <UserAvatar
            user={{
              id: a.user.id,
              name: a.user.name,
              avatarUrl: a.user.avatarUrl,
            }}
            size="sm"
          />
        </div>
      ))}

      {/* Plus button to add */}
      <Popover open={open} onOpenChange={setOpen}>
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
                        setOpen(false);
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
