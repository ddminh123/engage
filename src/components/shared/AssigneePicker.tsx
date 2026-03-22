"use client";

import { useState } from "react";
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
import { UserAvatar } from "./UserAvatar";
import { useUsers } from "@/features/teams/hooks/useUsers";
import { Check, UserCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserCardData } from "./UserCard";

export interface AssigneePickerProps {
  value: string | null;
  onSelect: (userId: string | null) => void;
  members?: { userId: string; user: UserCardData }[];
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function AssigneePicker({
  value,
  onSelect,
  members,
  placeholder = "Chưa phân công",
  label,
  className,
  disabled = false,
}: AssigneePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: allUsers = [] } = useUsers(
    !members && search ? { search } : undefined,
  );

  const userList = members
    ? members
        .filter(
          (m) =>
            !search || m.user.name.toLowerCase().includes(search.toLowerCase()),
        )
        .map((m) => m.user)
    : allUsers.filter((u) => u.status === "active");

  const selectedUser = members
    ? members.find((m) => m.userId === value)?.user
    : allUsers.find((u) => u.id === value);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {label && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {label}
        </span>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md px-1.5 text-xs font-normal hover:bg-accent hover:text-accent-foreground transition-colors",
            !value && "text-muted-foreground",
          )}
        >
          {selectedUser ? (
            <>
              <UserAvatar user={selectedUser} size="sm" />
              <span className="max-w-[100px] truncate">
                {selectedUser.name}
              </span>
            </>
          ) : (
            <>
              <UserCircle className="h-4 w-4" />
              <span>{placeholder}</span>
            </>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Tìm kiếm..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>Không tìm thấy.</CommandEmpty>
              <CommandGroup>
                {value && (
                  <CommandItem
                    value="__clear__"
                    onSelect={() => {
                      onSelect(null);
                      setOpen(false);
                    }}
                    className="text-muted-foreground"
                  >
                    <X className="mr-2 h-3.5 w-3.5" />
                    Bỏ phân công
                  </CommandItem>
                )}
                {userList.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={() => {
                      onSelect(user.id === value ? null : user.id);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <UserAvatar user={user} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">{user.name}</p>
                        {user.title && (
                          <p className="text-xs text-muted-foreground truncate">
                            {user.title}
                          </p>
                        )}
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        value === user.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
