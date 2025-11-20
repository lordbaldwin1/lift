import { notFound } from "next/navigation";
import RateWorkout from "~/components/rate-workout";
import { selectExercisesWithSelection, selectSetsByWorkout, selectWorkout } from "~/server/db/queries";
import type { DBSet, ExerciseWithSelection } from "~/server/db/schema";


export default async function CompletedWorkoutPage({
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
    <main>
      <RateWorkout workout={workout} />
      <WorkoutBreakdown exercises={exercises} sets={sets} />
    </main>
  )
}

type WorkoutBreakdownProps = {
  exercises: ExerciseWithSelection[];
  sets: DBSet[];
};

function WorkoutBreakdown({ exercises, sets }: WorkoutBreakdownProps) {

  return (
    <div>workout breakdown</div>
  )
}