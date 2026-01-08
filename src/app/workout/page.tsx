import { headers } from "next/headers";
import WorkoutHistoryCalendar from "./_components/workout-history-calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { auth } from "~/server/auth/auth";
import {
  selectWorkouts,
  selectWorkoutStats,
  selectSetsPerMuscleGroupThisWeek,
  selectAvgSetsPerMuscleGroupPerWeek,
  selectProgressionData,
  selectUserTrackedExercises,
} from "~/server/db/queries";
import WorkoutHistoryCard from "./_components/workout-history-card";
import { redirect } from "next/navigation";
import CreateWorkoutButton from "./_components/create-workout-button";
import StatCard from "./_components/stat-card";
import MuscleGroupCard from "./_components/muscle-group-card";
import ProgressionChart from "./_components/progression-chart";

export default async function WorkoutPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const [workouts, stats, setsThisWeek, avgSetsPerWeek, progressionData, trackedExercises] = await Promise.all([
    selectWorkouts(session.user.id),
    selectWorkoutStats(session.user.id),
    selectSetsPerMuscleGroupThisWeek(session.user.id),
    selectAvgSetsPerMuscleGroupPerWeek(session.user.id),
    selectProgressionData(session.user.id, threeMonthsAgo),
    selectUserTrackedExercises(session.user.id),
  ]);

  return (
    <main className="py-8 space-y-8">
      <div className="opacity-0 animate-fade-in-up">
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight text-foreground">
          YOUR WORKOUTS
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your progress and stay consistent.
        </p>
      </div>

      <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <CreateWorkoutButton />
      </div>

      <div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 opacity-0 animate-fade-in-up"
        style={{ animationDelay: '100ms' }}
      >
        <StatCard
          title="Total workouts"
          value={stats.totalWorkouts}
          subtitle="all time"
        />
        <StatCard
          title="Workouts this year"
          value={stats.workoutsThisYear}
          subtitle={`in ${new Date().getFullYear()}`}
        />
        <StatCard
          title="Workouts this week"
          value={stats.workoutsThisWeek}
          subtitle="since Sunday"
        />
        <StatCard
          title="Weekly avg workouts"
          value={stats.avgWorkoutsPerWeek}
          subtitle="per week"
        />
      </div>

      <div 
        className="opacity-0 animate-fade-in-up"
        style={{ animationDelay: '125ms' }}
      >
        <ProgressionChart
          initialProgressionData={progressionData}
          initialTrackedExercises={trackedExercises}
        />
      </div>

      <div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 opacity-0 animate-fade-in-up"
        style={{ animationDelay: '150ms' }}
      >
        <MuscleGroupCard
          title="Sets this week"
          data={setsThisWeek}
          valueLabel="sets"
        />
        <MuscleGroupCard
          title="Avg sets per week"
          data={avgSetsPerWeek}
          valueLabel="sets"
        />
      </div>

      <Card 
        className="opacity-0 animate-fade-in-up"
        style={{ animationDelay: '200ms' }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Activity Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center pt-2">
          <WorkoutHistoryCalendar workouts={workouts} />
        </CardContent>
      </Card>

      <div 
        className="opacity-0 animate-fade-in-up"
        style={{ animationDelay: '250ms' }}
      >
        <WorkoutHistoryCard workouts={workouts} userId={session.user.id} />
      </div>

      <div 
        className="opacity-0 animate-fade-in-up"
        style={{ animationDelay: '300ms' }}
      >
        <CreateWorkoutButton />
      </div>
    </main>
  );
}
