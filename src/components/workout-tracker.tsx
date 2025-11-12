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
import {
  completeWorkoutAction,
  createExercise,
  createSet,
  deleteExerciseAction,
  deleteSetAction,
  updateExerciseNoteAction,
  updateSetAction,
  updateSetOrderAction,
} from "~/server/actions/workout-actions";
import type { DBExercise, DBSet, DBWorkout } from "~/server/db/schema";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type WorkoutTrackerProps = {
  initialWorkout: DBWorkout;
  initialExercises: DBExercise[];
  initialSets: DBSet[];
};

export default function WorkoutTracker({
  initialWorkout,
  initialExercises,
  initialSets,
}: WorkoutTrackerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const workoutId = initialWorkout.id;
  const userId = initialWorkout.userId;

  const [exerciseToAdd, setExerciseToAdd] = useState<{
    name: string;
    position: number;
  }>({ name: "", position: 0 });
  const [workoutCompleteOpen, setWorkoutCompleteOpen] = useState(false);
  const [workoutDate, setWorkoutDate] = useState<Date | undefined>(new Date());

  const [localExerciseNotes, setLocalExerciseNotes] = useState<Record<string, string>>({});

  async function fetchExercises() {
    const response = await fetch(`/api/workouts/${workoutId}/exercises`);
    if (!response.ok) {
      throw new Error("Failed to fetch exercises");
    }
    return (await response.json()) as DBExercise[];
  }

  async function fetchSets() {
    const response = await fetch(`/api/workouts/${workoutId}/sets`);
    if (!response.ok) {
      throw new Error("Failed to fetch sets");
    }
    return (await response.json()) as DBSet[];
  }

  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises", workoutId],
    queryFn: fetchExercises,
    initialData: initialExercises,
    staleTime: Infinity,
  });

  const { data: sets = [] } = useQuery({
    queryKey: ["sets", workoutId],
    queryFn: fetchSets,
    initialData: initialSets,
    staleTime: Infinity,
  });

  function getSetsForExercise(exerciseId: string): DBSet[] {
    return sets.filter(set => set.exerciseId === exerciseId).sort((a, b) => a.order - b.order);
  }

  const addExerciseMutation = useMutation({
    mutationFn: async (params: { name: string; order: number }) => {
      return await createExercise(userId, params.name, params.order, workoutId);
    },
    onMutate: async ({ name, order }) => {
      await queryClient.cancelQueries({ queryKey: ["exercises", workoutId] });
      const previousExercises = queryClient.getQueryData<DBExercise[]>(["exercises", workoutId]);
      
      // optimistically update cache
      queryClient.setQueryData<DBExercise[]>(["exercises", workoutId], (old = []) => {
        const newExercise: DBExercise = {
          id: `temp-${Date.now()}`,
          name,
          order,
          workoutId,
          note: null,
          repLowerBound: null,
          repUpperBound: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const updated = [...old];
        updated.splice(order, 0, newExercise);
        return updated.map((ex, idx) => ({ ...ex, order: idx }));
      });
      
      return { previousExercises };
    },
    onError: (err, _, context) => {
      if (context?.previousExercises) {
        queryClient.setQueryData(["exercises", workoutId], context.previousExercises);
      }
      toast.error(`Failed to add exercise: ${err.message}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["exercises", workoutId] });
    },
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      return await deleteExerciseAction(userId, exerciseId);
    },
    onMutate: async (exerciseId) => {
      await queryClient.cancelQueries({ queryKey: ["exercises", workoutId] });
      const previousExercises = queryClient.getQueryData<DBExercise[]>(["exercises", workoutId]);
      
      queryClient.setQueryData<DBExercise[]>(["exercises", workoutId], (old = []) => {
        return old.filter(ex => ex.id !== exerciseId).map((ex, idx) => ({ ...ex, order: idx }));
      });
      
      return { previousExercises };
    },
    onError: (err, _, context) => {
      if (context?.previousExercises) {
        queryClient.setQueryData(["exercises", workoutId], context.previousExercises);
      }
      toast.error(`Failed to delete exercise: ${err.message}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["exercises", workoutId] });
      await queryClient.invalidateQueries({ queryKey: ["sets", workoutId] });
    },
  });

  const updateExerciseNoteMutation = useMutation({
    mutationFn: async (params: { exerciseId: string; note: string | null }) => {
      return await updateExerciseNoteAction(userId, params.exerciseId, params.note);
    },
    onMutate: async ({ exerciseId, note }) => {
      await queryClient.cancelQueries({ queryKey: ["exercises", workoutId] });
      const previousExercises = queryClient.getQueryData<DBExercise[]>(["exercises", workoutId]);
      
      queryClient.setQueryData<DBExercise[]>(["exercises", workoutId], (old = []) => {
        return old.map(ex => ex.id === exerciseId ? { ...ex, note } : ex);
      });
      
      return { previousExercises };
    },
    onError: (err, _, context) => {
      if (context?.previousExercises) {
        queryClient.setQueryData(["exercises", workoutId], context.previousExercises);
      }
      toast.error(`Failed to save note: ${err.message}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["exercises", workoutId] });
    },
  });

  const addSetMutation = useMutation({
    mutationFn: async (params: { exerciseId: string; order: number }) => {
      const exercise = exercises.find(ex => ex.id === params.exerciseId);
      if (!exercise) throw new Error("Exercise not found");
      return await createSet(userId, exercise, params.order);
    },
    onMutate: async ({ exerciseId, order }) => {
      await queryClient.cancelQueries({ queryKey: ["sets", workoutId] });
      const previousSets = queryClient.getQueryData<DBSet[]>(["sets", workoutId]);
      
      queryClient.setQueryData<DBSet[]>(["sets", workoutId], (old = []) => {
        const newSet: DBSet = {
          id: `temp-${Date.now()}`,
          exerciseId,
          order,
          reps: null,
          weight: null,
          targetReps: null,
          targetWeight: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return [...old, newSet];
      });
      
      return { previousSets };
    },
    onError: (err, _, context) => {
      if (context?.previousSets) {
        queryClient.setQueryData(["sets", workoutId], context.previousSets);
      }
      toast.error(`Failed to add set: ${err.message}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sets", workoutId] });
    },
  });

  const deleteSetMutation = useMutation({
    mutationFn: async (setId: string) => {
      return await deleteSetAction(userId, setId);
    },
    onMutate: async (setId) => {
      await queryClient.cancelQueries({ queryKey: ["sets", workoutId] });
      const previousSets = queryClient.getQueryData<DBSet[]>(["sets", workoutId]);
      
      queryClient.setQueryData<DBSet[]>(["sets", workoutId], (old = []) => {
        const setToDelete = old.find(s => s.id === setId);
        if (!setToDelete) return old;
        
        return old
          .filter(s => s.id !== setId)
          .map(s => s.exerciseId === setToDelete.exerciseId && s.order > setToDelete.order
            ? { ...s, order: s.order - 1 }
            : s
          );
      });
      
      return { previousSets };
    },
    onError: (err, vars, context) => {
      if (context?.previousSets) {
        queryClient.setQueryData(["sets", workoutId], context.previousSets);
      }
      toast.error(`Failed to delete set: ${err.message}`);
    },
    onSuccess: async (deletedSet) => {
      const remainingSets = sets.filter(s => 
        s.exerciseId === deletedSet?.exerciseId && s.id !== deletedSet?.id
      );
      
      for (const [index, set] of remainingSets.entries()) {
        if (set.order !== index) {
          await updateSetOrderAction(userId, set.id, index);
        }
      }
      
      await queryClient.invalidateQueries({ queryKey: ["sets", workoutId] });
    },
  });

  const updateSetMutation = useMutation({
    mutationFn: async (set: DBSet) => {
      return await updateSetAction(userId, set);
    },
    onMutate: async (updatedSet) => {
      await queryClient.cancelQueries({ queryKey: ["sets", workoutId] });
      const previousSets = queryClient.getQueryData<DBSet[]>(["sets", workoutId]);
      
      queryClient.setQueryData<DBSet[]>(["sets", workoutId], (old = []) => {
        return old.map(s => s.id === updatedSet.id ? updatedSet : s);
      });
      
      return { previousSets };
    },
    onError: (err, vars, context) => {
      if (context?.previousSets) {
        queryClient.setQueryData(["sets", workoutId], context.previousSets);
      }
      toast.error(`Failed to update set: ${err.message}`);
    },
  });

  const completeWorkoutMutation = useMutation({
    mutationFn: async (date: Date) => {
      return await completeWorkoutAction(userId, exercises, workoutId, date);
    },
    onSuccess: () => {
      router.push(`/workout/completed/${workoutId}`);
    },
    onError: (err) => {
      toast.error(`Failed to complete workout: ${err.message}`);
    },
  });

  function handleAddExercise() {
    if (exerciseToAdd.name.length === 0) {
      toast.error("You must enter an exercise name");
      return;
    }

    addExerciseMutation.mutate(
      { name: exerciseToAdd.name, order: exerciseToAdd.position },
      {
        onSuccess: () => {
          setExerciseToAdd({ name: "", position: 0 });
        },
      }
    );
  }

  function handleDeleteExercise(exerciseId: string) {
    deleteExerciseMutation.mutate(exerciseId);
  }

  function handleAddSet(exerciseId: string) {
    const exerciseSets = getSetsForExercise(exerciseId);
    addSetMutation.mutate({ exerciseId, order: exerciseSets.length });
  }

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

  function handleUpdateExerciseNote(exerciseId: string, value: string) {
    setLocalExerciseNotes(prev => ({ ...prev, [exerciseId]: value }));
  }

  function handleSaveExerciseNote(exerciseId: string) {
    const note = localExerciseNotes[exerciseId];
    updateExerciseNoteMutation.mutate(
      { exerciseId, note: note ?? null },
      {
        onSuccess: () => {
          setLocalExerciseNotes(prev => {
            const updated = { ...prev };
            delete updated[exerciseId];
            return updated;
          });
        },
      }
    );
  }

  function handleCompleteWorkout() {
    completeWorkoutMutation.mutate(workoutDate ?? new Date());
  }

  const isCompletingWorkout = completeWorkoutMutation.isPending;
  const isAddingExercise = addExerciseMutation.isPending;

  return (
    <main className="mt-8 flex flex-col items-center space-y-6">
      <h1 className="text-2xl">{initialWorkout.title}</h1>
      <p className="text-muted-foreground leading-relaxed">
        {initialWorkout.description}
      </p>

      <section className="flex w-full flex-col space-y-12">
        {exercises.map((exercise) => {
          const exerciseSets = getSetsForExercise(exercise.id);
          const exerciseNote = localExerciseNotes[exercise.id] ?? exercise.note ?? "";
          const isDeleting = deleteExerciseMutation.isPending && 
                            deleteExerciseMutation.variables === exercise.id;
          const isSavingNote = updateExerciseNoteMutation.isPending &&
                              updateExerciseNoteMutation.variables?.exerciseId === exercise.id;

          return (
            <div 
              key={exercise.id} 
              className={`space-y-4 transition-opacity ${isDeleting ? "opacity-50" : ""}`}
            >
              <div className="flex flex-row justify-between text-xl">
                <div className="flex flex-row items-center gap-2">
                  <h2>{exercise.name}</h2>
                  <Button
                    variant={"ghost"}
                    onClick={() => handleDeleteExercise(exercise.id)}
                    disabled={initialWorkout.completed || isDeleting}
                  >
                    <Trash size={18} />
                  </Button>
                </div>
                <h2>result</h2>
              </div>
              {exerciseSets.map((set, sIdx) => {
                const isUpdating = updateSetMutation.isPending && 
                                  updateSetMutation.variables?.id === set.id;
                const isRemoving = deleteSetMutation.isPending &&
                                  deleteSetMutation.variables === set.id;

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
                        disabled={initialWorkout.completed}
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
                        disabled={initialWorkout.completed}
                      />
                      <Button
                        variant={"ghost"}
                        onClick={() => handleRemoveSet(set.id)}
                        disabled={initialWorkout.completed || isRemoving}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </div>
                );
              })}
              <div className="mt-8 flex items-center justify-center">
                <Button
                  variant={"outline"}
                  className="w-1/4 rounded-none rounded-l-lg"
                  onClick={() => handleAddSet(exercise.id)}
                  disabled={initialWorkout.completed}
                >
                  new set
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-1/4 rounded-none rounded-r-lg"
                      disabled={initialWorkout.completed}
                    >
                      add note
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        how did you feel during this exercise?
                      </DialogTitle>
                      <DialogDescription>
                        in the future, this will be taken into account when
                        pregenerating your next workouts.
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      id="notes"
                      value={exerciseNote}
                      onChange={(e) =>
                        handleUpdateExerciseNote(exercise.id, e.target.value)
                      }
                      placeholder={`felt great today, hit a PR on my top set...`}
                      disabled={initialWorkout.completed}
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <div className="space-x-2">
                          <Button type="button" variant="secondary">
                            close
                          </Button>
                          <Button
                            type="submit"
                            onClick={() => handleSaveExerciseNote(exercise.id)}
                            disabled={initialWorkout.completed || isSavingNote}
                          >
                            {isSavingNote ? "saving..." : "save note"}
                          </Button>
                        </div>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          );
        })}
        <div className="flex flex-col items-center space-y-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-1/4" disabled={initialWorkout.completed}>
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
                    disabled={initialWorkout.completed || isAddingExercise}
                  />
                </div>
              </div>
              {exercises.map((exercise, i) => (
                <div key={exercise.id} className="flex items-center justify-between">
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
                      disabled={initialWorkout.completed || isAddingExercise}
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
                      disabled={initialWorkout.completed || isAddingExercise}
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
                  disabled={initialWorkout.completed || isAddingExercise}
                >
                  {isAddingExercise ? "adding..." : "add exercise"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-1/4" disabled={initialWorkout.completed || isCompletingWorkout}>
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
                      disabled={initialWorkout.completed || isCompletingWorkout}
                    >
                      {isCompletingWorkout ? "completing..." : "complete workout"}
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
