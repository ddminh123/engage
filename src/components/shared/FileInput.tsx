import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import * as React from "react";

export type FileInputProps = {
  id: string;
  multiple?: boolean;
  accept?: string;
  files?: File[];
  onChange?: (files: File[]) => void;
  className?: string;
  placeholder?: string;
  hint?: string;
};

export function FileInput({
  id,
  multiple,
  accept,
  files = [],
  onChange,
  className,
  placeholder = "Kéo thả file vào đây hoặc bấm để chọn",
  hint = "Hỗ trợ tải lên một hoặc nhiều tệp",
}: FileInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    onChange?.(Array.from(list));
  };

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    onChange?.(next);
  };

  const openPicker = () => {
    inputRef.current?.click();
  };

  const formatFileSize = (size: number) => {
    if (size < 1024 * 1024) {
      return `${Math.round(size / 1024)} KB`;
    }
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className={cn("space-y-2.5", className)}>
      <Input
        ref={inputRef}
        id={id}
        type="file"
        multiple={multiple}
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "group relative cursor-pointer rounded-xl border border-dashed px-4 py-3 transition-all outline-none",
          "bg-muted/20 border-border/70 hover:bg-muted/35 hover:border-border",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isDragging && "border-primary bg-primary/5 ring-2 ring-primary/15",
          files.length > 0 && "bg-background",
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-background shadow-sm transition-colors",
              isDragging
                ? "border-primary/40 bg-primary/5"
                : "border-border/70 group-hover:border-border",
            )}
          >
            <Upload
              className={cn(
                "h-4 w-4 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground",
              )}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-foreground">
              {placeholder}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              openPicker();
            }}
          >
            Chọn tệp
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5",
                "bg-background shadow-sm",
              )}
            >
              <div className="min-w-0 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-muted/30">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">
                    {file.name}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                aria-label={`Xóa ${file.name}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
