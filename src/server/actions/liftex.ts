"use server";

import { generateObject } from "ai";
import z from "zod";
import { env } from "~/env";
import { auth } from "../auth/auth";
import { headers } from "next/headers";
import { selectAvgSetsPerMuscleGroupPerWeekLastMonth, selectPRsForUserWithExerciseSelectionLastMonth, selectRecentWorkoutsWithMuscleGroups, selectUserPreviousExerciseNamesLastMonth } from "../db/queries";
import { ExerciseName, MuscleGroup } from "./exercise-selection-actions";

const SPLIT_MUSCLE_GROUPS = {
  ppl: {
    push: [MuscleGroup.Chest, MuscleGroup.SideDelt, MuscleGroup.Triceps],
    pull: [MuscleGroup.Lats, MuscleGroup.MidUpperBack, MuscleGroup.RearDelt, MuscleGroup.Biceps],
    legs: [MuscleGroup.Quad, MuscleGroup.Hamstring, MuscleGroup.Glutes, MuscleGroup.Calf],
  },
  upper_lower: {
    upper: [MuscleGroup.Chest, MuscleGroup.Lats, MuscleGroup.MidUpperBack, MuscleGroup.FrontDelt, MuscleGroup.SideDelt, MuscleGroup.RearDelt, MuscleGroup.Biceps, MuscleGroup.Triceps],
    lower: [MuscleGroup.Quad, MuscleGroup.Hamstring, MuscleGroup.Glutes, MuscleGroup.Calf],
  },
  full_body: {
    full: [MuscleGroup.Chest, MuscleGroup.Lats, MuscleGroup.MidUpperBack, MuscleGroup.FrontDelt, MuscleGroup.SideDelt, MuscleGroup.Quad, MuscleGroup.Hamstring, MuscleGroup.Glutes],
  },
};

function determineNextWorkoutType(
  split: "ppl" | "upper_lower" | "full_body",
  recentMuscleGroups: string[]
): { workoutType: string; targetMuscleGroups: string[] } {
  if (split === "ppl") {
    const { push, pull, legs } = SPLIT_MUSCLE_GROUPS.ppl;
    const hitPush = recentMuscleGroups.some((mg) => push.includes(mg as MuscleGroup));
    const hitPull = recentMuscleGroups.some((mg) => pull.includes(mg as MuscleGroup));
    const hitLegs = recentMuscleGroups.some((mg) => legs.includes(mg as MuscleGroup));

    if (!hitPush) return { workoutType: "Push", targetMuscleGroups: push };
    if (!hitPull) return { workoutType: "Pull", targetMuscleGroups: pull };
    if (!hitLegs) return { workoutType: "Legs", targetMuscleGroups: legs };
    return { workoutType: "Push", targetMuscleGroups: push };
  }

  if (split === "upper_lower") {
    const { upper, lower } = SPLIT_MUSCLE_GROUPS.upper_lower;
    const hitUpper = recentMuscleGroups.some((mg) => upper.includes(mg as MuscleGroup));
    const hitLower = recentMuscleGroups.some((mg) => lower.includes(mg as MuscleGroup));

    if (!hitUpper || hitLower) return { workoutType: "Upper", targetMuscleGroups: upper };
    return { workoutType: "Lower", targetMuscleGroups: lower };
  }

  return { workoutType: "Full Body", targetMuscleGroups: SPLIT_MUSCLE_GROUPS.full_body.full };
}

export type GenerationQuestions = {
  experience: "beginner" | "experienced";
  split: "ppl" | "upper_lower" | "full_body";
  volume: "low" | "medium" | "high";
  frequency: "once_a_week" | "twice_a_week";
  weightDirection: "cutting" | "maintaining" | "bulking";
};

export async function generateWorkoutTemplateAction(generationQuestions: GenerationQuestions) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to use this feature.");
  }

  if (session.user.id !== env.MY_USER_ID) {
    throw new Error("You must be whitelisted to use this feature.");
  }

  const { split, weightDirection, frequency } = generationQuestions;

  const [personalRecords, avgSetsPerMuscleGroupPerWeek, recentWorkouts, preferredExercises] = await Promise.all([
    selectPRsForUserWithExerciseSelectionLastMonth(session.user.id),
    selectAvgSetsPerMuscleGroupPerWeekLastMonth(session.user.id),
    selectRecentWorkoutsWithMuscleGroups(session.user.id, 2),
    selectUserPreviousExerciseNamesLastMonth(session.user.id),
  ]);

  const prCountByMuscleGroup: Record<string, number> = {};
  for (const pr of personalRecords) {
    const mg = pr.exerciseSelection.primaryMuscleGroup;
    prCountByMuscleGroup[mg] = (prCountByMuscleGroup[mg] ?? 0) + 1;
  }

  const volumeByMuscleGroup: Record<string, number> = {};
  for (const { muscleGroup, value } of avgSetsPerMuscleGroupPerWeek) {
    volumeByMuscleGroup[muscleGroup] = value;
  }

  const recentMuscleGroups = recentWorkouts.flatMap((w) => w.primaryMuscleGroups);
  const { workoutType, targetMuscleGroups } = determineNextWorkoutType(split, recentMuscleGroups);

  // Weekly volume target is always 10-20 sets per muscle group
  const weeklyVolumeThresholds = { min: 8, optimalLow: 10, optimalHigh: 20, max: 24 };

  const muscleGroupAnalysis: string[] = [];
  for (const muscleGroup of targetMuscleGroups) {
    const prCount = prCountByMuscleGroup[muscleGroup] ?? 0;
    const avgSets = volumeByMuscleGroup[muscleGroup] ?? 0;
    
    let recommendation = "";
    if (weightDirection === "cutting") {
      if (avgSets < weeklyVolumeThresholds.min) {
        recommendation = `increase volume to maintain muscle (aim for ${weeklyVolumeThresholds.optimalLow}-${weeklyVolumeThresholds.optimalHigh} sets/week)`;
      } else if (avgSets > weeklyVolumeThresholds.max) {
        recommendation = `reduce volume for recovery (aim for ${weeklyVolumeThresholds.optimalLow}-${weeklyVolumeThresholds.optimalHigh} sets/week)`;
      } else {
        recommendation = "maintain current volume";
      }
    } else {
      const expectedPRs = 2;
      if (prCount >= expectedPRs) {
        recommendation = "progress is good, maintain or slightly increase volume";
      } else if (avgSets >= weeklyVolumeThresholds.optimalHigh) {
        recommendation = `no PRs with high volume - reduce sets to improve recovery (aim for 12-16 sets/week)`;
      } else if (avgSets < weeklyVolumeThresholds.optimalLow) {
        recommendation = `no PRs with low volume - increase sets for more stimulus (aim for ${weeklyVolumeThresholds.optimalLow}-${weeklyVolumeThresholds.optimalHigh} sets/week)`;
      } else {
        recommendation = "no PRs - consider increasing intensity or adjusting exercise selection";
      }
    }
    
    muscleGroupAnalysis.push(`${muscleGroup}: ${avgSets} sets/week, ${prCount} PRs → ${recommendation}`);
  }

  const recentWorkoutSummary = recentWorkouts.length > 0
    ? recentWorkouts.map((w) => `${w.title} (${w.primaryMuscleGroups.join(", ")})`).join("; ")
    : "No recent workouts";

  const exerciseNames = Object.values(ExerciseName);
  const exerciseNamesString = exerciseNames.join(", ");

  const frequencyLabel = frequency === "once_a_week" ? "1x/week" : "2x/week";
  const perSessionSetsRange = frequency === "once_a_week" ? "10-20" : "5-10";

  const preferredExercisesSection = preferredExercises.length > 0
    ? `User's preferred exercises (used in last month): ${preferredExercises.join(", ")}`
    : "No exercise history available";

  const prompt = `
User preferences: ${JSON.stringify(generationQuestions)}

Workout type needed: ${workoutType}
Target muscle groups: ${targetMuscleGroups.join(", ")}
Training frequency: ${frequencyLabel} per muscle group
Per-session volume target: ${perSessionSetsRange} sets per muscle group (weekly target is 10-20 sets)

Recent workouts: ${recentWorkoutSummary}

${preferredExercisesSection}

Per-muscle-group weekly analysis:
${muscleGroupAnalysis.join("\n")}

Available exercises: ${exerciseNamesString}

Generate a ${workoutType} hypertrophy workout targeting the specified muscle groups. Use only the exercises listed above. 
Keep the title short (2-4 words) and the description to one brief sentence.
IMPORTANT: Since user trains each muscle group ${frequencyLabel}, program ${perSessionSetsRange} sets per muscle group in THIS session (not the full weekly volume). Apply the per-muscle-group recommendations proportionally.
IMPORTANT: Prioritize the user's preferred exercises when possible, but you may use other exercises from the available list if needed to target specific muscle groups.`;

  let { generatedWorkout } = await generateWorkout(prompt);

  const exerciseNamesSet = new Set<string>(exerciseNames);

  // Validate exercise selection names exist in database
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    const invalidNames = generatedWorkout.exercises
      .map(ex => ex.exerciseSelectionName)
      .filter(name => !exerciseNamesSet.has(name));

    if (invalidNames.length === 0) {
      break;
    }

    retries++;

    if (retries >= maxRetries) {
      throw new Error(`Failed to generate valid workout after ${maxRetries} attempts. Invalid exercises: ${invalidNames.join(", ")}`);
    }

    const correctionPrompt = `${prompt}

      Your previous response:
      ${JSON.stringify(generatedWorkout, null, 2)}

      The following exercise names don't exist in the available exercises list: ${invalidNames.join(", ")}

      Please fix only the invalid exercise names by replacing them with similar exercises from the available list. Keep the rest of the workout the same.`;

    ({ generatedWorkout } = await generateWorkout(correctionPrompt));
  }

  return generatedWorkout;
}

export async function generateWorkout(input: string) {
  const { object: generatedWorkout } = await generateObject({
    model: "google/gemini-2.5-flash-lite-preview-09-2025",
    system: "Generate a hypertrophy workout for the given prompt. Please use only the exercises listed in the Available exercises given.",
    prompt: input,
    schema: z.object({
      title: z.string(),
      description: z.string(),
      exercises: z.array(z.object({
        exerciseSelectionName: z.string(),
        sets: z.number(),
      })),
    })
  });

  return { generatedWorkout };
}