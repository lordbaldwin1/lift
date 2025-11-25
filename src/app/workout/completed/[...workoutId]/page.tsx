import { notFound } from "next/navigation";
import RateWorkout from "~/components/rate-workout";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  selectExercisesWithSelection,
  selectSetsByWorkout,
  selectSetsByWorkoutWithExerciseSelection,
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
      <WorkoutBreakdown workoutId={workout.id} exercises={exercises} sets={sets} />
    </main>
  );
}

type WorkoutBreakdownProps = {
  workoutId: string;
  exercises: ExerciseWithSelection[];
  sets: DBSet[];
};

async function WorkoutBreakdown({ workoutId, exercises, sets }: WorkoutBreakdownProps) {
  const setsPerMuscleGroup = await calculateSetsPerMuscleGroup(workoutId);

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
        <CardContent>
          {Object.entries(setsPerMuscleGroup).map((muscle, i) => (
            <div key={i}>
            <h1>{toUpperFirstChar(muscle[0])}</h1>
            <p>{muscle[1]}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function toUpperFirstChar(str: string) {
  if (str.length === 0) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

type SetsPerMuscleGroup = Record<string, number>;

async function calculateSetsPerMuscleGroup(workoutId: string) {
  const res: SetsPerMuscleGroup = {};

  const sets = await selectSetsByWorkoutWithExerciseSelection(workoutId);

  for (const set of sets) {
    const primaryMuscleGroup = set.exerciseSelection.primaryMuscleGroup;
    const secondaryMuscleGroup = set.exerciseSelection.secondaryMuscleGroup;

    res[primaryMuscleGroup] = (res[primaryMuscleGroup] ?? 0) + 1;
    if (!secondaryMuscleGroup) continue;
    res[secondaryMuscleGroup] = (res[secondaryMuscleGroup] ?? 0) + 0.5;
  }

  return res;
}
