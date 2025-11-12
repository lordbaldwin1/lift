import { notFound } from "next/navigation";
import {
  selectExercises,
  selectSets,
  selectSetsByWorkout,
  selectWorkout,
} from "~/server/db/queries";
import WorkoutTracker from "~/components/workout-tracker";
import type { DBSet } from "~/server/db/schema";

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
  const sets = await selectSetsByWorkout(workoutId);

  return (
    <div>
      <WorkoutTracker
        initialWorkout={workout}
        initialExercises={exercises}
        initialSets={sets}
      />
    </div>
  );
}
