"use client";

import type {
  DBSet,
  DBWorkout,
  ExerciseWithSelection,
} from "~/server/db/schema";
import ExerciseButtonGroup from "./exercise-button-group";
import { Button } from "~/components/ui/button";
import SetRow from "./set-row";
import useWorkoutData from "../_hooks/use-workout-data";
import { Trash, Dumbbell } from "lucide-react";
import useWorkoutMutations from "../_hooks/use-workout-mutations";

type ExerciseListProps = {
  workout: DBWorkout;
  initialExercises: ExerciseWithSelection[];
  initialSets: DBSet[];
};
export default function ExerciseList({
  workout,
  initialExercises,
  initialSets,
}: ExerciseListProps) {
  
  const { exercises, sets } = useWorkoutData({
    workoutId: workout.id,
    initialExercises,
    initialSets,
  });
  const { getSetsForExercise } = useWorkoutData({
    workoutId: workout.id,
    initialExercises: exercises,
    initialSets: sets,
  });

  const { deleteExerciseMutation } = useWorkoutMutations({
    userId: workout.userId,
    workoutId: workout.id,
    exercises: exercises,
    sets: sets,
  });

  function handleDeleteExercise(exerciseId: string) {
    deleteExerciseMutation.mutate(exerciseId);
  }

  if (exercises.length === 0) {
    return (
      <div className="py-12 text-center">
        <Dumbbell className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground">No exercises yet</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Add an exercise to start tracking</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {exercises.map((exercise, exerciseIdx) => {
        const exerciseSets = getSetsForExercise(exercise.id);
        const isDeleting =
          deleteExerciseMutation.isPending &&
          deleteExerciseMutation.variables === exercise.id;
        const isPending = exercise.id.startsWith("temp-");

        return (
          <div
            key={exercise.id}
            className={`space-y-4 transition-opacity duration-200 ${isDeleting ? "opacity-50" : ""}`}
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground/60 tabular-nums">
                  {exerciseIdx + 1}
                </span>
                <h2 className="text-lg font-semibold text-foreground">
                  {exercise.exerciseSelection.name}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                onClick={() => handleDeleteExercise(exercise.id)}
                disabled={workout.completed || isDeleting || isPending}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {exerciseSets.length === 0 ? (
                <p className="text-sm text-muted-foreground/60 py-2">No sets yet — add one below</p>
              ) : (
                exerciseSets.map((set, sIdx) => (
                  <SetRow
                    key={set.id}
                    workout={workout}
                    exercises={exercises}
                    sets={sets}
                    set={set}
                    sIdx={sIdx}
                  />
                ))
              )}
            </div>

            <ExerciseButtonGroup
              workout={workout}
              exercises={exercises}
              sets={sets}
              exercise={exercise}
            />
          </div>
        );
      })}
    </div>
  );
}

