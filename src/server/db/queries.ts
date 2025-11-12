import { asc, eq } from "drizzle-orm";
import { db } from ".";
import type { DBExercise, NewExercise, NewSet, NewWorkout, Sentiment } from "./schema";
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
    .where(eq(exercise.workoutId, workoutId))
    .orderBy(asc(exercise.order));
  return rows;
}

export async function updateExerciseOrder(exercideId: string, order: number) {
  const [row] = await db.update(exercise).set({
    order: order,
  }).where(eq(exercise.id, exercideId)).returning();
  return row;
}

export async function updateExerciseNote(exerciseId: string, note: string | null) {
  const [row] = await db.update(exercise).set({
    note: note,
  }).where(eq(exercise.id, exerciseId)).returning();
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
    .where(eq(set.exerciseId, exerciseId))
    .orderBy(asc(set.order));
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

export async function updateSet(setId: string, reps: number | null, weight: number | null) {
  const [row] = await db.update(set).set({
    reps: reps,
    weight: weight
  }).where(eq(set.id, setId)).returning();
  return row;
}

export async function selectSetsByWorkout(workoutId: string) {
  const rows = await db
    .select({ set })
    .from(set)
    .innerJoin(exercise, eq(set.exerciseId, exercise.id))
    .where(eq(exercise.workoutId, workoutId))
    .orderBy(asc(set.order));
  return rows.map(r => r.set);
}

export async function completeWorkout(exercises: DBExercise[], workoutId: string, workoutDate: Date) {
  await db.update(workout).set({
    completed: true,
    completedAt: workoutDate,
  }).where(eq(workout.id, workoutId));
}

export async function updateWorkoutSentiment(workoudId: string, sentiment: Sentiment) {
  const [row] = await db.update(workout).set({
    sentiment: sentiment,
  }).where(eq(workout.id, workoudId)).returning();
  return row;
}
