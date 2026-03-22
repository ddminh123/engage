"use client";

import { useState, useMemo } from "react";
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
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UserSearchProps {
  value?: string | null;
  onSelect: (userId: string | null) => void;
  placeholder?: string;
  excludeIds?: string[];
  className?: string;
}

export function UserSearch({
  value,
  onSelect,
  placeholder = "Chọn người dùng...",
  excludeIds = [],
  className,
}: UserSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: users = [] } = useUsers(search ? { search } : undefined);

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => !excludeIds.includes(u.id) && u.status === "active"),
    [users, excludeIds],
  );

  const selectedUser = useMemo(
    () => users.find((u) => u.id === value),
    [users, value],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          className,
        )}
      >
        {selectedUser ? (
          <span className="flex items-center gap-2 truncate">
            <UserAvatar user={selectedUser} size="sm" />
            <span className="truncate">{selectedUser.name}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Tìm kiếm..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Không tìm thấy người dùng.</CommandEmpty>
            <CommandGroup>
              {filteredUsers.map((user) => (
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
  );
}
