"use client";

import { toast } from "sonner";
import { useState } from "react";
import type { DBWorkout, Sentiment } from "~/server/db/schema";
import { updateWorkoutSentimentAction } from "~/server/actions/workout-actions";
import { LoaderCircle, Check } from "lucide-react";
import { cn } from "~/lib/utils";

type RateWorkoutProps = {
  workout: DBWorkout;
};

const sentimentOptions: { value: Sentiment; face: string; label: string }[] = [
  { value: "good", face: "(•‿•)", label: "Good" },
  { value: "medium", face: "(• _ •)", label: "Okay" },
  { value: "bad", face: "(• ‸ •)", label: "Bad" },
];

export default function RateWorkout(props: RateWorkoutProps) {
  const { workout } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSentiment, setSelectedSentiment] = useState<Sentiment | null>(
    workout.sentiment ?? null
  );
  const [saved, setSaved] = useState<boolean>(false);

  async function handleUpdateSentiment(sentiment: Sentiment) {
    setSelectedSentiment(sentiment);
    setLoading(true);
    setSaved(false);
    try {
      const updatedWorkout = await updateWorkoutSentimentAction(
        workout.userId,
        workout.id,
        sentiment,
      );
      if (!updatedWorkout) {
        toast.error("Failed to update sentiment, please try again");
        setSelectedSentiment(null);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`);
      setSelectedSentiment(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-12 flex w-full max-w-md justify-center items-center flex-col space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl">Your {workout.title} is complete</h1>
        <p className="text-muted-foreground">How did it go?</p>
      </div>

      <div className="flex flex-row items-start justify-center gap-8">
        {sentimentOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleUpdateSentiment(option.value)}
            disabled={loading}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl px-4 py-3 transition-all duration-150",
              "hover:bg-accent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selectedSentiment === option.value && "bg-accent ring-2 ring-primary",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="text-3xl select-none">{option.face}</span>
            <span className="text-sm text-muted-foreground font-medium">
              {option.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex justify-center h-6">
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            <span>Saving...</span>
          </div>
        )}
        {saved && !loading && (
          <div className="flex items-center gap-2 text-primary text-sm animate-in fade-in duration-200">
            <Check className="h-4 w-4" />
            <span>Saved</span>
          </div>
        )}
        {!loading && !saved && (
          <button
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => toast.info("Skipped rating")}
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
