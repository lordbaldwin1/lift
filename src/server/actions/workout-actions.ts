"use server";

import type { Workout } from "~/components/workout-tracker";
import { headers } from "next/headers";
import { auth } from "../auth/auth";
import { insertWorkout } from "../db/queries";

export async function createWorkout(workout: Workout) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("User must be signed in to create a new workout.");
  }

  const newWorkout = await insertWorkout({
    title: workout.title,
    description: workout.description,
    userId: session.user.id,
  });

  if (!newWorkout) {
    throw new Error("Failed to create new workout");
  }

  return newWorkout;
}
