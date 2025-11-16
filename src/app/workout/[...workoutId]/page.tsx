import { notFound } from "next/navigation";
import {
  selectExercises,
  selectSetsByWorkout,
  selectWorkout,
} from "~/server/db/queries";
import WorkoutTracker from "~/components/workout/workout-tracker";
import WorkoutHeader from "~/components/workout/workout-header";

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
    <main className="mt-8 flex flex-col items-center space-y-6">
      <WorkoutHeader title={workout.title} description={workout.description} />
      <WorkoutTracker
        initialWorkout={workout}
        initialExercises={exercises}
        initialSets={sets}
      />
    </main>
  );
}
