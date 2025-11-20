import { notFound } from "next/navigation";
import {
  selectExercisesWithSelection,
  selectSetsByWorkout,
  selectWorkout,
} from "~/server/db/queries";
import WorkoutHeader from "~/components/workout/workout-header";
import ExerciseList from "~/components/workout/exercise-list";
import WorkoutButtonGroup from "~/components/workout/workout-button-group";

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

  const exercises = await selectExercisesWithSelection(workoutId);
  const sets = await selectSetsByWorkout(workoutId);

  return (
    <main className="mt-8 flex flex-col items-center space-y-6">
      <WorkoutHeader title={workout.title} description={workout.description} />
      <main className="w-full">
      <section className="flex w-full flex-col space-y-12">
        <ExerciseList
          workout={workout}
          initialExercises={exercises}
          initialSets={sets}
        />
        <WorkoutButtonGroup
          workout={workout}
          initialExercises={exercises}
          initialSets={sets}
        />
      </section>
    </main>
    </main>
  );
}
