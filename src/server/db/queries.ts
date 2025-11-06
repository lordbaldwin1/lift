import { db } from ".";
import type { NewWorkout } from "./schema";
import { workout } from "./schema";

export async function insertWorkout(newWorkout: NewWorkout) {
  const [row] = await db.insert(workout).values(newWorkout).returning();
  return row;
}
