"use client";

import { ArrowDown, ArrowUp, ChevronDownIcon, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { completeWorkoutAction, createExercise, createSet, deleteExerciseAction, deleteSetAction, updateExerciseNoteAction, updateExerciseOrderAction, updateSetAction, updateSetOrderAction } from "~/server/actions/workout-actions";
import type { DBExercise, DBSet, Sentiment } from "~/server/db/schema";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";

export type Workout = {
  id: string;
  title: string;
  description: string;
  sentiment: Sentiment | null;
  completed: boolean;
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
  const [workoutCompleteOpen, setWorkoutCompleteOpen] = useState(false)
  const [workoutDate, setWorkoutDate] = useState<Date | undefined>(new Date())

  const router = useRouter();

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

    let newSet: DBSet | undefined;
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

      newExercises[eIdx].sets.forEach(async (set, i) => {
        await updateSetOrderAction(workout.userId, set.id, i);
        set.order = i;
      });

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

    const updatedSet = {
      ...newExercises[eIdx].sets[sIdx],
      [field]: numValue,
    };

    newExercises[eIdx].sets[sIdx] = updatedSet;
    setExercises(newExercises);
  }

  async function onBlurSaveSet(eIdx: number, sIdx: number) {
    const setToSave = exercises[eIdx]?.sets[sIdx];

    if (!setToSave) {
      toast.error("Couldn't find set, try refreshing the page");
      return;
    }

    setLoading(true);
    try {
      const savedSet = await updateSetAction(workout.userId, setToSave);
      if (!savedSet) {
        toast.error("Failed to update set, please try again");
        return;
      }
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`);
      return;
    } finally {
      setLoading(false);
    }
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

  async function handleSaveExerciseNote(eIdx: number) {
    const newExercise = exercises[eIdx];
    if (!newExercise) {
      toast.error("Cannot find that exercise to update");
      return;
    }

    setLoading(true);
    try {
      const savedExercise = await updateExerciseNoteAction(workout.userId, newExercise.id, newExercise.note ?? null);
      if (!savedExercise) {
        toast.error("Failed to save note, please try again");
        return;
      }
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`);
      return;
    } finally {
      setLoading(false);
    }

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

  async function handleCompleteWorkout() {
    setLoading(true);
    try {
      await completeWorkoutAction(workout.userId, exercises, workout.id, workoutDate ?? new Date());
      router.push(`/workout/completed/${workout.id}`);
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`);
      return;
    } finally {
      setLoading(false);
    }

    setWorkout({
      ...workout,
      completed: true,
    })
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
                  disabled={workout.completed}
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
                    onBlur={() => onBlurSaveSet(eIdx, sIdx)}
                    onChange={(e) =>
                      handleUpdateSet(eIdx, sIdx, "weight", e.target.value)
                    }
                    disabled={workout.completed}
                  />
                  <Input
                    className="w-[75]"
                    placeholder="reps..."
                    value={set.reps ?? ""}
                    type="number"
                    onBlur={() => onBlurSaveSet(eIdx, sIdx)}
                    onChange={(e) =>
                      handleUpdateSet(eIdx, sIdx, "reps", e.target.value)
                    }
                    disabled={workout.completed}
                  />
                  <Button variant={"ghost"} onClick={() => handleRemoveSet(eIdx, sIdx)} disabled={workout.completed}>
                    <Trash />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center mt-8">
              <Button variant={"outline"} className="w-1/4 rounded-none rounded-l-lg" onClick={() => handleAddSet(eIdx)} disabled={workout.completed}>
                new set
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant={"outline"} className="w-1/4 rounded-none rounded-r-lg" disabled={workout.completed}>
                    add note
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>how did you feel during this exercise?</DialogTitle>
                    <DialogDescription>
                      in the future, this will be taken into account when pregenerating your next workouts.
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    id="notes"
                    value={exercises[eIdx]?.note}
                    onChange={(e) => handleUpdateExerciseNote(eIdx, e.target.value)}
                    placeholder={`felt great today, hit a PR on my top set...`}
                    disabled={workout.completed}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <div className="space-x-2">
                        <Button type="button" variant="secondary">
                          close
                        </Button>
                        <Button type="submit" onClick={() => handleSaveExerciseNote(eIdx)} disabled={workout.completed}>save note</Button>
                      </div>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
        <div className="flex flex-col items-center space-y-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-1/4" disabled={workout.completed}>
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
                    disabled={workout.completed}
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
                      disabled={workout.completed}
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
                      disabled={workout.completed}
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
                <Button onClick={handleAddExercise} disabled={workout.completed}>add exercise</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-1/4" disabled={workout.completed}>
                complete workout
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>are you sure you're finished with your workout?</DialogTitle>
                <DialogDescription>
                  once you complete your workout, you will not be able to edit it.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <Popover open={workoutCompleteOpen} onOpenChange={setWorkoutCompleteOpen}>
                  <Label htmlFor="date" className="px-1 w-24">workout date</Label>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date"
                      className="w-48 justify-between font-normal"
                    >
                      {workoutDate ? workoutDate.toLocaleDateString() : "select date"}
                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={workoutDate}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setWorkoutDate(date)
                        setWorkoutCompleteOpen(false)
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
                    <Button variant={"destructive"} onClick={handleCompleteWorkout} disabled={workout.completed}>
                      complete workout
                    </Button>
                  </div>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </main>
  );
}
