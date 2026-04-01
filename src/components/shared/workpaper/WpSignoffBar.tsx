"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  useWorkflowSignoffTypes,
  useManualSign,
  useUnsign,
} from "@/features/engagement/hooks/useEngagements";
import type { WpSignoff } from "@/features/engagement/types";

// ── Config ──

const SIGNOFF_TYPE_LABELS: Record<string, string> = {
  prepare: "Thực hiện",
  review: "Soát xét",
  approve: "Phê duyệt",
};

// ── Helpers ──

const SIGNOFF_LEVEL: Record<string, number> = {
  prepare: 0,
  review: 1,
  approve: 2,
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Slot type ──

interface SignoffSlot {
  key: string;
  signoffType: string;
  signoffOrder: number; // 1-based
  label: string;
  signoff: WpSignoff | null; // active signoff for this slot
  allItems: WpSignoff[]; // all signoffs (incl. invalidated) for popover history
}

// ── Props ──

interface WpSignoffBarProps {
  entityType: string;
  entityId: string;
  engagementId: string;
  signoffs: WpSignoff[];
  currentVersion: number;
  onViewVersion?: (version: number) => void;
  /** Right-aligned actions slot (e.g. WorkpaperActions) */
  actions?: React.ReactNode;
  /** Optional edit button rendered to the right of actions */
  editButton?: React.ReactNode;
  /** Remove background fill, keep border divider (for inline/section views) */
  compact?: boolean;
}

export function WpSignoffBar({
  entityType,
  entityId,
  engagementId,
  signoffs,
  currentVersion,
  onViewVersion,
  actions,
  editButton,
  compact = false,
}: WpSignoffBarProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const { data: signoffTypes = [] } = useWorkflowSignoffTypes(entityType);
  const signMutation = useManualSign();
  const unsignMutation = useUnsign();

  // Filter signoffs for this entity
  const entitySignoffs = React.useMemo(
    () =>
      signoffs.filter(
        (s) => s.entityType === entityType && s.entityId === entityId,
      ),
    [signoffs, entityType, entityId],
  );

  // Build flat list of slots: expand each type into N rounds
  const slots = React.useMemo<SignoffSlot[]>(() => {
    const result: SignoffSlot[] = [];

    for (const info of signoffTypes) {
      const baseLabel = SIGNOFF_TYPE_LABELS[info.type] ?? info.type;

      // All items (including invalidated) for popover detail
      const allItems = entitySignoffs.filter(
        (s) => s.signoffType === info.type,
      );

      for (let round = 0; round < info.count; round++) {
        const order = round + 1;
        const roundLabel = info.count > 1 ? `${baseLabel} ${order}` : baseLabel;

        // Match active signoff by type + order
        const signoff =
          entitySignoffs.find(
            (s) =>
              s.signoffType === info.type &&
              s.signoffOrder === order &&
              !s.invalidatedAt,
          ) ?? null;

        result.push({
          key: `${info.type}-${order}`,
          signoffType: info.type,
          signoffOrder: order,
          label: roundLabel,
          signoff,
          allItems,
        });
      }
    }

    return result;
  }, [signoffTypes, entitySignoffs]);

  // Compute canSign / canUnsign for each slot
  const slotActions = React.useMemo(() => {
    return slots.map((slot) => {
      const isSigned = !!slot.signoff;
      const slotLevel = SIGNOFF_LEVEL[slot.signoffType] ?? 0;

      // canSign: not yet signed AND all lower-level slots are signed
      let canSign = !isSigned;
      if (canSign && slotLevel > 0) {
        for (const other of slots) {
          const otherLevel = SIGNOFF_LEVEL[other.signoffType] ?? 0;
          if (otherLevel < slotLevel && !other.signoff) {
            canSign = false;
            break;
          }
        }
      }

      // canUnsign: signed AND user is owner AND no higher-level slot is signed
      let canUnsign = isSigned && slot.signoff?.userId === currentUserId;
      let lockReason: string | null = null;
      if (canUnsign) {
        for (const other of slots) {
          if (other.key === slot.key) continue;
          if (!other.signoff) continue;
          const otherLevel = SIGNOFF_LEVEL[other.signoffType] ?? 0;
          if (otherLevel > slotLevel) {
            canUnsign = false;
            lockReason = "Cần gỡ chữ ký cấp cao hơn trước";
            break;
          }
          if (
            otherLevel === slotLevel &&
            other.signoffOrder > slot.signoffOrder
          ) {
            canUnsign = false;
            lockReason = "Cần gỡ chữ ký cấp cao hơn trước";
            break;
          }
        }
      }

      return { canSign, canUnsign, lockReason };
    });
  }, [slots, currentUserId]);

  const handleSign = (slot: SignoffSlot) => {
    signMutation.mutate({
      entityType,
      entityId,
      engagementId,
      signoffType: slot.signoffType,
      signoffOrder: slot.signoffOrder,
    });
  };

  const handleUnsign = (slot: SignoffSlot) => {
    unsignMutation.mutate({
      entityType,
      entityId,
      engagementId,
      signoffType: slot.signoffType,
      signoffOrder: slot.signoffOrder,
    });
  };

  if (slots.length === 0 && !actions) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1 border-b px-4 py-1.5",
        !compact && "bg-muted/30",
      )}
    >
      {slots.map((slot, idx) => {
        const isSigned = !!slot.signoff;
        const { canSign, canUnsign, lockReason } = slotActions[idx];

        return (
          <React.Fragment key={slot.key}>
            {idx > 0 && <div className="mx-1 h-4 w-px bg-border" />}
            <SignoffStep
              label={slot.label}
              items={slot.allItems}
              latest={slot.signoff}
              isSigned={isSigned}
              currentVersion={currentVersion}
              onViewVersion={onViewVersion}
              canSign={canSign}
              canUnsign={canUnsign}
              lockReason={lockReason}
              onSign={() => handleSign(slot)}
              onUnsign={() => handleUnsign(slot)}
              isSignPending={signMutation.isPending}
              isUnsignPending={unsignMutation.isPending}
            />
          </React.Fragment>
        );
      })}
      {(actions || editButton) && (
        <>
          <div className="flex-1" />
          {actions}
          {editButton}
        </>
      )}
    </div>
  );
}

// ── Individual signoff step (compact + popover) ──

function SignoffStep({
  label,
  items,
  latest,
  isSigned,
  currentVersion,
  onViewVersion,
  canSign,
  canUnsign,
  lockReason,
  onSign,
  onUnsign,
  isSignPending,
  isUnsignPending,
}: {
  label: string;
  items: WpSignoff[];
  latest: WpSignoff | null;
  isSigned: boolean;
  currentVersion: number;
  onViewVersion?: (version: number) => void;
  canSign: boolean;
  canUnsign: boolean;
  lockReason: string | null;
  onSign: () => void;
  onUnsign: () => void;
  isSignPending: boolean;
  isUnsignPending: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            title={label}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-muted cursor-pointer"
          />
        }
      >
        {isSigned ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Circle className="h-3.5 w-3.5 text-foreground/40" />
        )}

        <span
          className={cn(
            "font-medium",
            isSigned ? "text-foreground" : "text-foreground/50",
          )}
        >
          {label}
        </span>

        {latest && isSigned ? (
          <>
            <Avatar size="sm" className="size-4">
              {latest.user.avatarUrl && (
                <AvatarImage src={latest.user.avatarUrl} />
              )}
              <AvatarFallback className="text-[9px]">
                {getInitials(latest.user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-foreground/70 max-w-[80px] truncate">
              {latest.user.name.split(" ").pop()}
            </span>
          </>
        ) : (
          <span className="text-foreground/50 border-b border-dashed border-foreground/20 pb-px">
            Chưa có
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="start" className="w-64 p-0">
        <SignoffDetail
          label={label}
          items={items}
          currentVersion={currentVersion}
          onViewVersion={onViewVersion}
          canSign={canSign}
          canUnsign={canUnsign}
          lockReason={lockReason}
          onSign={onSign}
          onUnsign={onUnsign}
          isSignPending={isSignPending}
          isUnsignPending={isUnsignPending}
        />
      </PopoverContent>
    </Popover>
  );
}

// ── Popover detail — lightweight vertical timeline ──

function SignoffDetail({
  label,
  items,
  currentVersion,
  onViewVersion,
  canSign,
  canUnsign,
  lockReason,
  onSign,
  onUnsign,
  isSignPending,
  isUnsignPending,
}: {
  label: string;
  items: WpSignoff[];
  currentVersion: number;
  onViewVersion?: (version: number) => void;
  canSign: boolean;
  canUnsign: boolean;
  lockReason: string | null;
  onSign: () => void;
  onUnsign: () => void;
  isSignPending: boolean;
  isUnsignPending: boolean;
}) {
  return (
    <div className="px-3 py-2.5 space-y-2 min-w-[220px]">
      {/* Header: label + action */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
          {label}
        </span>
        {canSign && (
          <button
            type="button"
            className="text-[11px] font-medium text-primary hover:underline cursor-pointer disabled:opacity-50"
            onClick={onSign}
            disabled={isSignPending}
          >
            Ký xác nhận
          </button>
        )}
        {canUnsign && (
          <button
            type="button"
            className="text-[11px] font-medium text-destructive hover:underline cursor-pointer disabled:opacity-50"
            onClick={onUnsign}
            disabled={isUnsignPending}
          >
            Gỡ chữ ký
          </button>
        )}
        {!canSign && !canUnsign && lockReason && (
          <span title={lockReason}>
            <Lock className="h-3 w-3 text-muted-foreground" />
          </span>
        )}
      </div>

      {/* Timeline entries */}
      {items.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">Chưa có chữ ký</p>
      ) : (
        <div className="relative pl-4">
          {/* Timeline line */}
          {items.length > 1 && (
            <div className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-border" />
          )}
          {items.map((s) => {
            const inv = !!s.invalidatedAt;
            const isCurrent = s.version != null && s.version === currentVersion;

            return (
              <div key={s.id} className="relative flex gap-2 pb-2 last:pb-0">
                {/* Timeline dot */}
                <div
                  className={cn(
                    "absolute -left-4 top-1 size-[10px] rounded-full border-2 bg-background shrink-0",
                    inv ? "border-orange-400" : "border-green-500",
                  )}
                />
                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Avatar size="sm" className="size-4">
                      {s.user.avatarUrl && (
                        <AvatarImage src={s.user.avatarUrl} />
                      )}
                      <AvatarFallback className="text-[8px]">
                        {getInitials(s.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "text-xs font-medium truncate",
                        inv && "line-through text-muted-foreground",
                      )}
                    >
                      {s.user.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatTime(s.signedAt)}
                    </span>
                  </div>
                  {/* Version + invalidation on one line */}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {s.version != null && (
                      <>
                        {!isCurrent && onViewVersion ? (
                          <button
                            type="button"
                            className="text-[10px] text-primary hover:underline cursor-pointer"
                            onClick={() => onViewVersion(s.version!)}
                          >
                            v{s.version}
                          </button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">
                            v{s.version}
                            {isCurrent && " (hiện tại)"}
                          </span>
                        )}
                      </>
                    )}
                    {inv && (
                      <span className="text-[10px] text-orange-500">
                        Hủy {formatTime(s.invalidatedAt!)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}
