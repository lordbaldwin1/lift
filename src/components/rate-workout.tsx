"use client";

import { toast } from "sonner";
import { Button } from "./ui/button";
import { useState } from "react";
import type { DBWorkout, Sentiment } from "~/server/db/schema";
import { updateWorkoutSentimentAction } from "~/server/actions/workout-actions";
import { LoaderCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

type RateWorkoutProps = {
  workout: DBWorkout;
};
export default function RateWorkout(props: RateWorkoutProps) {
  const { workout } = props;
  const [loading, setLoading] = useState<boolean>(false);

  async function handleUpdateSentiment(sentiment: Sentiment) {
    setLoading(true);
    try {
      const updatedWorkout = await updateWorkoutSentimentAction(
        workout.userId,
        workout.id,
        sentiment,
      );
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
    <div className="mt-12 flex w-full justify-center items-center flex-col space-y-6">
      <h1 className="text-center text-2xl font-bold">
        Your workout is complete
      </h1>
      <Card className="max-w-md w-full flex space-y-6">
        <CardHeader className="flex justify-center">
          <CardTitle>How did it go?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="group flex flex-row items-center justify-center gap-6">
            <button
              onClick={() => handleUpdateSentiment("good")}
              className="rounded-full bg-transparent text-4xl duration-200 hover:scale-105"
            >
              (◕‿◕)
            </button>
            <button
              onClick={() => handleUpdateSentiment("medium")}
              className="rounded-full bg-transparent text-4xl duration-200 hover:scale-105"
            >
              (•_•)
            </button>
            <button
              onClick={() => handleUpdateSentiment("bad")}
              className="rounded-full bg-transparent text-4xl duration-200 hover:scale-105"
            >{`(>_<)`}</button>
          </div>
        </CardContent>
        <CardFooter className="flex w-full justify-center">
          <Button className="w-1/4 rounded-full">
            {loading ? <LoaderCircle className="animate-spin" /> : "Skip"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
