"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

interface ScoreButtonGroupProps {
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  labels?: Record<number, string>;
  className?: string;
}

export function ScoreButtonGroup({
  value,
  onChange,
  min = 1,
  max = 5,
  labels,
  className,
}: ScoreButtonGroupProps) {
  const scores = React.useMemo(() => {
    const arr: number[] = [];
    for (let i = min; i <= max; i++) arr.push(i);
    return arr;
  }, [min, max]);

  return (
    <ButtonGroup className={cn("w-full", className)}>
      {scores.map((score) => {
        const isSelected = value === score;
        return (
          <Button
            key={score}
            type="button"
            variant={isSelected ? "default" : "outline"}
            className={cn("flex-1", !isSelected && "text-muted-foreground")}
            onClick={() => onChange(score)}
          >
            {labels?.[score] ?? score}
          </Button>
        );
      })}
    </ButtonGroup>
  );
}
