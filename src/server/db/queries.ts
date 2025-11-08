import { eq } from "drizzle-orm";
import { db } from ".";
import type { NewWorkout } from "./schema";
import { exercise, set, workout } from "./schema";

export async function insertWorkout(newWorkout: NewWorkout) {
  const [row] = await db.insert(workout).values(newWorkout).returning();
  return row;
}

export async function selectWorkout(workoutId: string) {
  const [row] = await db
    .select()
    .from(workout)
    .where(eq(workout.id, workoutId));
  return row;
}

export async function selectExercises(workoutId: string) {
  const rows = await db
    .select()
    .from(exercise)
    .where(eq(exercise.workoutId, workoutId));
  return rows;
}

export async function selectSets(exerciseId: string) {
  const rows = await db
    .select()
    .from(set)
    .where(eq(set.exerciseId, exerciseId));
  return rows;
}
