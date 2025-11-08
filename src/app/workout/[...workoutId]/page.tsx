import { notFound } from "next/navigation";
import {
  selectExercises,
  selectSets,
  selectWorkout,
} from "~/server/db/queries";
import type { Exercise, ExerciseSet } from "../page";

export default async function WorkoutPage({
  params,
}: {
  params: { workoutId: string };
}) {
  const { workoutId } = params;

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
      note: exercise.name,
      order: exercise.order,
      sets: [],
    };
    const sets = await selectSets(exercise.id);
    for (const set of sets) {
      tempExercise.sets.push({
        id: set.id,
        order: set.order,
        reps: set.reps ?? undefined,
        weight: set.weight ?? undefined,
      });
    }
  }

  return (
    <div>
      <h1>hi</h1>
    </div>
  );
}
