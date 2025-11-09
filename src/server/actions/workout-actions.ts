"use server";

import type { Exercise, Workout } from "~/components/workout-tracker";
import { headers } from "next/headers";
import { auth } from "../auth/auth";
import { deleteSet, insertExercise, insertSet, insertWorkout, updateExerciseOrder, updateSetOrder } from "../db/queries";
import type { WorkoutTemplate } from "~/app/workout/create/page";
import type { NewExercise, NewSet } from "../db/schema";

export async function createWorkout(workout: WorkoutTemplate) {
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

export async function createSet(userId: string, exercise: Exercise, order: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("User must be signed in to create a new workout");
  }

  if (session.user.id !== userId) {
    throw new Error("You cannot add sets to other peoples' workouts");
  }

  const newSet: NewSet = {
    order: order,
    exerciseId: exercise.id,
  }

  const addedSet = await insertSet(newSet);
  return addedSet;
}

export async function createExercise(userId: string, name: string, order: number, workoutId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("User must be signed in to create a new workout");
  }

  if (session.user.id !== userId) {
    throw new Error("You cannot add exerises to other peoples' workouts");
  }

  const newExercise: NewExercise = {
    name: name,
    order: order,
    workoutId: workoutId,
  }

  const addedExercise = await insertExercise(newExercise);
  return addedExercise;
}

export async function updateExerciseOrderAction(userId: string, exerciseId: string, order: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in update exercise orders");
  }

  if (session.user.id !== userId) {
    throw new Error("You cannot update other peoples' exercise order");
  }

  const updatedExercise = await updateExerciseOrder(exerciseId, order);
  return updatedExercise;
}

export async function deleteSetAction(userId: string, setId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to delete sets");
  }

  if (session.user.id !== userId) {
    throw new Error("You cannot delete other people's sets");
  }

  const deletedSet = await deleteSet(setId);
  return deletedSet;
}

export async function updateSetOrderAction(userId: string, setId: string, order: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to update set orders");
  }

  if (session.user.id !== userId) {
    throw new Error("You cannot update other peoples' set orders");
  }

  const updatedSet = await updateSetOrder(setId, order);
  return updatedSet;
}
