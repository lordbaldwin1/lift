import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth/auth";
import { selectWorkouts } from "~/server/db/queries";

export default async function WorkoutPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return (
      <div className="flex h-[60vw] items-center justify-center">
        <Button variant={"link"} className="text-md">
          <Link href={"/login"}>Sign in to view your workouts.</Link>
        </Button>{" "}
        <span></span>
      </div>
    );
  }

  const workouts = await selectWorkouts(session.user.id);

  if (workouts.length === 0) {
    <div className="flex h-[70vw] items-center justify-center">
      Your list of workouts will appear here.
    </div>;
  }
  return (
    <main className="flex flex-col">
      {workouts.map((workout) => (
        <Link
          href={`/workout/${workout.id}`}
          key={workout.id}
          className="hover:text-muted-foreground duration-200"
        >
          {workout.title} | {workout.createdAt.toDateString()}
        </Link>
      ))}
      <Link href={"/workout/create"}>create new workout</Link>
    </main>
  );
}
