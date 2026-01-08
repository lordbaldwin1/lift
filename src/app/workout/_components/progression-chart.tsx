"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { X } from "lucide-react";
import { cn } from "~/lib/utils";
import { useProgressionData, type TimeRange } from "../_hooks/use-progression-data";
import { useTrackedExercises } from "../_hooks/use-tracked-exercises";
import type { ProgressionDataPoint, TrackedExerciseWithSelection } from "~/server/db/queries";
import TimeRangeSelector from "./time-range-selector";
import ProgressionLineChart from "./progression-line-chart";
import AddTrackedExerciseDialog from "./add-tracked-exercise-dialog";

type TabValue = "muscleGroups" | string; // string for exercise selection IDs

type ProgressionChartProps = {
  initialProgressionData: ProgressionDataPoint[];
  initialTrackedExercises: TrackedExerciseWithSelection[];
};

export default function ProgressionChart({
  initialProgressionData,
  initialTrackedExercises,
}: ProgressionChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("3m");
  const [activeTab, setActiveTab] = useState<TabValue>("muscleGroups");

  const {
    trackedExercises,
    addTrackedExercise,
    removeTrackedExercise,
    isAddingTracked,
  } = useTrackedExercises({ initialData: initialTrackedExercises });

  const selectedExerciseId = activeTab !== "muscleGroups" ? activeTab : undefined;

  const { data: progressionResponse, isLoading } = useProgressionData({
    initialData: initialProgressionData,
    timeRange,
    exerciseSelectionId: selectedExerciseId,
  });

  const handleRemoveTrackedExercise = (id: string) => {
    removeTrackedExercise(id);
    if (activeTab === trackedExercises.find((t) => t.id === id)?.exerciseSelectionId) {
      setActiveTab("muscleGroups");
    }
  };

  const selectedExercise = trackedExercises.find(
    (t) => t.exerciseSelectionId === selectedExerciseId
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Strength Progression
          </CardTitle>
          <TimeRangeSelector
            selectedRange={timeRange}
            onRangeChange={setTimeRange}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Button
            variant={activeTab === "muscleGroups" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("muscleGroups")}
            className={cn(
              "text-sm",
              activeTab === "muscleGroups" && "bg-secondary"
            )}
          >
            Overview
          </Button>
          {trackedExercises.map((tracked) => (
            <div
              key={tracked.id}
              className={cn(
                "group flex items-center rounded-md transition-colors",
                activeTab === tracked.exerciseSelectionId
                  ? "bg-secondary"
                  : "hover:bg-muted"
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(tracked.exerciseSelectionId)}
                className={cn(
                  "text-sm pr-1 hover:bg-transparent",
                  activeTab === tracked.exerciseSelectionId && "text-foreground"
                )}
              >
                {tracked.exerciseSelection.name}
              </Button>
              <button
                type="button"
                className="h-8 w-6 flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTrackedExercise(tracked.id);
                }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {tracked.exerciseSelection.name}</span>
              </button>
            </div>
          ))}
          <AddTrackedExerciseDialog
            trackedExercises={trackedExercises}
            onAddExercise={addTrackedExercise}
            isAdding={isAddingTracked}
          />
        </div>

        {isLoading ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : progressionResponse?.type === "muscleGroups" ? (
          <ProgressionLineChart
            type="muscleGroups"
            data={progressionResponse.data}
          />
        ) : progressionResponse?.type === "exercise" && selectedExercise ? (
          <ProgressionLineChart
            type="exercise"
            data={progressionResponse.data}
            exerciseName={selectedExercise.exerciseSelection.name}
          />
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <p>Select a time range to view progression data.</p>
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            Estimated 1RM calculated using the Epley formula: weight × (1 + reps ÷ 30)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

