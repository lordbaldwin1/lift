import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { completeWorkoutAction, createExercise, createSet, deleteExerciseAction, deleteSetAction, updateExerciseNoteAction, updateSetAction, updateSetOrderAction } from "~/server/actions/workout-actions";
import type { DBExercise, DBSet, ExerciseWithSelection } from "~/server/db/schema";

type UseWorkoutMutationsProps = {
    userId: string;
    workoutId: string;
    exercises: ExerciseWithSelection[];
    sets: DBSet[];
}

export default function useWorkoutMutations({
    userId,
    workoutId,
    exercises,
    sets,
}: UseWorkoutMutationsProps) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const addExerciseMutation = useMutation({
        mutationFn: async (params: { exerciseSelectionId: string; order: number, name: string }) => {
          return await createExercise(userId, params.order, workoutId, params.exerciseSelectionId);
        },
        onMutate: async ({ exerciseSelectionId, order, name }) => {
          await queryClient.cancelQueries({ queryKey: ["exercises", workoutId] });
          const previousExercises = queryClient.getQueryData<ExerciseWithSelection[]>(["exercises", workoutId]);
    
          queryClient.setQueryData<ExerciseWithSelection[]>(["exercises", workoutId], (old = []) => {
            const newExercise: ExerciseWithSelection = {
              id: `temp-${Date.now()}`,
              order,
              workoutId,
              note: null,
              repLowerBound: null,
              repUpperBound: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              exerciseSelectionId,
              exerciseSelection: {
                id: "temp",
                name,
                category: null,
                primaryMuscleGroup: "general",
                secondaryMuscleGroup: null,
              },
            };
            const updated = [...old];
            updated.splice(order, 0, newExercise);
            return updated.map((ex, idx) => ({ ...ex, order: idx }));
          });
    
          return { previousExercises };
        },
        onError: (err, _, context) => {
          if (context?.previousExercises) {
            queryClient.setQueryData(["exercises", workoutId], context.previousExercises);
          }
          toast.error(`Failed to add exercise: ${err.message}`);
        },
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ["exercises", workoutId] });
        },
      });
    
      const deleteExerciseMutation = useMutation({
        mutationFn: async (exerciseId: string) => {
          return await deleteExerciseAction(userId, exerciseId);
        },
        onMutate: async (exerciseId) => {
          await queryClient.cancelQueries({ queryKey: ["exercises", workoutId] });
          const previousExercises = queryClient.getQueryData<ExerciseWithSelection[]>(["exercises", workoutId]);
    
          queryClient.setQueryData<ExerciseWithSelection[]>(["exercises", workoutId], (old = []) => {
            return old.filter(ex => ex.id !== exerciseId).map((ex, idx) => ({ ...ex, order: idx }));
          });
    
          return { previousExercises };
        },
        onError: (err, _, context) => {
          if (context?.previousExercises) {
            queryClient.setQueryData(["exercises", workoutId], context.previousExercises);
          }
          toast.error(`Failed to delete exercise: ${err.message}`);
        },
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ["exercises", workoutId] });
          await queryClient.invalidateQueries({ queryKey: ["sets", workoutId] });
        },
      });
    
      const updateExerciseNoteMutation = useMutation({
        mutationFn: async (params: { exerciseId: string; note: string | null }) => {
          return await updateExerciseNoteAction(userId, params.exerciseId, params.note);
        },
        onMutate: async ({ exerciseId, note }) => {
          await queryClient.cancelQueries({ queryKey: ["exercises", workoutId] });
          const previousExercises = queryClient.getQueryData<ExerciseWithSelection[]>(["exercises", workoutId]);
    
          queryClient.setQueryData<ExerciseWithSelection[]>(["exercises", workoutId], (old = []) => {
            return old.map(ex => ex.id === exerciseId ? { ...ex, note } : ex);
          });
    
          return { previousExercises };
        },
        onError: (err, _, context) => {
          if (context?.previousExercises) {
            queryClient.setQueryData(["exercises", workoutId], context.previousExercises);
          }
          toast.error(`Failed to save note: ${err.message}`);
        },
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ["exercises", workoutId] });
        },
      });
    
      const addSetMutation = useMutation({
        mutationFn: async (params: { exerciseId: string; order: number }) => {
          const exercise = exercises.find(ex => ex.id === params.exerciseId);
          if (!exercise) throw new Error("Exercise not found");
          return await createSet(userId, exercise, params.order);
        },
        onMutate: async ({ exerciseId, order }) => {
          await queryClient.cancelQueries({ queryKey: ["sets", workoutId] });
          const previousSets = queryClient.getQueryData<DBSet[]>(["sets", workoutId]);
    
          queryClient.setQueryData<DBSet[]>(["sets", workoutId], (old = []) => {
            const newSet: DBSet = {
              id: `temp-${Date.now()}`,
              exerciseId,
              order,
              reps: null,
              weight: null,
              targetReps: null,
              targetWeight: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            return [...old, newSet];
          });
    
          return { previousSets };
        },
        onError: (err, _, context) => {
          if (context?.previousSets) {
            queryClient.setQueryData(["sets", workoutId], context.previousSets);
          }
          toast.error(`Failed to add set: ${err.message}`);
        },
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ["sets", workoutId] });
        },
      });
    
      const deleteSetMutation = useMutation({
        mutationFn: async (setId: string) => {
          return await deleteSetAction(userId, setId);
        },
        onMutate: async (setId) => {
          await queryClient.cancelQueries({ queryKey: ["sets", workoutId] });
          const previousSets = queryClient.getQueryData<DBSet[]>(["sets", workoutId]);
    
          queryClient.setQueryData<DBSet[]>(["sets", workoutId], (old = []) => {
            const setToDelete = old.find(s => s.id === setId);
            if (!setToDelete) return old;
    
            return old
              .filter(s => s.id !== setId)
              .map(s => s.exerciseId === setToDelete.exerciseId && s.order > setToDelete.order
                ? { ...s, order: s.order - 1 }
                : s
              );
          });
    
          return { previousSets };
        },
        onError: (err, _, context) => {
          if (context?.previousSets) {
            queryClient.setQueryData(["sets", workoutId], context.previousSets);
          }
          toast.error(`Failed to delete set: ${err.message}`);
        },
        onSuccess: async (deletedSet) => {
          const remainingSets = sets.filter(s =>
            s.exerciseId === deletedSet?.exerciseId && s.id !== deletedSet?.id
          );
    
          for (const [index, set] of remainingSets.entries()) {
            if (set.order !== index) {
              await updateSetOrderAction(userId, set.id, index);
            }
          }
    
          await queryClient.invalidateQueries({ queryKey: ["sets", workoutId] });
        },
      });
    
      const updateSetMutation = useMutation({
        mutationFn: async (set: DBSet) => {
          return await updateSetAction(userId, set);
        },
        onMutate: async (updatedSet) => {
          await queryClient.cancelQueries({ queryKey: ["sets", workoutId] });
          const previousSets = queryClient.getQueryData<DBSet[]>(["sets", workoutId]);
    
          queryClient.setQueryData<DBSet[]>(["sets", workoutId], (old = []) => {
            return old.map(s => s.id === updatedSet.id ? updatedSet : s);
          });
    
          return { previousSets };
        },
        onError: (err, _, context) => {
          if (context?.previousSets) {
            queryClient.setQueryData(["sets", workoutId], context.previousSets);
          }
          toast.error(`Failed to update set: ${err.message}`);
        },
      });
    
      const completeWorkoutMutation = useMutation({
        mutationFn: async (date: Date) => {
          return await completeWorkoutAction(userId, workoutId, date);
        },
        onSuccess: () => {
          router.push(`/workout/completed/${workoutId}`);
        },
        onError: (err) => {
          toast.error(`Failed to complete workout: ${err.message}`);
        },
      });
    
      return {
        addExerciseMutation,
        deleteExerciseMutation,
        updateExerciseNoteMutation,
        addSetMutation,
        deleteSetMutation,
        updateSetMutation,
        completeWorkoutMutation,
      }
}

