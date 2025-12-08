import { headers } from "next/headers";
import Link from "next/link";
import WorkoutHistoryCalendar from "~/components/workout-history-calendar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { auth } from "~/server/auth/auth";
import {
  selectWorkouts,
  selectWorkoutStats,
  selectSetsPerMuscleGroupThisWeek,
  selectAvgSetsPerMuscleGroupPerWeek,
} from "~/server/db/queries";
import { Trash } from "lucide-react";
import WorkoutHistoryCard from "~/components/workout-history-card";

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function MuscleGroupCard({
  title,
  data,
  valueLabel,
}: {
  title: string;
  data: { muscleGroup: string; value: number }[];
  valueLabel: string;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const displayTotal = Number.isInteger(total) ? total : Math.round(total * 10) / 10;

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet</p>
        ) : (
          <div className="space-y-2">
            {data.map((item) => (
              <div
                key={item.muscleGroup}
                className="flex justify-between items-center text-sm"
              >
                <span className="capitalize">{item.muscleGroup}</span>
                <span className="font-semibold">
                  {item.value} {valueLabel}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center text-sm pt-2 border-t">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">
                {displayTotal} {valueLabel}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function WorkoutPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return (
      <div className="flex h-[60vw] items-center justify-center">
        <Button variant={"link"} className="text-md">
          <Link href={"/login"}>Sign in to view your workouts.</Link>
        </Button>
      </div>
    );
  }

  const [workouts, stats, setsThisWeek, avgSetsPerWeek] = await Promise.all([
    selectWorkouts(session.user.id),
    selectWorkoutStats(session.user.id),
    selectSetsPerMuscleGroupThisWeek(session.user.id),
    selectAvgSetsPerMuscleGroupPerWeek(session.user.id),
  ]);

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 w-full rounded-md">
        <Link href="/workout/create" className="block w-full">
          <Button size="default" className="w-full">
            Start new workout
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          title="Average workouts"
          value={stats.avgWorkoutsPerWeek}
          subtitle="per week"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
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

      <Card className="py-4 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Activity calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <WorkoutHistoryCalendar workouts={workouts} />
        </CardContent>
      </Card>

      <WorkoutHistoryCard workouts={workouts} userId={session.user.id} />
    </main>
  );
}
