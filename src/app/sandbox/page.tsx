"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { seedExerciseSelections, seedAdditionalExercises } from "~/server/actions/workout-actions";
import { toast } from "sonner";

export default function SandboxPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seededCount, setSeededCount] = useState(0);
  const [isSeedingAdditional, setIsSeedingAdditional] = useState(false);
  const [additionalSeededCount, setAdditionalSeededCount] = useState(0);

  async function handleSeed() {
    setIsSeeding(true);
    try {
      const exercises = await seedExerciseSelections();
      setSeededCount(exercises.length);
      toast.success(`Successfully seeded ${exercises.length} exercises!`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to seed exercises: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSeeding(false);
    }
  }

  async function handleSeedAdditional() {
    setIsSeedingAdditional(true);
    try {
      const exercises = await seedAdditionalExercises();
      setAdditionalSeededCount(exercises.length);
      toast.success(`Successfully seeded ${exercises.length} additional exercises!`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to seed additional exercises: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSeedingAdditional(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12">
      <h1 className="text-3xl font-bold">Exercise Database Seed</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Click the button below to populate your exercise selection table with common exercises
        organized by muscle group.
      </p>
      <div className="flex gap-4">
        <Button 
          onClick={handleSeed} 
          disabled={isSeeding}
          size="lg"
        >
          {isSeeding ? "Seeding..." : "Seed Exercise Selections"}
        </Button>
        <Button 
          onClick={handleSeedAdditional} 
          disabled={isSeedingAdditional}
          size="lg"
          variant="secondary"
        >
          {isSeedingAdditional ? "Seeding..." : "Seed Additional Exercises"}
        </Button>
      </div>
      {seededCount > 0 && (
        <p className="text-green-600 font-medium">
          Seeded {seededCount} exercises successfully!
        </p>
      )}
      {additionalSeededCount > 0 && (
        <p className="text-green-600 font-medium">
          Seeded {additionalSeededCount} additional exercises successfully!
        </p>
      )}
    </div>
  )
}