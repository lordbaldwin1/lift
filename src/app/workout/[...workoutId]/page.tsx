import { notFound } from "next/navigation";
import {
  selectExercisesWithSelection,
  selectSetsByWorkout,
  selectWorkout,
} from "~/server/db/queries";
import WorkoutHeader from "./_components/workout-header";
import ExerciseList from "./_components/exercise-list";
import WorkoutButtonGroup from "./_components/workout-button-group";

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
    <main className="py-8 space-y-8">
      <div className="opacity-0 animate-fade-in-up">
        <WorkoutHeader title={workout.title} description={workout.description} completed={workout.completed} />
      </div>
      <div className="w-full opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <section className="flex w-full flex-col space-y-10">
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
      </div>
    </main>
  );
}
