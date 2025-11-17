"use client";

import { toast } from "sonner";
import { Button } from "./ui/button";
import { useState } from "react";
import type { DBWorkout, Sentiment } from "~/server/db/schema";
import { updateWorkoutSentimentAction } from "~/server/actions/workout-actions";

type RateWorkoutProps = {
  workout: DBWorkout;
}
export default function RateWorkout(props: RateWorkoutProps) {
  const { workout } = props;
  const [loading, setLoading] = useState<boolean>(false);

  async function handleUpdateSentiment(sentiment: Sentiment) {
    setLoading(true);
    try {
      const updatedWorkout = updateWorkoutSentimentAction(workout.userId, workout.id, sentiment);
      if (!updatedWorkout) {
        toast.error("Failed to update sentiment, please try again");
      } else {
        toast.success("Saved workout sentiment");
      }
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`);
      return;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center w-full py-6 space-y-6">
      <div>
        <div className="text-2xl font-bold text-center">your workout is complete</div>
        <div className="text-lg text-center text-muted-foreground">how did it go?</div>
      </div>
      <div className="flex flex-row items-center justify-center gap-6 group">
        <button onClick={() => handleUpdateSentiment("good")} className="p-4 text-4xl rounded-full hover:scale-110 duration-150 bg-transparent">😁</button>
        <button onClick={() => handleUpdateSentiment("medium")} className="p-4 text-4xl rounded-full hover:scale-110 duration-150 bg-transparent">😐</button>
        <button onClick={() => handleUpdateSentiment("bad")} className="p-4 text-4xl rounded-full hover:scale-110 duration-150 bg-transparent">😩</button>
      </div>
      <div className="flex justify-center items-center">
        <Button>skip</Button>
      </div>
    </div>
  )
}