"use client";

import { ArrowDown, ArrowUp, ChevronDownIcon, Plus, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { useState } from "react";
import { toast } from "sonner";
import useWorkoutMutations from "../_hooks/use-workout-mutations";
import type { DBSet, DBWorkout, ExerciseWithSelection } from "~/server/db/schema";
import useExerciseSelectionData from "../../_hooks/use-exercise-selection-data";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command";
import useWorkoutData from "../_hooks/use-workout-data";

type WorkoutButtonGroupProps = {
  workout: DBWorkout,
  initialExercises: ExerciseWithSelection[],
  initialSets: DBSet[],
}
export default function WorkoutButtonGroup({
  workout,
  initialExercises,
  initialSets,
}: WorkoutButtonGroupProps) {
  const [exerciseToAdd, setExerciseToAdd] = useState<{
    exerciseSelectionId: string;
    position: number;
    name: string;
  }>({ exerciseSelectionId: "", position: 0, name: "" });
  const [open, setOpen] = useState(false);
  const [workoutCompleteOpen, setWorkoutCompleteOpen] = useState(false);
  const [workoutDate, setWorkoutDate] = useState<Date | undefined>(new Date());

  const exerciseSelections = useExerciseSelectionData();

  const selectedExercise = exerciseSelections.find(
    (s) => s.id === exerciseToAdd.exerciseSelectionId
  );

  const {
    exercises,
    sets,
  } = useWorkoutData({ workoutId: workout.id, initialExercises: initialExercises, initialSets: initialSets });

  const {
    addExerciseMutation,
    completeWorkoutMutation
  } = useWorkoutMutations({ userId: workout.userId, workoutId: workout.id, exercises: exercises, sets: sets, });

  function handleAddExercise() {
    if (exerciseToAdd.exerciseSelectionId.length === 0) {
      toast.error("You must select an exercise.");
      return;
    }

    if (exerciseToAdd.position > exercises.length
    || exerciseToAdd.position < 0
    ) {
      toast.error("Select a position to add exercise.");
      return;
    }

    addExerciseMutation.mutate(
      { exerciseSelectionId: exerciseToAdd.exerciseSelectionId, order: exerciseToAdd.position, name: exerciseToAdd.name },
      {
        onSuccess: () => {
          setExerciseToAdd({ exerciseSelectionId: "", position: 0, name: "" });
        },
      }
    );
  }

  function handleCompleteWorkout() {
    if (exercises.length < 1) {
      toast.error("You must have completed at least 1 exercise.");
      return;
    }
    if (sets.length < 1) {
      toast.error("You must have completed at least 1 set.");
      return;
    }
    for (const set of sets) {
      if (!set.reps || !set.weight) {
        toast.error("You have unfilled weight/rep data. Either remove the empty set or fill in the weight/reps.");
        return;
      }
    }
    completeWorkoutMutation.mutate(workoutDate ?? new Date());
  }

  const isCompletingWorkout = completeWorkoutMutation.isPending;
  const isAddingExercise = addExerciseMutation.isPending;

  if (workout.completed) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-3 pt-8 pb-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            size="lg" 
            variant="outline"
            className="w-full max-w-md font-semibold"
            disabled={workout.completed}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Exercise
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-tight">
              ADD EXERCISE
            </DialogTitle>
            <DialogDescription>
              Select an exercise and choose where to insert it in your workout.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Exercise</Label>
              <Popover open={open} onOpenChange={setOpen} modal={true}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    role="combobox" 
                    className="w-full justify-between font-normal"
                  >
                    {selectedExercise?.name ?? "Select exercise..."}
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                  <Command className="max-h-[300px]">
                    <CommandInput placeholder="Search exercises..." />
                    <CommandList className="max-h-[250px] overflow-y-auto">
                      <CommandEmpty>No exercise found.</CommandEmpty>
                      <CommandGroup>
                        {exerciseSelections.map((selection) => (
                          <CommandItem
                            key={selection.id}
                            value={selection.name}
                            onSelect={() => {
                              setExerciseToAdd({ ...exerciseToAdd, exerciseSelectionId: selection.id, name: selection.name });
                              setOpen(false);
                            }}
                          >
                            {selection.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {exercises.length > 0 && (
              <div className="space-y-2">
                <Label>Position</Label>
                <div className="space-y-1 rounded-lg border border-border/50 p-2">
                  {exercises.map((exercise, i) => (
                    <div 
                      key={exercise.id} 
                      className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50"
                    >
                      <span className="text-sm truncate">{exercise.exerciseSelection.name}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-7 w-7 ${i === exerciseToAdd.position ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                          onClick={() =>
                            setExerciseToAdd((prev) => ({
                              ...prev,
                              position: i,
                            }))
                          }
                          disabled={workout.completed || isAddingExercise}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-7 w-7 ${i + 1 === exerciseToAdd.position ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                          onClick={() =>
                            setExerciseToAdd((prev) => ({
                              ...prev,
                              position: i + 1,
                            }))
                          }
                          disabled={workout.completed || isAddingExercise}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleAddExercise}
              disabled={workout.completed || isAddingExercise}
            >
              {isAddingExercise ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Exercise"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button 
            size="lg"
            className="w-full max-w-md font-semibold"
            disabled={workout.completed || isCompletingWorkout}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Workout
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-tight">
              FINISH WORKOUT?
            </DialogTitle>
            <DialogDescription>
              Once you complete your workout, you will not be able to edit it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Workout Date</Label>
            <Popover
              open={workoutCompleteOpen}
              onOpenChange={setWorkoutCompleteOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal"
                >
                  {workoutDate
                    ? workoutDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Select date"}
                  <ChevronDownIcon className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={workoutDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setWorkoutDate(date);
                    setWorkoutCompleteOpen(false);
                  }}
                  hidden={{ after: new Date() }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleCompleteWorkout}
              disabled={workout.completed || isCompletingWorkout}
            >
              {isCompletingWorkout ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Completing...
                </>
              ) : (
                "Complete Workout"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

