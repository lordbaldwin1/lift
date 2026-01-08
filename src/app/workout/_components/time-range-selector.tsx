"use client";

import { cn } from "~/lib/utils";
import type { TimeRange } from "../_hooks/use-progression-data";

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "1m", label: "1M" },
  { value: "3m", label: "3M" },
  { value: "6m", label: "6M" },
  { value: "1y", label: "1Y" },
  { value: "all", label: "All" },
];

type TimeRangeSelectorProps = {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
};

export default function TimeRangeSelector({
  selectedRange,
  onRangeChange,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex w-fit rounded-lg bg-muted p-1">
      {TIME_RANGE_OPTIONS.map((option) => {
        const isSelected = selectedRange === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200",
              isSelected
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onRangeChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

