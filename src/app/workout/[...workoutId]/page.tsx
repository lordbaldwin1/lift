import { notFound } from "next/navigation";
import {
  selectExercises,
  selectSets,
  selectWorkout,
} from "~/server/db/queries";
import type { Exercise } from "~/components/workout-tracker";
import WorkoutTracker from "~/components/workout-tracker";

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;

  const workout = await selectWorkout(workoutId);
  if (!workout) {
    notFound();
  }

  const exercises = await selectExercises(workoutId);

  const exerciseProp: Exercise[] = [];

  for (const exercise of exercises) {
    const tempExercise: Exercise = {
      id: exercise.id,
      name: exercise.name,
      note: exercise.note ?? undefined,
      order: exercise.order,
      workoutId: workout.id,
      sets: [],
    };

    const sets = await selectSets(exercise.id);

    for (const set of sets) {
      tempExercise.sets.push({
        id: set.id,
        order: set.order,
        exerciseId: tempExercise.id,
        reps: set.reps ?? undefined,
        weight: set.weight ?? undefined,
      });
    }

    exerciseProp.push(tempExercise);
  }

  return (
    <div>
      <WorkoutTracker
        initialWorkout={workout}
        initialExercises={exerciseProp}
      />
    </div>
  );
}
