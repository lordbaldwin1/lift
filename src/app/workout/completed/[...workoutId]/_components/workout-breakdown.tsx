import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { DBSet, ExerciseWithSelection } from "~/server/db/schema";
import { Trophy, Flame, Dumbbell } from "lucide-react";

export type WorkoutPR = {
  id: string;
  weight: number;
  reps: number;
  createdAt: Date;
  exerciseSelection: {
    id: string;
    name: string;
  };
};

export type SetsPerMuscleGroup = Record<string, number>;

export type SetWithExerciseSelection = {
  exerciseSelection: {
    primaryMuscleGroup: string;
    secondaryMuscleGroup: string | null;
  };
};

type WorkoutBreakdownProps = {
  exercises: ExerciseWithSelection[];
  sets: DBSet[];
  setsPerMuscleGroup: SetsPerMuscleGroup;
  personalRecords: WorkoutPR[];
};

export default function WorkoutBreakdown({
  exercises,
  sets,
  setsPerMuscleGroup,
  personalRecords,
}: WorkoutBreakdownProps) {
  const sortedMuscleGroups = Object.entries(setsPerMuscleGroup).sort(
    ([, a], [, b]) => b - a
  );

  const maxCount = Math.max(...sortedMuscleGroups.map(([, count]) => count), 1);

  return (
    <div className="w-full space-y-6 mt-6">
      <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center">
        Workout Breakdown
      </h2>

      {personalRecords.length > 0 && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span>Personal Records</span>
              <span className="text-xs font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full ml-auto">
                {personalRecords.length} new {personalRecords.length === 1 ? "PR" : "PRs"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 space-y-2">
            {personalRecords.map((pr) => (
              <div
                key={pr.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/50"
              >
                <span className="font-medium text-sm text-foreground">
                  {pr.exerciseSelection.name}
                </span>
                <span className="text-sm tabular-nums text-primary font-medium">
                  {pr.weight} lbs × {pr.reps}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="pt-6 pb-5 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted mb-3">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <div className="font-display text-5xl tracking-tight text-foreground">
              {sets.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
              Total Sets
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="pt-6 pb-5 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted mb-3">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div className="font-display text-5xl tracking-tight text-foreground">
              {exercises.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
              Exercises
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Sets by Muscle Group
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 space-y-3">
          {sortedMuscleGroups.map(([muscle, count]) => {
            const percentage = (count / maxCount) * 100;
            const displayCount = Number.isInteger(count) ? count : count.toFixed(1);

            return (
              <div key={muscle} className="space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-foreground capitalize">
                    {muscle.replace(/_/g, " ")}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {displayCount} {count === 1 ? "set" : "sets"}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          {sortedMuscleGroups.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No sets recorded
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function calculateSetsPerMuscleGroup(sets: SetWithExerciseSelection[]) {
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

