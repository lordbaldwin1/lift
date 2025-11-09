import { eq } from "drizzle-orm";
import { db } from ".";
import type { NewExercise, NewSet, NewWorkout } from "./schema";
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

export async function selectWorkouts(userId: string) {
  const rows = await db.select().from(workout).where(eq(workout.userId, userId));
  return rows;
}

export async function insertExercise(newExercise: NewExercise) {
  const [row] = await db.insert(exercise).values(newExercise).returning();
  return row;
}

export async function selectExercises(workoutId: string) {
  const rows = await db
    .select()
    .from(exercise)
    .where(eq(exercise.workoutId, workoutId));
  return rows;
}

export async function updateExerciseOrder(exercideId: string, order: number) {
  const [row] = await db.update(exercise).set({
    order: order,
  }).where(eq(exercise.id, exercideId)).returning();
  return row;
}

export async function deleteExercise(exercideId: string) {
  const [row] = await db.delete(exercise).where(eq(exercise.id, exercideId)).returning();
  return row;
}

export async function selectSets(exerciseId: string) {
  const rows = await db
    .select()
    .from(set)
    .where(eq(set.exerciseId, exerciseId));
  return rows;
}

export async function deleteSet(setId: string) {
  const [row] = await db.delete(set).where(eq(set.id, setId)).returning();
  return row;
}

export async function updateSetOrder(setId: string, order: number) {
  const [row] = await db.update(set).set({
    order: order,
  }).where(eq(set.id, setId)).returning();
  return row;
}

export async function insertSet(newSet: NewSet) {
  const [row] = await db.insert(set).values(newSet).returning();
  return row;
}
