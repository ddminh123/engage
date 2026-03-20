"use client";

import { useState, useEffect, useRef } from "react";
import { Table } from "@tanstack/react-table";
import { X, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  /** Server-side search callback. When provided, search bypasses client-side column filters. */
  onSearch?: (query: string) => void;
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = "Tìm kiếm...",
  actions,
  onSearch,
}: DataTableToolbarProps<TData>) {
  const isServerSearch = !!onSearch;
  const [localSearch, setLocalSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isServerSearch) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(localSearch);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localSearch, isServerSearch, onSearch]);

  const isFiltered = isServerSearch
    ? localSearch.length > 0
    : table.getState().columnFilters.length > 0;

  const handleClear = () => {
    if (isServerSearch) {
      setLocalSearch("");
    } else {
      table.resetColumnFilters();
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {(searchKey || isServerSearch) && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            {isServerSearch ? (
              <Input
                placeholder={searchPlaceholder}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="h-9 w-[200px] pl-8 lg:w-[280px]"
              />
            ) : (
              searchKey && (
                <Input
                  placeholder={searchPlaceholder}
                  value={
                    (table.getColumn(searchKey)?.getFilterValue() as string) ??
                    ""
                  }
                  onChange={(event) =>
                    table
                      .getColumn(searchKey)
                      ?.setFilterValue(event.target.value)
                  }
                  className="h-9 w-[200px] pl-8 lg:w-[280px]"
                />
              )
            )}
          </div>
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleClear}
            className="h-8 px-2 lg:px-3"
          >
            Xóa bộ lọc
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {actions}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="ml-auto h-8" />
            }
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Cột
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Hiển thị cột</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter(
                  (column) => column.getCanHide() && column.id !== "_actions",
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={() =>
                        column.toggleVisibility(!column.getIsVisible())
                      }
                    >
                      {(column.columnDef.meta as { label?: string })?.label ??
                        column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
