"use client";

import type { DBExercise, DBSet, DBWorkout } from "~/server/db/schema";
import useWorkoutData from "./hooks/use-workout-data";
import WorkoutButtonGroup from "./workout-button-group";
import ExerciseList from "./exercise-list";

type WorkoutTrackerProps = {
  initialWorkout: DBWorkout;
  initialExercises: DBExercise[];
  initialSets: DBSet[];
};

export default function WorkoutTracker({
  initialWorkout,
  initialExercises,
  initialSets,
}: WorkoutTrackerProps) {
  const workoutId = initialWorkout.id;

  const {
    exercises,
    sets,
    isLoading,
    error
  } = useWorkoutData({ workoutId, initialExercises, initialSets });

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <main className="w-full">
      <section className="flex w-full flex-col space-y-12">
        <ExerciseList workout={initialWorkout} exercises={exercises} sets={sets} />
        <WorkoutButtonGroup workout={initialWorkout} exercises={exercises} sets={sets} />
      </section>
    </main>
  );
}
