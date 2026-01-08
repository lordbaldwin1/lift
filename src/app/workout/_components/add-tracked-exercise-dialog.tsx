"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Plus, Check } from "lucide-react";
import useExerciseSelectionData from "../_hooks/use-exercise-selection-data";
import { cn } from "~/lib/utils";
import type { TrackedExerciseWithSelection } from "~/server/db/queries";

type AddTrackedExerciseDialogProps = {
  trackedExercises: TrackedExerciseWithSelection[];
  onAddExercise: (exerciseSelectionId: string) => void;
  isAdding: boolean;
};

export default function AddTrackedExerciseDialog({
  trackedExercises,
  onAddExercise,
  isAdding,
}: AddTrackedExerciseDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const exerciseSelections = useExerciseSelectionData();

  const trackedIds = new Set(trackedExercises.map((t) => t.exerciseSelectionId));

  const handleSelect = (exerciseSelectionId: string) => {
    if (!trackedIds.has(exerciseSelectionId)) {
      onAddExercise(exerciseSelectionId);
      setOpen(false);
      setSearch("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Track Exercise
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight">
            TRACK AN EXERCISE
          </DialogTitle>
          <DialogDescription>
            Select an exercise to track its estimated 1RM progression over time.
          </DialogDescription>
        </DialogHeader>
        <Command className="rounded-lg border">
          <CommandInput
            placeholder="Search exercises..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No exercises found.</CommandEmpty>
            <CommandGroup>
              {exerciseSelections.map((exercise) => {
                const isTracked = trackedIds.has(exercise.id);
                return (
                  <CommandItem
                    key={exercise.id}
                    value={exercise.name}
                    onSelect={() => handleSelect(exercise.id)}
                    disabled={isTracked || isAdding}
                    className={cn(
                      "flex items-center justify-between",
                      isTracked && "opacity-50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{exercise.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {exercise.primaryMuscleGroup.replace(/_/g, " ")}
                      </span>
                    </div>
                    {isTracked && <Check className="h-4 w-4 text-primary" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

