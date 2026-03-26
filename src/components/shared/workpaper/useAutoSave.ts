import { useRef, useCallback, useEffect, useState } from "react";
import type { JSONContent } from "@tiptap/react";
import { useSystemSetting } from "@/features/settings/hooks/useSystemSettings";

// =============================================================================
// AUTO-SAVE HOOK
// =============================================================================

export type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

const LOCAL_STORAGE_PREFIX = "wp-autosave:";
const DEFAULT_INTERVAL_MS = 3000;
const SAVED_DISPLAY_MS = 2000; // how long "Saved" text stays visible

interface UseAutoSaveOptions {
  /** Unique key for localStorage backup (e.g. "procedure:abc123") */
  storageKey: string;
  /** The save function — returns a promise */
  onSave: (content: JSONContent) => Promise<void>;
  /** If true, auto-save is disabled (e.g. read-only mode) */
  disabled?: boolean;
}

interface UseAutoSaveReturn {
  /** Current auto-save status */
  status: AutoSaveStatus;
  /** Timestamp of last successful save (null if never saved) */
  lastSavedAt: Date | null;
  /** Call when editor content changes */
  onContentChange: (content: JSONContent) => void;
  /** Force an immediate save (e.g. Cmd+S) */
  saveNow: () => void;
  /** Recover content from localStorage if available */
  recoverContent: () => JSONContent | null;
  /** Clear the localStorage backup */
  clearBackup: () => void;
}

export function useAutoSave({
  storageKey,
  onSave,
  disabled = false,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const { data: intervalMs } = useSystemSetting<number>(
    "editor.autoSaveIntervalMs",
  );
  const debounceMs = intervalMs ?? DEFAULT_INTERVAL_MS;

  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const latestContent = useRef<JSONContent | null>(null);
  const lastSavedContent = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const lsKey = LOCAL_STORAGE_PREFIX + storageKey;

  // Backup to localStorage
  const backup = useCallback(
    (content: JSONContent) => {
      try {
        localStorage.setItem(lsKey, JSON.stringify(content));
      } catch {
        // Storage full or unavailable — ignore
      }
    },
    [lsKey],
  );

  // Perform the actual save
  const doSave = useCallback(async () => {
    const content = latestContent.current;
    if (!content) return;

    const serialized = JSON.stringify(content);
    // Skip if content hasn't changed since last save
    if (serialized === lastSavedContent.current) return;

    setStatus("saving");
    try {
      await onSaveRef.current(content);
      lastSavedContent.current = serialized;
      setLastSavedAt(new Date());
      // Clear localStorage backup on successful save
      try {
        localStorage.removeItem(lsKey);
      } catch {
        // ignore
      }
      setStatus("saved");
      // Reset to idle after display timeout
      clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => {
        setStatus("idle");
      }, SAVED_DISPLAY_MS);
    } catch {
      setStatus("error");
    }
  }, [lsKey]);

  // Content change handler — debounce the save
  const onContentChange = useCallback(
    (content: JSONContent) => {
      latestContent.current = content;
      backup(content);

      if (disabled) return;

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        doSave();
      }, debounceMs);
    },
    [debounceMs, disabled, doSave, backup],
  );

  // Force immediate save (Cmd+S)
  const saveNow = useCallback(() => {
    if (disabled) return;
    clearTimeout(timerRef.current);
    doSave();
  }, [disabled, doSave]);

  // Recover from localStorage
  const recoverContent = useCallback((): JSONContent | null => {
    try {
      const raw = localStorage.getItem(lsKey);
      if (raw) return JSON.parse(raw) as JSONContent;
    } catch {
      // Corrupt data — ignore
    }
    return null;
  }, [lsKey]);

  // Clear backup
  const clearBackup = useCallback(() => {
    try {
      localStorage.removeItem(lsKey);
    } catch {
      // ignore
    }
  }, [lsKey]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(savedTimerRef.current);
    };
  }, []);

  // Save on beforeunload if there's unsaved content
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (latestContent.current) {
        backup(latestContent.current);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [backup]);

  return {
    status,
    lastSavedAt,
    onContentChange,
    saveNow,
    recoverContent,
    clearBackup,
  };
}
