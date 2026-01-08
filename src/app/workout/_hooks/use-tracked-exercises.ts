import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TrackedExerciseWithSelection } from "~/server/db/queries";
import { toast } from "sonner";

type UseTrackedExercisesProps = {
  initialData?: TrackedExerciseWithSelection[];
};

export function useTrackedExercises({ initialData }: UseTrackedExercisesProps = {}) {
  const queryClient = useQueryClient();

  const { data: trackedExercises = [], isLoading, error } = useQuery({
    queryKey: ["trackedExercises"],
    queryFn: fetchTrackedExercises,
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const addTrackedExerciseMutation = useMutation({
    mutationFn: addTrackedExercise,
    onMutate: async (exerciseSelectionId: string) => {
      await queryClient.cancelQueries({ queryKey: ["trackedExercises"] });
      const previousTracked = queryClient.getQueryData<TrackedExerciseWithSelection[]>(["trackedExercises"]);
      return { previousTracked };
    },
    onError: (err, _, context) => {
      if (context?.previousTracked) {
        queryClient.setQueryData(["trackedExercises"], context.previousTracked);
      }
      toast.error(`Failed to add tracked exercise: ${err.message}`);
    },
    onSuccess: () => {
      toast.success("Exercise added to tracking");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["trackedExercises"] });
    },
  });

  const removeTrackedExerciseMutation = useMutation({
    mutationFn: removeTrackedExercise,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["trackedExercises"] });
      const previousTracked = queryClient.getQueryData<TrackedExerciseWithSelection[]>(["trackedExercises"]);
      
      queryClient.setQueryData<TrackedExerciseWithSelection[]>(
        ["trackedExercises"],
        (old = []) => old.filter((t) => t.id !== id)
      );
      
      return { previousTracked };
    },
    onError: (err, _, context) => {
      if (context?.previousTracked) {
        queryClient.setQueryData(["trackedExercises"], context.previousTracked);
      }
      toast.error(`Failed to remove tracked exercise: ${err.message}`);
    },
    onSuccess: () => {
      toast.success("Exercise removed from tracking");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["trackedExercises"] });
    },
  });

  return {
    trackedExercises,
    isLoading,
    error,
    addTrackedExercise: addTrackedExerciseMutation.mutate,
    removeTrackedExercise: removeTrackedExerciseMutation.mutate,
    isAddingTracked: addTrackedExerciseMutation.isPending,
    isRemovingTracked: removeTrackedExerciseMutation.isPending,
  };
}

async function fetchTrackedExercises(): Promise<TrackedExerciseWithSelection[]> {
  const response = await fetch("/api/progression/tracked");
  if (!response.ok) {
    throw new Error("Failed to fetch tracked exercises");
  }
  return (await response.json()) as TrackedExerciseWithSelection[];
}

async function addTrackedExercise(exerciseSelectionId: string): Promise<void> {
  const response = await fetch("/api/progression/tracked", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exerciseSelectionId }),
  });
  if (!response.ok) {
    throw new Error("Failed to add tracked exercise");
  }
}

async function removeTrackedExercise(id: string): Promise<void> {
  const response = await fetch(`/api/progression/tracked/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to remove tracked exercise");
  }
}

