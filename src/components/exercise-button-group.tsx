"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import useWorkoutData from "./workout/hooks/use-workout-data";
import type { DBExercise, DBSet, DBWorkout } from "~/server/db/schema";
import useWorkoutMutations from "./workout/hooks/use-workout-mutations";

type ExerciseButtonGroupProps = {
  workout: DBWorkout;
  exercises: DBExercise[];
  sets: DBSet[];
  exercise: DBExercise;
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
  return (
    <div className="mt-8 flex items-center justify-center">
      <Button
        variant={"outline"}
        className="w-1/4 rounded-none rounded-l-lg"
        onClick={() => handleAddSet(exercise.id)}
        disabled={workout.completed}
      >
        new set
      </Button>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant={"outline"}
            className="w-1/4 rounded-none rounded-r-lg"
            disabled={workout.completed}
          >
            add note
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              how did you feel during this exercise?
            </DialogTitle>
            <DialogDescription>
              in the future, this will be taken into account when
              pregenerating your next workouts.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            id="notes"
            value={exerciseNote}
            onChange={(e) =>
              handleUpdateExerciseNote(exercise.id, e.target.value)
            }
            placeholder={`felt great today, hit a PR on my top set...`}
            disabled={workout.completed}
          />
          <DialogFooter>
            <DialogClose asChild>
              <div className="space-x-2">
                <Button type="button" variant="secondary">
                  close
                </Button>
                <Button
                  type="submit"
                  onClick={() => handleSaveExerciseNote(exercise.id)}
                  disabled={workout.completed || isSavingNote}
                >
                  {isSavingNote ? "saving..." : "save note"}
                </Button>
              </div>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}