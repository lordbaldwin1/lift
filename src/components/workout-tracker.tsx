"use client";

import { ArrowDown, ArrowUp, Info, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { createExercise, createSet, deleteExerciseAction, deleteSetAction, updateExerciseOrderAction, updateSetOrderAction } from "~/server/actions/workout-actions";
import type { DBExercise, Set } from "~/server/db/schema";

export type Workout = {
  id: string;
  title: string;
  description: string;
  userId: string;
};

export type Exercise = {
  id: string;
  name: string;
  order: number;
  workoutId: string;
  sets: ExerciseSet[];
  note: string | undefined;
};

export type ExerciseSet = {
  id: string;
  order: number;
  exerciseId: string;
  reps: number | undefined;
  weight: number | undefined;
};

type WorkoutTrackerProps = {
  initialWorkout: Workout;
  initialExercises: Exercise[];
};

export default function WorkoutTracker({
  initialWorkout,
  initialExercises,
}: WorkoutTrackerProps) {
  const [workout, setWorkout] = useState<Workout>(initialWorkout);
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [exerciseToAdd, setExerciseToAdd] = useState<{
    name: string;
    position: number;
  }>({ name: "", position: 0 });
  const [loading, setLoading] = useState<boolean>(false);

  async function handleAddExercise() {
    if (exerciseToAdd.name.length === 0) {
      toast.error("You must enter an exercise name");
      return;
    }
    const newExercises = [...exercises];

    let newExercise: DBExercise | undefined;
    setLoading(true);
    try {
      newExercise = await createExercise(workout.userId, exerciseToAdd.name, exerciseToAdd.position, workout.id);
      if (!newExercise) {
        toast.error("Failed to add exercise, please try again");
        return;
      }
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`);
      return;
    } finally {
      setLoading(false);
    }

    newExercises.splice(newExercise.order, 0, {
      id: newExercise.id,
      name: newExercise.name,
      order: newExercise.order,
      workoutId: newExercise.workoutId,
      sets: [],
      note: newExercise.note ?? undefined,
    });

    newExercises.forEach(async (exercise, i) => {
      exercise.order = i;
      await updateExerciseOrderAction(workout.userId, exercise.id, i);
    });
    setExercises(newExercises);
    setExerciseToAdd({ name: "", position: 0 });
  }

  async function handleAddSet(index: number) {
    setLoading(true);

    const newExercises = [...exercises];

    if (!newExercises[index]) {
      toast.error("No exercise to add set to");
      return;
    }

    let newSet: Set | undefined;
    try {
      newSet = await createSet(workout.userId, newExercises[index], newExercises[index].sets.length);
      if (!newSet) {
        toast.error("Failed to add set, please try again");
        return;
      }
    } catch (err) {
      toast.error(`Failed to add set: ${(err as Error).message}`);
      return;
    } finally {
      setLoading(false);
    }

    newExercises[index].sets.push({
      id: newSet.id,
      order: newSet.order,
      exerciseId: newSet.exerciseId,
      reps: newSet.reps ?? undefined,
      weight: newSet.weight ?? undefined,
    });
    setExercises(newExercises);
  }

  async function handleRemoveSet(eIdx: number, sIdx: number) {
    const newExercises = [...exercises];

    if (!newExercises[eIdx]) {
      toast.error("Set doesn't exist");
      return;
    }

    const setToRemove = newExercises[eIdx].sets[sIdx];
    if (!setToRemove) {
      toast.error("Couldn't find set");
      return;
    }

    setLoading(true);
    try {
      const deletedSet = await deleteSetAction(workout.userId, setToRemove.id);
      if (!deletedSet) {
        toast.error("Failed to delete set, please try again");
        return;
      }

      newExercises[eIdx] = {
        ...newExercises[eIdx],
        sets: newExercises[eIdx].sets.filter((_, idx) => idx !== sIdx),
      };

      const updatedSets = newExercises[eIdx].sets.map((set, i) => ({
        ...set,
        order: i,
      }));

      newExercises[eIdx] = {
        ...newExercises[eIdx],
        sets: updatedSets,
      };

      await Promise.all(newExercises[eIdx].sets.map((set, i) => (
        updateSetOrderAction(workout.userId, set.id, i)
      )));

      setExercises(newExercises);
    } catch (err) {
      toast.error(`Failed to remove set: ${(err as Error).message}`);
      return;
    } finally {
      setLoading(false);
    }
  }

  function handleUpdateSet(
    eIdx: number,
    sIdx: number,
    field: string,
    value: string,
  ) {
    const newExercises = [...exercises];

    if (!newExercises[eIdx]?.sets[sIdx]) {
      toast.error("Couldn't find set, try refreshing the page");
      return;
    }

    const numValue = value === "" ? undefined : Number(value);
    newExercises[eIdx] = {
      ...newExercises[eIdx],
      sets: newExercises[eIdx].sets.map((set, idx) =>
        idx === sIdx ? { ...set, [field]: numValue } : set,
      ),
    };

    setExercises(newExercises);
  }

  function handleUpdateExerciseNote(eIdx: number, value: string) {
    const newExercises = [...exercises];
    if (!newExercises[eIdx]) {
      toast.error("Failed to update exercise note.");
      return;
    }

    newExercises[eIdx] = {
      ...newExercises[eIdx],
      note: value,
    };
    setExercises(newExercises);
  }

  async function handleDeleteExercise(eIdx: number) {
    const newExercises = [...exercises];

    if (!newExercises[eIdx]) {
      toast.error("Could not find exercise to delete");
      return;
    }

    setLoading(true);
    try {
      const deletedExercise = await deleteExerciseAction(workout.userId, newExercises[eIdx].id);
      if (!deletedExercise) {
        toast.error("Failed to delete exercise, please try again");
        return;
      }
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`);
      return;
    } finally {
      setLoading(false);
    }

    newExercises.splice(eIdx, 1);

    newExercises.forEach(async (exercise, i) => {
      await updateExerciseOrderAction(workout.userId, exercise.id, i);
      exercise.order = i;
    });

    setExercises(newExercises);
  }

  return (
    <main className="mt-8 flex flex-col items-center space-y-6">
      <h1 className="text-2xl">{workout.title}</h1>
      <p className="text-muted-foreground leading-relaxed">
        {workout.description}
      </p>

      <section className="flex w-full flex-col space-y-12">
        {exercises.map((exercise, eIdx) => (
          <div key={eIdx} className="space-y-4">
            <div className="flex flex-row justify-between text-xl">
              <div className="flex flex-row items-center gap-2">
                <h2>{exercise.name}</h2>
                <Button
                  variant={"ghost"}
                  onClick={() => handleDeleteExercise(eIdx)}
                >
                  <Trash size={18} />
                </Button>
              </div>
              <h2>result</h2>
            </div>
            {exercise.sets.map((set, sIdx) => (
              <div
                className="flex flex-row items-center justify-between"
                key={sIdx}
              >
                <span className="text-muted-foreground">set {sIdx + 1}</span>
                <div className="flex flex-row items-center space-x-2">
                  <Input
                    className="w-[75]"
                    placeholder="lbs..."
                    value={set.weight ?? ""}
                    type="number"
                    onChange={(e) =>
                      handleUpdateSet(eIdx, sIdx, "weight", e.target.value)
                    }
                  />
                  <Input
                    className="w-[75]"
                    placeholder="reps..."
                    value={set.reps ?? ""}
                    type="number"
                    onChange={(e) =>
                      handleUpdateSet(eIdx, sIdx, "reps", e.target.value)
                    }
                  />
                  <Button onClick={() => handleRemoveSet(eIdx, sIdx)}>
                    <Trash />
                  </Button>
                </div>
              </div>
            ))}
            <Button onClick={() => handleAddSet(eIdx)}>
              <Plus size={14} /> set
            </Button>
            <div className="flex flex-row items-center gap-2">
              <span>notes</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info
                    size={16}
                    className="hover:text-muted-foreground duration-200"
                  />
                </TooltipTrigger>
                <TooltipContent className="w-[128] text-center">
                  <p>
                    (coming soon!) your notes will be used as data in
                    pregenerating your next workout
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              id="notes"
              value={exercise.note}
              onChange={(e) => handleUpdateExerciseNote(eIdx, e.target.value)}
              placeholder={`(optional) enter notes about this exercies... (e.g., "felt strong today, hit a PR")`}
            />
          </div>
        ))}
        <div className="flex flex-row">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-1/2 rounded-none rounded-l-md">
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
                  <Input
                    id="link"
                    type="text"
                    value={exerciseToAdd.name}
                    onChange={(e) =>
                      setExerciseToAdd((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="incline dumbell press"
                  />
                </div>
              </div>
              {exercises.map((exercise, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span>{exercise.name}</span>
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
                <Button onClick={handleAddExercise}>add exercise</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button className="w-1/2 rounded-none rounded-r-md">
            save set data
          </Button>
        </div>
      </section>
    </main>
  );
}
