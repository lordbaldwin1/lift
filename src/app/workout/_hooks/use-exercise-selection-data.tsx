import { useQuery } from "@tanstack/react-query";
import type { ExerciseSelection } from "~/server/db/schema";


export default function useExerciseSelectionData() {
  const { data: exerciseSelections = [], isLoading, error } = useQuery({
    queryKey: ["exerciseSelections"],
    queryFn: () => fetchExerciseSelections(),
  });

  return exerciseSelections;
}

async function fetchExerciseSelections() {
  const response = await fetch("/api/workouts/selections");
  if (!response.ok) {
    throw new Error("Failed to fetch selections");
  }
  return (await response.json()) as ExerciseSelection[];
}

