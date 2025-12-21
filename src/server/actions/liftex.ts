"use server";

import { generateObject } from "ai";
import z from "zod";
import { env } from "~/env";
import { auth } from "../auth/auth";
import { headers } from "next/headers";
import { selectExerciseSelectionNames } from "../db/queries";

export async function getRecommendedWorkoutAction(workoutDescription: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to use this feature.");
  }

  if (session.user.id !== env.MY_USER_ID) {
    throw new Error("You must be whitelisted to use this feature.");
  }

  const exercises = await selectExerciseSelectionNames();
  if (exercises.length === 0) {
    throw new Error("Failed to fetch exercises, please try again.");
  }

  const exerciseNames = exercises.map(ex => ex.name).join(", ");

  const prompt = `Workout description: ${workoutDescription}\n\nAvailable exercises: ${exerciseNames}\n\nPlease use only these exercises when generating the workout.`;

  let { generatedWorkout } = await generateRecommendedWorkout(prompt);

  const exerciseNamesSet = new Set(exercises.map(ex => ex.name));

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

    ({ generatedWorkout } = await generateRecommendedWorkout(correctionPrompt));
  }

  return generatedWorkout;
}

export async function generateRecommendedWorkout(input: string) {
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