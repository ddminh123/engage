"use client";

import { FilePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";

interface WorkpaperEmptyStateProps {
  /** Heading text (default: "Chưa có nội dung") */
  title?: string;
  /** Supporting description (default: "Nhấn bắt đầu soạn để tạo nội dung") */
  description?: string;
  /** If provided, shows CTA button that triggers this callback */
  onStart?: () => void;
  /** CTA button label (default: "Bắt đầu soạn") */
  startLabel?: string;
  /** Shows spinner on button while creating */
  isLoading?: boolean;
}

export function WorkpaperEmptyState({
  title = "Chưa có nội dung",
  description = "Nhấn bắt đầu soạn để tạo nội dung",
  onStart,
  startLabel = "Bắt đầu soạn",
  isLoading = false,
}: WorkpaperEmptyStateProps) {
  return (
    <Empty className="border py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FilePlus />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {onStart && (
        <EmptyContent>
          <Button
            variant="outline"
            size="sm"
            onClick={onStart}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            {startLabel}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}
