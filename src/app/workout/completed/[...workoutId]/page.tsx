import Link from "next/link";
import { notFound } from "next/navigation";
import RateWorkout from "./_components/rate-workout";
import { Button } from "~/components/ui/button";
import {
  selectExercisesWithSelection,
  selectPRsForWorkout,
  selectSetsByWorkout,
  selectSetsByWorkoutWithExerciseSelection,
  selectWorkout,
} from "~/server/db/queries";
import WorkoutBreakdown, { calculateSetsPerMuscleGroup } from "./_components/workout-breakdown";
import { ArrowLeft } from "lucide-react";

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
    <main className="py-8 flex flex-col items-center">
      <div className="w-full max-w-xl opacity-0 animate-fade-in-up">
        <RateWorkout workout={workout} />
      </div>
      <div 
        className="w-full max-w-xl opacity-0 animate-fade-in-up"
        style={{ animationDelay: '100ms' }}
      >
        <WorkoutBreakdown
          exercises={exercises}
          sets={sets}
          setsPerMuscleGroup={setsPerMuscleGroup}
          personalRecords={personalRecords}
        />
      </div>
      <div 
        className="mt-10 opacity-0 animate-fade-in-up"
        style={{ animationDelay: '200ms' }}
      >
        <Link href="/workout">
          <Button size="lg" variant="outline" className="font-semibold group">
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Workouts
          </Button>
        </Link>
      </div>
    </main>
  );
}
