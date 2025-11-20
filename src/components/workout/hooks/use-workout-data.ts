import { useQuery } from "@tanstack/react-query";
import type { DBSet, ExerciseWithSelection } from "~/server/db/schema";

type UseWorkoutDataProps = {
    workoutId: string;
    initialExercises: ExerciseWithSelection[];
    initialSets: DBSet[];
}

export default function useWorkoutData({ workoutId, initialExercises, initialSets }: UseWorkoutDataProps) {

    const { data: exercises = [], isLoading: isLoadingExercises, error: exercisesError } = useQuery({
        queryKey: ["exercises", workoutId],
        queryFn: () => fetchExercises(workoutId),
        initialData: initialExercises,
        staleTime: Infinity,
    });

    const { data: sets = [], isLoading: isLoadingSets, error: setsError } = useQuery({
        queryKey: ["sets", workoutId],
        queryFn: () => fetchSets(workoutId),
        initialData: initialSets,
        staleTime: Infinity,
    });

    function getSetsForExercise(exerciseId: string): DBSet[] {
        return sets.filter(set => set.exerciseId === exerciseId).sort((a, b) => a.order - b.order);
    }

    return {
        exercises,
        sets,
        getSetsForExercise,
        isLoading: isLoadingExercises || isLoadingSets,
        error: exercisesError ?? setsError,
    }
}

async function fetchExercises(workoutId: string) {
    const response = await fetch(`/api/workouts/${workoutId}/exercises`);
    if (!response.ok) {
        throw new Error("Failed to fetch exercises");
    }
    return (await response.json()) as ExerciseWithSelection[];
}

async function fetchSets(workoutId: string) {
    const response = await fetch(`/api/workouts/${workoutId}/sets`);
    if (!response.ok) {
        throw new Error("Failed to fetch sets");
    }
    return (await response.json()) as DBSet[];
}