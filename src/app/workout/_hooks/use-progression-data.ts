import { useQuery } from "@tanstack/react-query";
import type { ProgressionDataPoint, ExerciseProgressionDataPoint } from "~/server/db/queries";

export type TimeRange = "1m" | "3m" | "6m" | "1y" | "all";

type MuscleGroupProgressionResponse = {
  type: "muscleGroups";
  data: ProgressionDataPoint[];
};

type ExerciseProgressionResponse = {
  type: "exercise";
  data: ExerciseProgressionDataPoint[];
};

type ProgressionResponse = MuscleGroupProgressionResponse | ExerciseProgressionResponse;

type UseProgressionDataProps = {
  initialData?: ProgressionDataPoint[];
  timeRange: TimeRange;
  exerciseSelectionId?: string;
};

export function useProgressionData({
  initialData,
  timeRange,
  exerciseSelectionId,
}: UseProgressionDataProps) {
  const queryKey = exerciseSelectionId
    ? ["progression", "exercise", exerciseSelectionId, timeRange]
    : ["progression", "muscleGroups", timeRange];

  const shouldUseInitialData = !exerciseSelectionId && timeRange === "3m" && initialData;

  return useQuery({
    queryKey,
    queryFn: () => fetchProgressionData(timeRange, exerciseSelectionId),
    initialData: shouldUseInitialData
      ? { type: "muscleGroups" as const, data: initialData }
      : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

async function fetchProgressionData(
  timeRange: TimeRange,
  exerciseSelectionId?: string
): Promise<ProgressionResponse> {
  const params = new URLSearchParams({ range: timeRange });
  if (exerciseSelectionId) {
    params.set("exerciseId", exerciseSelectionId);
  }

  const response = await fetch(`/api/progression?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch progression data");
  }
  return (await response.json()) as ProgressionResponse;
}

