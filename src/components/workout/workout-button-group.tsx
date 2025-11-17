import { ArrowDown, ArrowUp, ChevronDownIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { useState } from "react";
import { toast } from "sonner";
import useWorkoutMutations from "./hooks/use-workout-mutations";
import type { DBSet, DBWorkout, ExerciseWithSelection } from "~/server/db/schema";
import useExerciseSelectionData from "./hooks/use-exercise-selection-data";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";

type WorkoutButtonGroupProps = {
  workout: DBWorkout,
  exercises: ExerciseWithSelection[],
  sets: DBSet[],
}
export default function WorkoutButtonGroup({
  workout,
  exercises,
  sets,
}: WorkoutButtonGroupProps) {
  const [exerciseToAdd, setExerciseToAdd] = useState<{
    exerciseSelectionId: string;
    position: number;
    name: string;
  }>({ exerciseSelectionId: "", position: exercises.length, name: "" });
  const [open, setOpen] = useState(false);
  const [workoutCompleteOpen, setWorkoutCompleteOpen] = useState(false);
  const [workoutDate, setWorkoutDate] = useState<Date | undefined>(new Date());

  const exerciseSelections = useExerciseSelectionData();

  const selectedExercise = exerciseSelections.find(
    (s) => s.id === exerciseToAdd.exerciseSelectionId
  );

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
          setExerciseToAdd({ exerciseSelectionId: "", position: exercises.length + 1, name: "" });
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

  return (
    <div className="flex flex-col items-center space-y-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-1/2" disabled={workout.completed}>
            add exercise
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>add an exercise</DialogTitle>
            <DialogDescription>
              enter a name and select where to insert the exercise
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Popover open={open} onOpenChange={setOpen} modal={true}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox">
                    {selectedExercise?.name || "Select exercise..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command className="max-h-[300px]">
                    <CommandInput placeholder="Search exercises..." />
                    <CommandList className="max-h-[250px] overflow-y-auto">
                      <CommandEmpty>No exercise found.</CommandEmpty>
                      <CommandGroup>
                        {exerciseSelections.map((selection) => (
                          <CommandItem
                            key={selection.id}
                            value={selection.name}
                            onSelect={(value) => {
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
          </div>
          {exercises.map((exercise, i) => (
            <div key={exercise.id} className="flex items-center justify-between">
              <span>{exercise.exerciseSelection.name}</span>
              <div className="space-x-1">
                <Button
                  variant={"ghost"}
                  className={
                    i === exerciseToAdd.position ? "bg-accent" : ""
                  }
                  onClick={() =>
                    setExerciseToAdd((prev) => ({
                      ...prev,
                      position: i,
                    }))
                  }
                  disabled={workout.completed || isAddingExercise}
                >
                  <ArrowUp />
                </Button>
                <Button
                  variant={"ghost"}
                  className={
                    i + 1 === exerciseToAdd.position ? "bg-accent" : ""
                  }
                  onClick={() =>
                    setExerciseToAdd((prev) => ({
                      ...prev,
                      position: i + 1,
                    }))
                  }
                  disabled={workout.completed || isAddingExercise}
                >
                  <ArrowDown />
                </Button>
              </div>
            </div>
          ))}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                close
              </Button>
            </DialogClose>
            <Button
              onClick={handleAddExercise}
              disabled={workout.completed || isAddingExercise}
            >
              {isAddingExercise ? "adding..." : "add exercise"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-1/2" disabled={workout.completed || isCompletingWorkout}>
            complete workout
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              are you sure you&apos;re finished with your workout?
            </DialogTitle>
            <DialogDescription>
              once you complete your workout, you will not be able to edit
              it.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Popover
              open={workoutCompleteOpen}
              onOpenChange={setWorkoutCompleteOpen}
            >
              <Label htmlFor="date" className="w-24 px-1">
                workout date
              </Label>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-48 justify-between font-normal"
                >
                  {workoutDate
                    ? workoutDate.toLocaleDateString()
                    : "select date"}
                  <ChevronDownIcon />
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
              <div className="space-x-2">
                <Button type="button" variant="secondary">
                  close
                </Button>
                <Button
                  variant={"destructive"}
                  onClick={handleCompleteWorkout}
                  disabled={workout.completed || isCompletingWorkout}
                >
                  {isCompletingWorkout ? "completing..." : "complete workout"}
                </Button>
              </div>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}