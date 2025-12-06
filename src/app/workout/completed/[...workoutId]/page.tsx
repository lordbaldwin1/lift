import Link from "next/link";
import { notFound } from "next/navigation";
import RateWorkout from "~/components/rate-workout";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  selectExercisesWithSelection,
  selectPRsForWorkout,
  selectSetsByWorkout,
  selectSetsByWorkoutWithExerciseSelection,
  selectWorkout,
} from "~/server/db/queries";
import type { DBSet, ExerciseWithSelection } from "~/server/db/schema";

type WorkoutPR = {
  id: string;
  weight: number;
  reps: number;
  createdAt: Date;
  exerciseSelection: {
    id: string;
    name: string;
  };
};

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

  const [exercises, sets, setsWithSelection, personalRecords] = await Promise.all([
    selectExercisesWithSelection(workoutId),
    selectSetsByWorkout(workoutId),
    selectSetsByWorkoutWithExerciseSelection(workoutId),
    selectPRsForWorkout(workoutId),
  ]);

  const setsPerMuscleGroup = calculateSetsPerMuscleGroup(setsWithSelection);

  return (
    <main className="flex flex-col items-center justify-center px-4 pb-12">
      <RateWorkout workout={workout} />
      <WorkoutBreakdown
        exercises={exercises}
        sets={sets}
        setsPerMuscleGroup={setsPerMuscleGroup}
        personalRecords={personalRecords}
      />
      <Link className="mt-12" href={"/workout"}>
        <Button>
          View Workouts
        </Button>
      </Link>
    </main>
  );
}

type WorkoutBreakdownProps = {
  exercises: ExerciseWithSelection[];
  sets: DBSet[];
  setsPerMuscleGroup: SetsPerMuscleGroup;
  personalRecords: WorkoutPR[];
};

function WorkoutBreakdown({
  exercises,
  sets,
  setsPerMuscleGroup,
  personalRecords,
}: WorkoutBreakdownProps) {
  const sortedMuscleGroups = Object.entries(setsPerMuscleGroup).sort(
    ([, a], [, b]) => b - a
  );

  const totalSets = Math.max(sets.length, 1);

  return (
    <div className="w-full max-w-xl space-y-6 mt-10">
      <h2 className="text-center text-xl text-foreground">
        Workout Breakdown
      </h2>

      {personalRecords.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span>Personal Records</span>
              <span className="text-xs font-normal text-muted-foreground">
                ({personalRecords.length} new {personalRecords.length === 1 ? "PR" : "PRs"})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {personalRecords.map((pr) => (
              <div
                key={pr.id}
                className="flex items-center justify-between rounded-lg py-2"
              >
                <span className="font-medium text-sm">
                  {pr.exerciseSelection.name}
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {pr.weight} lbs × {pr.reps} {pr.reps === 1 ? "rep" : "reps"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 pb-4 text-center">
            <div className="text-4xl font-bold tracking-tight">{sets.length}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Sets</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 pb-4 text-center">
            <div className="text-4xl font-bold tracking-tight">{exercises.length}</div>
            <div className="text-sm text-muted-foreground mt-1">Exercises</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sets by Muscle Group</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedMuscleGroups.map(([muscle, count]) => {
            const percentage = (count / totalSets) * 100;
            const displayCount = Number.isInteger(count) ? count : count.toFixed(1);

            return (
              <div key={muscle} className="space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">{toUpperFirstChar(muscle)}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {displayCount} {count === 1 ? "set" : "sets"}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          {sortedMuscleGroups.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No sets recorded
            </p>
          )}
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

type SetWithExerciseSelection = {
  exerciseSelection: {
    primaryMuscleGroup: string;
    secondaryMuscleGroup: string | null;
  };
};

function calculateSetsPerMuscleGroup(sets: SetWithExerciseSelection[]) {
  const res: SetsPerMuscleGroup = {};

  for (const set of sets) {
    const primaryMuscleGroup = set.exerciseSelection.primaryMuscleGroup;
    const secondaryMuscleGroup = set.exerciseSelection.secondaryMuscleGroup;

    res[primaryMuscleGroup] = (res[primaryMuscleGroup] ?? 0) + 1;
    if (!secondaryMuscleGroup) continue;
    res[secondaryMuscleGroup] = (res[secondaryMuscleGroup] ?? 0) + 0.5;
  }

  return res;
}
