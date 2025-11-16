"use client";

import type { DBExercise, DBSet, DBWorkout } from "~/server/db/schema";
import useWorkoutMutations from "./hooks/use-workout-mutations";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type SetRowProps = {
  workout: DBWorkout;
  exercises: DBExercise[];
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
      className={`flex flex-row items-center justify-between transition-opacity ${isRemoving ? "opacity-50" : ""}`}
      key={set.id}
    >
      <span className="text-muted-foreground">set {sIdx + 1}</span>
      <div className="flex flex-row items-center space-x-2">
        <Input
          className={`w-[75] transition-opacity ${isUpdating ? "opacity-70" : ""}`}
          placeholder="lbs..."
          value={set.weight ?? ""}
          type="number"
          onBlur={() => onBlurSaveSet(set.id)}
          onChange={(e) =>
            handleUpdateSet(set.id, "weight", e.target.value)
          }
          disabled={workout.completed}
        />
        <Input
          className={`w-[75] transition-opacity ${isUpdating ? "opacity-70" : ""}`}
          placeholder="reps..."
          value={set.reps ?? ""}
          type="number"
          onBlur={() => onBlurSaveSet(set.id)}
          onChange={(e) =>
            handleUpdateSet(set.id, "reps", e.target.value)
          }
          disabled={workout.completed}
        />
        <Button
          variant={"ghost"}
          onClick={() => handleRemoveSet(set.id)}
          disabled={workout.completed || isRemoving || isPending}
        >
          <Trash />
        </Button>
      </div>
    </div>
  );
}