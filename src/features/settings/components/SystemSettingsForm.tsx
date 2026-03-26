"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  useSystemSettings,
  useUpdateSystemSettings,
} from "../hooks/useSystemSettings";

const AUTO_SAVE_KEY = "editor.autoSaveIntervalMs";
const AUTO_SAVE_MIN = 1000;
const AUTO_SAVE_MAX = 30000;
const AUTO_SAVE_STEP = 1000;
const AUTO_SAVE_DEFAULT = 3000;

export function SystemSettingsForm() {
  const { data: settings, isLoading } = useSystemSettings();
  const updateMutation = useUpdateSystemSettings();

  const [autoSaveMs, setAutoSaveMs] = React.useState<number>(AUTO_SAVE_DEFAULT);
  const [isDirty, setIsDirty] = React.useState(false);

  // Sync from server
  React.useEffect(() => {
    if (settings && AUTO_SAVE_KEY in settings) {
      const val = Number(settings[AUTO_SAVE_KEY]) || AUTO_SAVE_DEFAULT;
      setAutoSaveMs(val);
    }
  }, [settings]);

  const handleSliderChange = (value: number | readonly number[]) => {
    const v = typeof value === "number" ? value : value[0];
    setAutoSaveMs(v);
    setIsDirty(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) {
      setAutoSaveMs(Math.max(AUTO_SAVE_MIN, Math.min(AUTO_SAVE_MAX, val)));
      setIsDirty(true);
    }
  };

  const handleSave = async () => {
    await updateMutation.mutateAsync({ [AUTO_SAVE_KEY]: autoSaveMs });
    setIsDirty(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
        <Loader2 className="h-4 w-4 animate-spin" />
        Đang tải cài đặt...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-lg font-semibold">Trình soạn thảo</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Cấu hình trình soạn thảo tài liệu làm việc.
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="auto-save-interval">
            Khoảng thời gian tự động lưu
          </Label>
          <p className="text-xs text-muted-foreground">
            Nội dung sẽ được tự động lưu sau khi ngừng gõ trong khoảng thời gian
            này. Giá trị từ 1 đến 30 giây.
          </p>
          <div className="flex items-center gap-4">
            <Slider
              value={[autoSaveMs]}
              onValueChange={handleSliderChange}
              min={AUTO_SAVE_MIN}
              max={AUTO_SAVE_MAX}
              step={AUTO_SAVE_STEP}
              className="flex-1"
            />
            <div className="flex items-center gap-1.5 shrink-0">
              <Input
                id="auto-save-interval"
                type="number"
                value={autoSaveMs / 1000}
                onChange={(e) => {
                  const sec = Number(e.target.value);
                  if (!isNaN(sec)) {
                    const ms = Math.max(
                      AUTO_SAVE_MIN,
                      Math.min(AUTO_SAVE_MAX, sec * 1000),
                    );
                    setAutoSaveMs(ms);
                    setIsDirty(true);
                  }
                }}
                min={AUTO_SAVE_MIN / 1000}
                max={AUTO_SAVE_MAX / 1000}
                step={1}
                className="w-16 h-8 text-sm text-center"
              />
              <span className="text-sm text-muted-foreground">giây</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!isDirty || updateMutation.isPending}
          size="sm"
        >
          {updateMutation.isPending && (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          )}
          Lưu cài đặt
        </Button>
      </div>
    </div>
  );
}
