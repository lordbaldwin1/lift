import { notFound } from "next/navigation";
import RateWorkout from "~/components/rate-workout";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  selectExercisesWithSelection,
  selectSetsByWorkout,
  selectWorkout,
} from "~/server/db/queries";
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
    <main className="flex flex-col items-center justify-center space-y-12">
      <RateWorkout workout={workout} />
      <WorkoutBreakdown exercises={exercises} sets={sets} />
    </main>
  );
}

type WorkoutBreakdownProps = {
  exercises: ExerciseWithSelection[];
  sets: DBSet[];
};

function WorkoutBreakdown({ exercises, sets }: WorkoutBreakdownProps) {
  return (
    <div className="w-full space-y-6">
      <h1 className="text-center text-2xl font-bold">Workout breakdown</h1>
      <div className="grid w-full grid-cols-2 gap-2">
        <Card>
          <CardHeader>
            <CardTitle>Total sets</CardTitle>
          </CardHeader>
          <CardContent>{sets.length}</CardContent>
        </Card>
        <Card>
        <CardHeader>
            <CardTitle>Total exercises</CardTitle>
          </CardHeader>
          <CardContent>{exercises.length}</CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sets by muscle group</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

function calculateSetsPerMuscleGroup(exercises: ExerciseWithSelection[]) {
  const res = {
    
  }
}
