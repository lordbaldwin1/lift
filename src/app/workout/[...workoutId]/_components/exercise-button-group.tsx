"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import useWorkoutData from "../_hooks/use-workout-data";
import type { DBSet, DBWorkout, ExerciseWithSelection } from "~/server/db/schema";
import useWorkoutMutations from "../_hooks/use-workout-mutations";
import { Plus, FileText, Loader2 } from "lucide-react";

type ExerciseButtonGroupProps = {
  workout: DBWorkout;
  exercises: ExerciseWithSelection[];
  sets: DBSet[];
  exercise: ExerciseWithSelection;
}
export default function ExerciseButtonGroup({
  workout,
  exercises,
  sets,
  exercise
}: ExerciseButtonGroupProps) {
  const [localExerciseNotes, setLocalExerciseNotes] = useState<Record<string, string>>({});
  const {
    getSetsForExercise
  } = useWorkoutData({ workoutId: workout.id, initialExercises: exercises, initialSets: sets });
  const {
    addSetMutation,
    updateExerciseNoteMutation,
  } = useWorkoutMutations({ userId: workout.userId, workoutId: workout.id, exercises: exercises, sets: sets });

  function handleAddSet(exerciseId: string) {
    const exerciseSets = getSetsForExercise(exerciseId);
    addSetMutation.mutate({ exerciseId, order: exerciseSets.length });
  }

  function handleUpdateExerciseNote(exerciseId: string, value: string) {
    setLocalExerciseNotes(prev => ({ ...prev, [exerciseId]: value }));
  }

  function handleSaveExerciseNote(exerciseId: string) {
    const note = localExerciseNotes[exerciseId];
    updateExerciseNoteMutation.mutate(
      { exerciseId, note: note ?? null },
      {
        onSuccess: () => {
          setLocalExerciseNotes(prev => {
            const updated = { ...prev };
            delete updated[exerciseId];
            return updated;
          });
        },
      }
    );
  }

  const exerciseNote = localExerciseNotes[exercise.id] ?? exercise.note ?? "";
  const isSavingNote = updateExerciseNoteMutation.isPending &&
    updateExerciseNoteMutation.variables?.exerciseId === exercise.id;
  const isAddingSet = addSetMutation.isPending;
  const isAddingExercise = exercise.id.startsWith("temp-");

  return (
    <div className="flex items-center gap-2 pt-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => handleAddSet(exercise.id)}
        disabled={workout.completed || isAddingExercise || isAddingSet}
      >
        {isAddingSet ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
        Add Set
      </Button>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            disabled={workout.completed}
          >
            <FileText className="h-3.5 w-3.5" />
            {exercise.note ? "Edit Note" : "Add Note"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-tight">
              EXERCISE NOTES
            </DialogTitle>
            <DialogDescription>
              How did you feel during this exercise? This will help personalize future workouts.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            id="notes"
            value={exerciseNote}
            onChange={(e) =>
              handleUpdateExerciseNote(exercise.id, e.target.value)
            }
            placeholder="Felt great today, hit a PR on my top set..."
            disabled={workout.completed}
            className="min-h-[120px]"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={() => handleSaveExerciseNote(exercise.id)}
              disabled={workout.completed || isSavingNote}
            >
              {isSavingNote ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Note"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

