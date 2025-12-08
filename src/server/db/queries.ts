import { and, asc, eq, gte, sql, count, min } from "drizzle-orm";
import { db } from ".";
import type {
  NewExercise,
  NewExerciseSelection,
  NewPersonalRecord,
  NewSet,
  NewWorkout,
  Sentiment,
} from "./schema";
import {
  exercise,
  exerciseSelection,
  personalRecord,
  set,
  workout,
} from "./schema";

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
  const rows = await db
    .select()
    .from(workout)
    .where(eq(workout.userId, userId));
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

export async function selectExercisesWithSelection(workoutId: string) {
  const rows = await db
    .select({
      id: exercise.id,
      note: exercise.note,
      order: exercise.order,
      repLowerBound: exercise.repLowerBound,
      repUpperBound: exercise.repUpperBound,
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
      workoutId: exercise.workoutId,
      exerciseSelectionId: exercise.exerciseSelectionId,
      exerciseSelection: {
        id: exerciseSelection.id,
        name: exerciseSelection.name,
        category: exerciseSelection.category,
        primaryMuscleGroup: exerciseSelection.primaryMuscleGroup,
        secondaryMuscleGroup: exerciseSelection.secondaryMuscleGroup,
      },
    })
    .from(exercise)
    .innerJoin(
      exerciseSelection,
      eq(exercise.exerciseSelectionId, exerciseSelection.id),
    )
    .where(eq(exercise.workoutId, workoutId))
    .orderBy(asc(exercise.order));
  return rows;
}

export async function updateExerciseOrder(exercideId: string, order: number) {
  const [row] = await db
    .update(exercise)
    .set({
      order: order,
    })
    .where(eq(exercise.id, exercideId))
    .returning();
  return row;
}

export async function updateExerciseNote(
  exerciseId: string,
  note: string | null,
) {
  const [row] = await db
    .update(exercise)
    .set({
      note: note,
    })
    .where(eq(exercise.id, exerciseId))
    .returning();
  return row;
}

export async function deleteExercise(exercideId: string) {
  const [row] = await db
    .delete(exercise)
    .where(eq(exercise.id, exercideId))
    .returning();
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
  const [row] = await db
    .update(set)
    .set({
      order: order,
    })
    .where(eq(set.id, setId))
    .returning();
  return row;
}

export async function insertSet(newSet: NewSet) {
  const [row] = await db.insert(set).values(newSet).returning();
  return row;
}

export async function updateSet(
  setId: string,
  reps: number | null,
  weight: number | null,
) {
  const [row] = await db
    .update(set)
    .set({
      reps: reps,
      weight: weight,
    })
    .where(eq(set.id, setId))
    .returning();
  return row;
}

export async function selectSetsByWorkout(workoutId: string) {
  const rows = await db
    .select({ set })
    .from(set)
    .innerJoin(exercise, eq(set.exerciseId, exercise.id))
    .where(eq(exercise.workoutId, workoutId))
    .orderBy(asc(set.order));
  return rows.map((r) => r.set);
}

export async function selectSetsByWorkoutWithExerciseSelection(
  workoutId: string,
) {
  const rows = await db
    .select({
      id: set.id,
      reps: set.reps,
      weight: set.weight,
      targetReps: set.targetReps,
      targetWeight: set.targetWeight,
      order: set.order,
      createdAt: set.createdAt,
      updatedAt: set.updatedAt,
      exerciseId: set.exerciseId,
      exerciseSelection: {
        id: exerciseSelection.id,
        name: exerciseSelection.name,
        category: exerciseSelection.category,
        primaryMuscleGroup: exerciseSelection.primaryMuscleGroup,
        secondaryMuscleGroup: exerciseSelection.secondaryMuscleGroup,
      },
    })
    .from(set)
    .innerJoin(exercise, eq(set.exerciseId, exercise.id))
    .innerJoin(
      exerciseSelection,
      eq(exercise.exerciseSelectionId, exerciseSelection.id),
    )
    .where(eq(exercise.workoutId, workoutId))
    .orderBy(asc(set.order));
  return rows;
}

export async function completeWorkout(workoutId: string, workoutDate: Date) {
  await db
    .update(workout)
    .set({
      completed: true,
      completedAt: workoutDate,
    })
    .where(eq(workout.id, workoutId));
}

export async function updateWorkoutSentiment(
  workoudId: string,
  sentiment: Sentiment,
) {
  const [row] = await db
    .update(workout)
    .set({
      sentiment: sentiment,
    })
    .where(eq(workout.id, workoudId))
    .returning();
  return row;
}

export async function insertExerciseSelection(
  newExerciseSelection: NewExerciseSelection,
) {
  const [row] = await db
    .insert(exerciseSelection)
    .values(newExerciseSelection)
    .returning();
  return row;
}

export async function insertExerciseSelections(
  newExerciseSelections: NewExerciseSelection[],
) {
  const rows = await db
    .insert(exerciseSelection)
    .values(newExerciseSelections)
    .returning();
  return rows;
}

export async function selectExerciseSelections() {
  const rows = await db
    .select()
    .from(exerciseSelection)
    .orderBy(asc(exerciseSelection.name));
  return rows;
}

export async function selectExerciseSelectionById(exerciseSelectionId: string) {
  const [row] = await db
    .select()
    .from(exerciseSelection)
    .where(eq(exerciseSelection.id, exerciseSelectionId));
  return row;
}

export async function selectPRsForUser(userId: string) {
  const rows = await db.select().from(personalRecord).where(eq(personalRecord.userId, userId));
  return rows;
}

export async function selectPRsForUserAndExerciseSelection(userId: string, exerciseSelectionId: string) {
  const rows = await db
    .select()
    .from(personalRecord)
    .where(
      and(
        eq(personalRecord.userId, userId),
        eq(personalRecord.exerciseSelectionId, exerciseSelectionId)
      )
    );
  return rows;
}

export async function insertPersonalRecord(newPR: NewPersonalRecord) {
  const [row] = await db.insert(personalRecord).values(newPR).returning();
  return row;
}

export async function selectPRsForWorkout(workoutId: string) {
  const rows = await db
    .select({
      id: personalRecord.id,
      weight: personalRecord.weight,
      reps: personalRecord.reps,
      createdAt: personalRecord.createdAt,
      exerciseSelection: {
        id: exerciseSelection.id,
        name: exerciseSelection.name,
      },
    })
    .from(personalRecord)
    .innerJoin(
      exerciseSelection,
      eq(personalRecord.exerciseSelectionId, exerciseSelection.id)
    )
    .where(eq(personalRecord.workoutId, workoutId));
  return rows;
}

export async function selectSetsWithPersonalRecords(workoutId: string, userId: string) {
  const rows = await db
    .select({
      id: set.id,
      reps: set.reps,
      weight: set.weight,
      targetReps: set.targetReps,
      targetWeight: set.targetWeight,
      order: set.order,
      createdAt: set.createdAt,
      updatedAt: set.updatedAt,
      exerciseId: set.exerciseId,
      personalRecord: {
        id: personalRecord.id,
        reps: sql<number | null>`pr_set.reps`,
        weight: sql<number | null>`pr_set.weight`,
      },
    })
    .from(set)
    .innerJoin(exercise, eq(set.exerciseId, exercise.id))
    .leftJoin(
      personalRecord,
      and(
        eq(exercise.exerciseSelectionId, personalRecord.exerciseSelectionId),
        eq(personalRecord.userId, userId)
      )
    )
    .leftJoin(
      sql`${set} as pr_set`,
      eq(personalRecord.setId, sql`pr_set.id`)
    )
    .where(eq(exercise.workoutId, workoutId))
    .orderBy(asc(set.order));
  return rows;
}

export async function selectWorkoutStats(userId: string) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const allWorkouts = await db
    .select({
      completedAt: workout.completedAt,
    })
    .from(workout)
    .where(and(eq(workout.userId, userId), eq(workout.completed, true)));

  const totalWorkouts = allWorkouts.length;
  const workoutsThisYear = allWorkouts.filter(
    (w) => w.completedAt && w.completedAt >= startOfYear
  ).length;
  const workoutsThisWeek = allWorkouts.filter(
    (w) => w.completedAt && w.completedAt >= startOfWeek
  ).length;

  let avgWorkoutsPerWeek = 0;
  if (totalWorkouts > 0) {
    const firstWorkout = await db
      .select({ completedAt: min(workout.completedAt) })
      .from(workout)
      .where(and(eq(workout.userId, userId), eq(workout.completed, true)));

    const firstDate = firstWorkout[0]?.completedAt;
    if (firstDate) {
      const weeksSinceFirst = Math.max(
        1,
        Math.ceil((now.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      );
      avgWorkoutsPerWeek = Math.round((totalWorkouts / weeksSinceFirst) * 10) / 10;
    }
  }

  return {
    totalWorkouts,
    workoutsThisYear,
    workoutsThisWeek,
    avgWorkoutsPerWeek,
  };
}

export async function selectSetsPerMuscleGroupThisWeek(userId: string) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      primaryMuscleGroup: exerciseSelection.primaryMuscleGroup,
      secondaryMuscleGroup: exerciseSelection.secondaryMuscleGroup,
    })
    .from(set)
    .innerJoin(exercise, eq(set.exerciseId, exercise.id))
    .innerJoin(workout, eq(exercise.workoutId, workout.id))
    .innerJoin(exerciseSelection, eq(exercise.exerciseSelectionId, exerciseSelection.id))
    .where(
      and(
        eq(workout.userId, userId),
        eq(workout.completed, true),
        gte(workout.completedAt, startOfWeek)
      )
    );

  const muscleGroupSets: Record<string, number> = {};
  for (const row of rows) {
    muscleGroupSets[row.primaryMuscleGroup] = (muscleGroupSets[row.primaryMuscleGroup] ?? 0) + 1;
    if (row.secondaryMuscleGroup) {
      muscleGroupSets[row.secondaryMuscleGroup] = (muscleGroupSets[row.secondaryMuscleGroup] ?? 0) + 0.5;
    }
  }

  return Object.entries(muscleGroupSets).map(([muscleGroup, value]) => ({
    muscleGroup,
    value: Math.round(value * 10) / 10,
  }));
}

export async function selectAvgSetsPerMuscleGroupPerWeek(userId: string) {
  const now = new Date();

  const firstWorkout = await db
    .select({ completedAt: min(workout.completedAt) })
    .from(workout)
    .where(and(eq(workout.userId, userId), eq(workout.completed, true)));

  const firstDate = firstWorkout[0]?.completedAt;
  if (!firstDate) {
    return [];
  }

  const weeksSinceFirst = Math.max(
    1,
    Math.ceil((now.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
  );

  const rows = await db
    .select({
      primaryMuscleGroup: exerciseSelection.primaryMuscleGroup,
      secondaryMuscleGroup: exerciseSelection.secondaryMuscleGroup,
    })
    .from(set)
    .innerJoin(exercise, eq(set.exerciseId, exercise.id))
    .innerJoin(workout, eq(exercise.workoutId, workout.id))
    .innerJoin(exerciseSelection, eq(exercise.exerciseSelectionId, exerciseSelection.id))
    .where(and(eq(workout.userId, userId), eq(workout.completed, true)));

  const muscleGroupSets: Record<string, number> = {};
  for (const row of rows) {
    muscleGroupSets[row.primaryMuscleGroup] = (muscleGroupSets[row.primaryMuscleGroup] ?? 0) + 1;
    if (row.secondaryMuscleGroup) {
      muscleGroupSets[row.secondaryMuscleGroup] = (muscleGroupSets[row.secondaryMuscleGroup] ?? 0) + 0.5;
    }
  }

  return Object.entries(muscleGroupSets).map(([muscleGroup, totalSets]) => ({
    muscleGroup,
    value: Math.round((totalSets / weeksSinceFirst) * 10) / 10,
  }));
}

export async function selectTotalSetsThisWeek(userId: string) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [result] = await db
    .select({
      totalSets: count(set.id),
    })
    .from(set)
    .innerJoin(exercise, eq(set.exerciseId, exercise.id))
    .innerJoin(workout, eq(exercise.workoutId, workout.id))
    .where(
      and(
        eq(workout.userId, userId),
        eq(workout.completed, true),
        gte(workout.completedAt, startOfWeek)
      )
    );

  return Number(result?.totalSets ?? 0);
}

export async function selectAvgTotalSetsPerWeek(userId: string) {
  const now = new Date();

  const firstWorkout = await db
    .select({ completedAt: min(workout.completedAt) })
    .from(workout)
    .where(and(eq(workout.userId, userId), eq(workout.completed, true)));

  const firstDate = firstWorkout[0]?.completedAt;
  if (!firstDate) {
    return 0;
  }

  const weeksSinceFirst = Math.max(
    1,
    Math.ceil((now.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
  );

  const [result] = await db
    .select({
      totalSets: count(set.id),
    })
    .from(set)
    .innerJoin(exercise, eq(set.exerciseId, exercise.id))
    .innerJoin(workout, eq(exercise.workoutId, workout.id))
    .where(and(eq(workout.userId, userId), eq(workout.completed, true)));

  const totalSets = Number(result?.totalSets ?? 0);
  return Math.round((totalSets / weeksSinceFirst) * 10) / 10;
}

export async function deleteWorkout(workoutId: string) {
  const [row] = await db.delete(workout).where(eq(workout.id, workoutId)).returning();
  return row;
}