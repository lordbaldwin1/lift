"use client";

import { toast } from "sonner";
import { useState } from "react";
import type { DBWorkout, Sentiment } from "~/server/db/schema";
import { updateWorkoutSentimentAction } from "~/server/actions/workout-actions";
import { LoaderCircle, Check, Trophy } from "lucide-react";
import { cn } from "~/lib/utils";

type RateWorkoutProps = {
  workout: DBWorkout;
};

const sentimentOptions: { value: Sentiment; face: string; label: string }[] = [
  { value: "good", face: "(•‿•)", label: "Great" },
  { value: "medium", face: "(• _ •)", label: "Okay" },
  { value: "bad", face: "(• ‸ •)", label: "Tough" },
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
    <div className="flex w-full justify-center items-center flex-col space-y-6 pb-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
          <Trophy className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight text-foreground uppercase">
          WORKOUT COMPLETE
        </h1>
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">{workout.title}</span> — How did it go?
        </p>
      </div>

      <div className="flex flex-row items-start justify-center gap-4 sm:gap-6">
        {sentimentOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleUpdateSentiment(option.value)}
            disabled={loading}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl px-5 py-4 transition-all duration-200",
              "hover:bg-muted/50 hover:scale-105",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selectedSentiment === option.value && "bg-primary/10 ring-2 ring-primary scale-105",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="text-4xl select-none">{option.face}</span>
            <span className={cn(
              "text-sm font-medium transition-colors",
              selectedSentiment === option.value ? "text-primary" : "text-muted-foreground"
            )}>
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
        {!loading && !saved && !selectedSentiment && (
          <button
            className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-200"
            onClick={() => toast.info("Skipped rating")}
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}

