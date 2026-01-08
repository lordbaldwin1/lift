"use client";

import type { DBSet, DBWorkout, ExerciseWithSelection } from "~/server/db/schema";
import useWorkoutMutations from "../_hooks/use-workout-mutations";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type SetRowProps = {
  workout: DBWorkout;
  exercises: ExerciseWithSelection[];
  sets: DBSet[];
  set: DBSet;
  sIdx: number;
}
export default function SetRow({ workout, exercises, sets, set, sIdx }: SetRowProps) {
  const queryClient = useQueryClient();
  const workoutId = workout.id;

  const {
    updateSetMutation,
    deleteSetMutation,
  } = useWorkoutMutations({ userId: workout.userId, workoutId: workout.id, sets, exercises })

  const isUpdating = updateSetMutation.isPending &&
    updateSetMutation.variables?.id === set.id;
  const isRemoving = deleteSetMutation.isPending &&
    deleteSetMutation.variables === set.id;
  const isPending = set.id.startsWith("temp-");

  function handleRemoveSet(setId: string) {
    deleteSetMutation.mutate(setId);
  }

  function handleUpdateSet(setId: string, field: "reps" | "weight", value: string) {
    const set = sets.find(s => s.id === setId);
    if (!set) {
      toast.error("Couldn't find set, try refreshing the page");
      return;
    }

    const numValue = value === "" ? null : Number(value);
    const updatedSet = { ...set, [field]: numValue };

    queryClient.setQueryData<DBSet[]>(["sets", workoutId], (old = []) => {
      return old.map(s => s.id === setId ? updatedSet : s);
    });
  }

  function onBlurSaveSet(setId: string) {
    const set = sets.find(s => s.id === setId);
    if (!set) {
      toast.error("Couldn't find set, try refreshing the page");
      return;
    }

    updateSetMutation.mutate(set);
  }

  return (
    <div
      className={`flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 transition-all duration-200 ${
        isRemoving ? "opacity-50" : "hover:bg-muted/50"
      }`}
    >
      <span className="text-sm font-medium text-muted-foreground tabular-nums w-12">
        Set {sIdx + 1}
      </span>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Input
            className={`w-24 text-center pr-8 transition-opacity duration-200 ${isUpdating ? "opacity-70" : ""}`}
            placeholder="0"
            value={set.weight ?? ""}
            type="number"
            onBlur={() => onBlurSaveSet(set.id)}
            onChange={(e) =>
              handleUpdateSet(set.id, "weight", e.target.value)
            }
            disabled={workout.completed}
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            lbs
          </span>
        </div>
        <span className="text-muted-foreground/40">×</span>
        <div className="relative">
          <Input
            className={`w-24 text-center pr-9 transition-opacity duration-200 ${isUpdating ? "opacity-70" : ""}`}
            placeholder="0"
            value={set.reps ?? ""}
            type="number"
            onBlur={() => onBlurSaveSet(set.id)}
            onChange={(e) =>
              handleUpdateSet(set.id, "reps", e.target.value)
            }
            disabled={workout.completed}
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            reps
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
          onClick={() => handleRemoveSet(set.id)}
          disabled={workout.completed || isRemoving || isPending}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

