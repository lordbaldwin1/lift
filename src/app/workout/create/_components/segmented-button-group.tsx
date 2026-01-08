"use client";

import { cn } from "~/lib/utils";

type SegmentedButtonGroupProps = {
  options: { value: string; label: string }[];
  selectedValue: string | undefined;
  onSelectedValueChange: (value: string) => void;
};

export default function SegmentedButtonGroup({ options, selectedValue, onSelectedValueChange }: SegmentedButtonGroupProps) {
  return (
    <div className="flex w-full rounded-lg bg-muted p-1">
      {options.map((option) => {
        const isSelected = selectedValue === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className={cn(
              "flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200",
              isSelected 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onSelectedValueChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

