"use server";

import { headers } from "next/headers";
import { auth } from "../auth/auth";
import { completeWorkout, deleteExercise, deleteSet, insertExercise, insertPersonalRecord, insertSet, insertWorkout, selectExercisesWithSelection, selectPRsForUserAndExerciseSelection, selectSetsByWorkoutWithExerciseSelection, updateExerciseNote, updateExerciseOrder, updateSet, updateSetOrder, updateWorkoutSentiment, selectExercises, deleteWorkout, selectExerciseSelections } from "../db/queries";
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

  if (workout.exercises && workout.exercises.length > 0) {
    const allExerciseSelections = await selectExerciseSelections();
    
    const selectionMap = new Map(
      allExerciseSelections.map(es => [es.name.toLowerCase(), es])
    );

    for (let exerciseOrder = 0; exerciseOrder < workout.exercises.length; exerciseOrder++) {
      const templateExercise = workout.exercises[exerciseOrder];
      if (!templateExercise) continue;
      
      const exerciseSelection = selectionMap.get(templateExercise.exerciseSelectionName.toLowerCase());
      
      if (!exerciseSelection) {
        console.warn(`Exercise selection not found: ${templateExercise.exerciseSelectionName}`);
        continue;
      }

      const newExercise: NewExercise = {
        order: exerciseOrder,
        workoutId: newWorkout.id,
        exerciseSelectionId: exerciseSelection.id,
      };
      
      const createdExercise = await insertExercise(newExercise);
      
      if (!createdExercise) {
        console.warn(`Failed to create exercise: ${templateExercise.exerciseSelectionName}`);
        continue;
      }

      for (let setOrder = 0; setOrder < templateExercise.sets; setOrder++) {
        const newSet: NewSet = {
          order: setOrder,
          exerciseId: createdExercise.id,
        };
        await insertSet(newSet);
      }
    }
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
  
  if (deletedExercise) {
    const remainingExercises = await selectExercises(deletedExercise.workoutId);
    
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

  const setsWithSelection = await selectSetsByWorkoutWithExerciseSelection(workoutId);
  const exercisesWithSelection = await selectExercisesWithSelection(workoutId);

  type TopSet = {
    setId: string;
    exerciseSelectionId: string;
    weight: number;
    reps: number;
  };
  const topSetsByExercise: Record<string, TopSet> = {};

  for (const set of setsWithSelection) {
    if (set.weight === null || set.reps === null) continue;

    const exercise = exercisesWithSelection.find(ex => ex.id === set.exerciseId);
    if (!exercise) continue;

    const exerciseId = set.exerciseId;
    const current = topSetsByExercise[exerciseId];

    if (!current) {
      topSetsByExercise[exerciseId] = {
        setId: set.id,
        exerciseSelectionId: exercise.exerciseSelectionId,
        weight: set.weight,
        reps: set.reps,
      };
    } else {
      if (set.weight > current.weight || 
          (set.weight === current.weight && set.reps > current.reps)) {
        topSetsByExercise[exerciseId] = {
          setId: set.id,
          exerciseSelectionId: exercise.exerciseSelectionId,
          weight: set.weight,
          reps: set.reps,
        };
      }
    }
  }

  for (const topSet of Object.values(topSetsByExercise)) {
    const existingPRs = await selectPRsForUserAndExerciseSelection(userId, topSet.exerciseSelectionId);
    
    const prAtSameWeight = existingPRs.find(pr => pr.weight === topSet.weight);

    // PR: new weight OR more reps at same weight
    const isPR = !prAtSameWeight || topSet.reps > prAtSameWeight.reps;

    if (isPR) {
      await insertPersonalRecord({
        userId,
        workoutId,
        exerciseSelectionId: topSet.exerciseSelectionId,
        setId: topSet.setId,
        weight: topSet.weight,
        reps: topSet.reps,
      });
    }
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

export async function deleteWorkoutAction(userId: string, workoutId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("User must be signed in to create a new workout");
  }

  if (session.user.id !== userId) {
    throw new Error("You cannot add sets to other peoples' workouts");
  }

  const deletedWorkout = await deleteWorkout(workoutId);
  return deletedWorkout;
}
