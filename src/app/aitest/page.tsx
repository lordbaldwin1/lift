"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { getRecommendedWorkoutAction } from "~/server/actions/liftex";


export default function AiTestPage() {
  const [generation, setGeneration] = useState<string>('');
  return (
    <div>
      <Button
        onClick={async () => {
          const workout = await getRecommendedWorkoutAction("A pull day workout with 7 exercises");

          setGeneration(JSON.stringify(workout, null, 2));
        }}
      >
        generate workout
      </Button>

      <pre>{generation}</pre>
    </div>
  );
}