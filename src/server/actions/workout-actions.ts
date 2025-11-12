"use server";

import { headers } from "next/headers";
import { auth } from "../auth/auth";
import { completeWorkout, deleteExercise, deleteSet, insertExercise, insertSet, insertWorkout, updateExerciseNote, updateExerciseOrder, updateSet, updateSetOrder, updateWorkoutSentiment, selectExercises } from "../db/queries";
import type { WorkoutTemplate } from "~/app/workout/create/page";
import type { DBExercise, DBSet, NewExercise, NewSet, Sentiment } from "../db/schema";

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

export async function createSet(userId: string, exercise: DBExercise, order: number) {
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

  // Get existing exercises to update their orders
  const existingExercises = await selectExercises(workoutId);
  
  // Update order of exercises that come after the insertion point
  for (const exercise of existingExercises) {
    if (exercise.order >= order) {
      await updateExerciseOrder(exercise.id, exercise.order + 1);
    }
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

export async function deleteExerciseAction(userId: string, exerciseId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to delete exercises");
  }

  if (session.user.id !== userId) {
    throw new Error("You cannot delete other peoples' exercises");
  }

  const deletedExercise = await deleteExercise(exerciseId);
  
  // Get remaining exercises in the same workout to update their orders
  if (deletedExercise) {
    const remainingExercises = await selectExercises(deletedExercise.workoutId);
    
    // Update order of exercises that came after the deleted one
    for (const exercise of remainingExercises) {
      if (exercise.order > deletedExercise.order) {
        await updateExerciseOrder(exercise.id, exercise.order - 1);
      }
    }
  }
  
  return deletedExercise;
}

export async function updateSetAction(userId: string, set: DBSet) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to update sets");
  }

  if (session.user.id !== userId) {
    throw new Error("You cannot update other peoples' sets");
  }

  const updatedSet = await updateSet(set.id, set.reps ?? null, set.weight ?? null);
  return updatedSet;
}

export async function updateExerciseNoteAction(userId: string, exercideId: string, note: string | null) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to update your exercise notes");
  }

  if (session.user.id !== userId) {
    throw new Error("You cannot update other peoples' exercise notes");
  }

  const updatedExercise = await updateExerciseNote(exercideId, note);
  return updatedExercise;
}

export async function completeWorkoutAction(userId: string, exercises: DBExercise[], workoutId: string, workoutDate: Date) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to complete a workout");
  }

  if (session.user.id !== userId) {
    throw new Error("You cannot complete other peoples' workouts");
  }

  await completeWorkout(exercises, workoutId, workoutDate);
}

export async function updateWorkoutSentimentAction(userId: string, workoudId: string, sentiment: Sentiment) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in update a workout sentiment");
  }

  if (session.user.id !== userId) {
    throw new Error("You cannot update other peoples' workout sentiments");
  }

  const updatedWorkout = await updateWorkoutSentiment(workoudId, sentiment);
  return updatedWorkout;
}
