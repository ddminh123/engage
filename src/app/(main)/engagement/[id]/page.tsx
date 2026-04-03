"use client";

import { Suspense, useCallback, useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEngagement } from "@/features/engagement/hooks/useEngagements";
import { EngagementDetailLayout } from "@/features/engagement/components/detail";
import { ProcedureWorkpaperOverlay } from "@/features/engagement/components/work-program/ProcedureWorkpaperOverlay";
import { PlanningWorkpaperOverlay } from "@/features/engagement/components/tabs/PlanningWorkpaperOverlay";
import type { EngagementProcedure } from "@/features/engagement/types";
import type { MultiSelectOption } from "@/components/shared/MultiSelectCommand";
import {
  useWpAssignments,
  useWpSignoffs,
  useAddWpAssignment,
  useRemoveWpAssignment,
} from "@/features/engagement/hooks/useEngagements";
import {
  usePlanningWorkpapers,
  useGetOrCreatePlanningWorkpaper,
} from "@/features/engagement/hooks/usePlanningWorkpapers";
import * as React from "react";

function EngagementDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const engagementId = params.id as string;

  // ── Procedure WP overlay state (React state is source of truth, URL is synced) ──
  const initialWpId = searchParams.get("wp");
  const [activeWpId, setActiveWpId] = useState<string | null>(initialWpId);
  const didPushRef = useRef(false);

  // ── Planning WP overlay state ──
  const initialPwpId = searchParams.get("pwp");
  const [activePwpStepId, setActivePwpStepId] = useState<string | null>(
    initialPwpId,
  );
  const didPushPwpRef = useRef(false);

  const { data: engagement, isLoading } = useEngagement(engagementId);
  const { data: wpAssignments = [] } = useWpAssignments(engagementId);
  const { data: wpSignoffs = [] } = useWpSignoffs(engagementId);
  const addAssignment = useAddWpAssignment();
  const removeAssignment = useRemoveWpAssignment();
  const { data: planningWorkpapers = [] } = usePlanningWorkpapers(engagementId);
  const getOrCreatePwp = useGetOrCreatePlanningWorkpaper(engagementId);

  // Open WP: set state + push browser history (URL becomes shareable)
  const handleOpenWorkpaper = useCallback((procedureId: string) => {
    setActiveWpId(procedureId);
    // Build new URL preserving current params and adding wp
    const url = new URL(window.location.href);
    url.searchParams.set("wp", procedureId);
    window.history.pushState({ wp: procedureId }, "", url.toString());
    didPushRef.current = true;
  }, []);

  // Close WP: clear state + navigate back in browser history
  const handleCloseWorkpaper = useCallback(() => {
    setActiveWpId(null);
    if (didPushRef.current) {
      window.history.back();
      didPushRef.current = false;
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete("wp");
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  // Open Planning WP: lazy-create if needed, then set state + push URL
  const handleOpenPlanningWp = useCallback(
    (stepConfigId: string) => {
      // Check if workpaper already exists for this step
      const existing = planningWorkpapers.find(
        (wp) => wp.stepConfigId === stepConfigId,
      );
      if (existing) {
        setActivePwpStepId(stepConfigId);
        const url = new URL(window.location.href);
        url.searchParams.set("pwp", stepConfigId);
        window.history.pushState({ pwp: stepConfigId }, "", url.toString());
        didPushPwpRef.current = true;
      } else {
        // Lazy create
        getOrCreatePwp.mutate(stepConfigId, {
          onSuccess: () => {
            setActivePwpStepId(stepConfigId);
            const url = new URL(window.location.href);
            url.searchParams.set("pwp", stepConfigId);
            window.history.pushState({ pwp: stepConfigId }, "", url.toString());
            didPushPwpRef.current = true;
          },
        });
      }
    },
    [planningWorkpapers, getOrCreatePwp],
  );

  // Close Planning WP
  const handleClosePlanningWp = useCallback(() => {
    setActivePwpStepId(null);
    if (didPushPwpRef.current) {
      window.history.back();
      didPushPwpRef.current = false;
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete("pwp");
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  // Listen for browser back/forward to sync state
  useEffect(() => {
    const handlePopState = () => {
      const url = new URL(window.location.href);
      setActiveWpId(url.searchParams.get("wp"));
      setActivePwpStepId(url.searchParams.get("pwp"));
      didPushRef.current = false;
      didPushPwpRef.current = false;
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Find procedure from engagement data for workpaper view
  const procedure = React.useMemo<EngagementProcedure | null>(() => {
    if (!engagement || !activeWpId) return null;
    for (const sec of engagement.sections) {
      for (const proc of sec.procedures) {
        if (proc.id === activeWpId) return proc;
      }
      for (const obj of sec.objectives) {
        for (const proc of obj.procedures) {
          if (proc.id === activeWpId) return proc;
        }
      }
    }
    for (const obj of engagement.standaloneObjectives ?? []) {
      for (const proc of obj.procedures) {
        if (proc.id === activeWpId) return proc;
      }
    }
    for (const proc of engagement.ungroupedProcedures ?? []) {
      if (proc.id === activeWpId) return proc;
    }
    return null;
  }, [engagement, activeWpId]);

  // Build RCM reference options from engagement risks
  const controlOptions = React.useMemo<MultiSelectOption[]>(() => {
    if (!engagement) return [];
    const controls: MultiSelectOption[] = [];
    for (const risk of engagement.risks ?? []) {
      for (const ctrl of risk.controls ?? []) {
        controls.push({ value: ctrl.id, label: ctrl.description ?? ctrl.id });
      }
    }
    return controls;
  }, [engagement]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!engagement) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-muted-foreground">
        Không tìm thấy cuộc kiểm toán.
      </div>
    );
  }

  // Always render the detail layout, overlay workpaper on top if activeWpId is present
  return (
    <>
      <EngagementDetailLayout
        engagement={engagement}
        onOpenWorkpaper={handleOpenWorkpaper}
        onOpenPlanningWp={handleOpenPlanningWp}
      />

      {/* Procedure workpaper overlay */}
      {activeWpId && procedure && (
        <ProcedureWorkpaperOverlay
          procedure={procedure}
          engagementId={engagementId}
          onClose={handleCloseWorkpaper}
          controlOptions={controlOptions}
          members={engagement.members ?? []}
          wpAssignments={wpAssignments}
          wpSignoffs={wpSignoffs}
          onAssign={(entityType, entityId, userId) =>
            addAssignment.mutate({
              engagementId,
              entityType,
              entityId,
              userIds: [userId],
            })
          }
          onUnassign={(entityType, entityId, userId) =>
            removeAssignment.mutate({
              engagementId,
              entityType,
              entityId,
              userId,
            })
          }
        />
      )}

      {/* Planning workpaper overlay */}
      {activePwpStepId &&
        (() => {
          const pwp = planningWorkpapers.find(
            (wp) => wp.stepConfigId === activePwpStepId,
          );
          if (!pwp) return null;
          return (
            <PlanningWorkpaperOverlay
              workpaper={pwp}
              engagementId={engagementId}
              stepTitle={pwp.stepConfig?.title ?? "Workpaper"}
              stepConfigKey={pwp.stepConfig?.key}
              onClose={handleClosePlanningWp}
              members={engagement.members ?? []}
              auditObjectives={engagement.auditObjectives ?? []}
              wpSignoffs={wpSignoffs}
            />
          );
        })()}
    </>
  );
}

export default function EngagementDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <EngagementDetailContent />
    </Suspense>
  );
}
