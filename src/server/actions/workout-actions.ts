"use server";

import { headers } from "next/headers";
import { auth } from "../auth/auth";
import { completeWorkout, deleteExercise, deleteSet, insertExercise, insertExerciseSelections, insertSet, insertWorkout, updateExerciseNote, updateExerciseOrder, updateSet, updateSetOrder, updateWorkoutSentiment, selectExercises, selectPRsForUser, selectSetsByWorkout } from "../db/queries";
import type { WorkoutTemplate } from "~/app/workout/create/page";
import type { DBExercise, DBSet, NewExercise, NewExerciseSelection, NewSet, Sentiment } from "../db/schema";

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

export async function createExercise(userId: string, order: number, workoutId: string, exerciseSelectionId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("User must be signed in to create a new workout");
  }

  if (session.user.id !== userId) {
    throw new Error("You cannot add exerises to other peoples' workouts");
  }

  const existingExercises = await selectExercises(workoutId);
  
  for (const exercise of existingExercises) {
    if (exercise.order >= order) {
      await updateExerciseOrder(exercise.id, exercise.order + 1);
    }
  }

  const newExercise: NewExercise = {
    order: order,
    workoutId: workoutId,
    exerciseSelectionId: exerciseSelectionId,
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

export async function completeWorkoutAction(userId: string, workoutId: string, workoutDate: Date) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to complete a workout");
  }

  if (session.user.id !== userId) {
    throw new Error("You cannot complete other peoples' workouts");
  }

  // detect if PR happened
  const personalRecords = await selectPRsForUser(userId);
  const sets = await selectSetsByWorkout(workoutId);
  const bestSets: Record<string, { reps: number | null, weight: number | null }> = {};

  for (const set of sets) {
    bestSets[set.exerciseId]
  }

  await completeWorkout(workoutId, workoutDate);
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

export async function seedExerciseSelections() {
  const exercises: NewExerciseSelection[] = [
    // Chest - Barbell
    { name: "Barbell Bench Press", category: "compound", primaryMuscleGroup: "chest", secondaryMuscleGroup: "triceps" },
    { name: "Incline Barbell Bench Press", category: "compound", primaryMuscleGroup: "chest", secondaryMuscleGroup: "shoulders" },
    { name: "Decline Barbell Bench Press", category: "compound", primaryMuscleGroup: "chest", secondaryMuscleGroup: "triceps" },
    
    // Chest - Dumbbell
    { name: "Dumbbell Bench Press", category: "compound", primaryMuscleGroup: "chest", secondaryMuscleGroup: "triceps" },
    { name: "Incline Dumbbell Bench Press", category: "compound", primaryMuscleGroup: "chest", secondaryMuscleGroup: "shoulders" },
    { name: "Decline Dumbbell Bench Press", category: "compound", primaryMuscleGroup: "chest", secondaryMuscleGroup: "triceps" },
    { name: "Dumbbell Fly", category: "isolation", primaryMuscleGroup: "chest", secondaryMuscleGroup: null },
    { name: "Incline Dumbbell Fly", category: "isolation", primaryMuscleGroup: "chest", secondaryMuscleGroup: null },
    
    // Chest - Machine/Cable
    { name: "Cable Fly", category: "isolation", primaryMuscleGroup: "chest", secondaryMuscleGroup: null },
    { name: "Chest Press Machine", category: "compound", primaryMuscleGroup: "chest", secondaryMuscleGroup: "triceps" },
    { name: "Pec Deck", category: "isolation", primaryMuscleGroup: "chest", secondaryMuscleGroup: null },
    { name: "Push-Ups", category: "compound", primaryMuscleGroup: "chest", secondaryMuscleGroup: "triceps" },
    
    // Back - Barbell
    { name: "Barbell Row", category: "compound", primaryMuscleGroup: "back", secondaryMuscleGroup: "biceps" },
    { name: "Deadlift", category: "compound", primaryMuscleGroup: "back", secondaryMuscleGroup: "legs" },
    { name: "Pendlay Row", category: "compound", primaryMuscleGroup: "back", secondaryMuscleGroup: "biceps" },
    
    // Back - Dumbbell
    { name: "Dumbbell Row", category: "compound", primaryMuscleGroup: "back", secondaryMuscleGroup: "biceps" },
    { name: "Single-Arm Dumbbell Row", category: "compound", primaryMuscleGroup: "back", secondaryMuscleGroup: "biceps" },
    
    // Back - Bodyweight/Cable
    { name: "Pull-Up", category: "compound", primaryMuscleGroup: "back", secondaryMuscleGroup: "biceps" },
    { name: "Chin-Up", category: "compound", primaryMuscleGroup: "back", secondaryMuscleGroup: "biceps" },
    { name: "Lat Pulldown", category: "compound", primaryMuscleGroup: "back", secondaryMuscleGroup: "biceps" },
    { name: "Seated Cable Row", category: "compound", primaryMuscleGroup: "back", secondaryMuscleGroup: "biceps" },
    { name: "T-Bar Row", category: "compound", primaryMuscleGroup: "back", secondaryMuscleGroup: "biceps" },
    { name: "Face Pull", category: "isolation", primaryMuscleGroup: "back", secondaryMuscleGroup: "shoulders" },
    
    // Shoulders - Barbell
    { name: "Overhead Press", category: "compound", primaryMuscleGroup: "shoulders", secondaryMuscleGroup: "triceps" },
    { name: "Push Press", category: "compound", primaryMuscleGroup: "shoulders", secondaryMuscleGroup: "triceps" },
    
    // Shoulders - Dumbbell
    { name: "Dumbbell Shoulder Press", category: "compound", primaryMuscleGroup: "shoulders", secondaryMuscleGroup: "triceps" },
    { name: "Arnold Press", category: "compound", primaryMuscleGroup: "shoulders", secondaryMuscleGroup: "triceps" },
    { name: "Lateral Raise", category: "isolation", primaryMuscleGroup: "shoulders", secondaryMuscleGroup: null },
    { name: "Front Raise", category: "isolation", primaryMuscleGroup: "shoulders", secondaryMuscleGroup: null },
    { name: "Rear Delt Fly", category: "isolation", primaryMuscleGroup: "shoulders", secondaryMuscleGroup: null },
    
    // Shoulders - Machine
    { name: "Shoulder Press Machine", category: "compound", primaryMuscleGroup: "shoulders", secondaryMuscleGroup: "triceps" },
    { name: "Cable Lateral Raise", category: "isolation", primaryMuscleGroup: "shoulders", secondaryMuscleGroup: null },
    
    // Legs - Barbell
    { name: "Barbell Squat", category: "compound", primaryMuscleGroup: "legs", secondaryMuscleGroup: "glutes" },
    { name: "Front Squat", category: "compound", primaryMuscleGroup: "legs", secondaryMuscleGroup: "core" },
    { name: "Romanian Deadlift", category: "compound", primaryMuscleGroup: "legs", secondaryMuscleGroup: "back" },
    { name: "Bulgarian Split Squat", category: "compound", primaryMuscleGroup: "legs", secondaryMuscleGroup: "glutes" },
    { name: "Barbell Lunge", category: "compound", primaryMuscleGroup: "legs", secondaryMuscleGroup: "glutes" },
    
    // Legs - Machine
    { name: "Leg Press", category: "compound", primaryMuscleGroup: "legs", secondaryMuscleGroup: "glutes" },
    { name: "Hack Squat", category: "compound", primaryMuscleGroup: "legs", secondaryMuscleGroup: "glutes" },
    { name: "Leg Extension", category: "isolation", primaryMuscleGroup: "legs", secondaryMuscleGroup: null },
    { name: "Leg Curl", category: "isolation", primaryMuscleGroup: "legs", secondaryMuscleGroup: null },
    { name: "Calf Raise", category: "isolation", primaryMuscleGroup: "legs", secondaryMuscleGroup: null },
    { name: "Seated Calf Raise", category: "isolation", primaryMuscleGroup: "legs", secondaryMuscleGroup: null },
    
    // Arms - Biceps
    { name: "Barbell Curl", category: "isolation", primaryMuscleGroup: "biceps", secondaryMuscleGroup: null },
    { name: "Dumbbell Curl", category: "isolation", primaryMuscleGroup: "biceps", secondaryMuscleGroup: null },
    { name: "Hammer Curl", category: "isolation", primaryMuscleGroup: "biceps", secondaryMuscleGroup: "forearms" },
    { name: "Preacher Curl", category: "isolation", primaryMuscleGroup: "biceps", secondaryMuscleGroup: null },
    { name: "Cable Curl", category: "isolation", primaryMuscleGroup: "biceps", secondaryMuscleGroup: null },
    { name: "Concentration Curl", category: "isolation", primaryMuscleGroup: "biceps", secondaryMuscleGroup: null },
    
    // Arms - Triceps
    { name: "Close-Grip Bench Press", category: "compound", primaryMuscleGroup: "triceps", secondaryMuscleGroup: "chest" },
    { name: "Dips", category: "compound", primaryMuscleGroup: "triceps", secondaryMuscleGroup: "chest" },
    { name: "Tricep Pushdown", category: "isolation", primaryMuscleGroup: "triceps", secondaryMuscleGroup: null },
    { name: "Overhead Tricep Extension", category: "isolation", primaryMuscleGroup: "triceps", secondaryMuscleGroup: null },
    { name: "Skull Crusher", category: "isolation", primaryMuscleGroup: "triceps", secondaryMuscleGroup: null },
    { name: "Tricep Kickback", category: "isolation", primaryMuscleGroup: "triceps", secondaryMuscleGroup: null },
    
    // Core
    { name: "Plank", category: "isolation", primaryMuscleGroup: "core", secondaryMuscleGroup: null },
    { name: "Ab Wheel Rollout", category: "compound", primaryMuscleGroup: "core", secondaryMuscleGroup: null },
    { name: "Cable Crunch", category: "isolation", primaryMuscleGroup: "core", secondaryMuscleGroup: null },
    { name: "Hanging Leg Raise", category: "isolation", primaryMuscleGroup: "core", secondaryMuscleGroup: null },
  ];

  const insertedExercises = await insertExerciseSelections(exercises);
  return insertedExercises;
}
