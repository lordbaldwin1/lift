"use client";

import { ArrowDown, ArrowUp, Info, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

type Workout = {
    id: string;
    title: string;
    description: string;
}

type Exercise = {
    id: string;
    name: string;
    order: number;
    sets: ExerciseSet[];
    note: string | undefined;
}

type ExerciseSet = {
    id: string;
    order: number;
    reps: number | undefined;
    weight: number | undefined;
}


export default function WorkoutPage() {
    const [workout, setWorkout] = useState<Workout>({
        id: crypto.randomUUID(),
        title: "pull day",
        description: "a super duper awesome pull day created by lordbaldwin1, the king of kings in the exercise gym guy world."
    });
    const [exercises, setExercises] = useState<Exercise[]>([
        {
            id: crypto.randomUUID(),
            name: "incline bench press",
            order: 0,
            sets: [{ id: crypto.randomUUID(), order: 0, reps: undefined, weight: undefined },],
            note: undefined,
        }
    ]);
    const [exerciseToAdd, setExerciseToAdd] = useState<{ name: string, position: number }>({ name: "", position: -1 });

    function handleAddSet(index: number) {
        const newExercises = [...exercises];
        if (newExercises[index]) {
            newExercises[index].sets.push({
                id: crypto.randomUUID(),
                order: newExercises[index].sets.length,
                reps: undefined,
                weight: undefined,
            });
            setExercises(newExercises);
        }
    }

    function handleRemoveSet(eIdx: number, sIdx: number) {
        const newExercises = [...exercises];
        if (newExercises[eIdx]) {
            newExercises[eIdx] = {
                ...newExercises[eIdx],
                sets: newExercises[eIdx].sets.filter((_, idx) => idx !== sIdx)
            };
            // update set order
            newExercises[eIdx] = {
                ...newExercises[eIdx],
                sets: newExercises[eIdx].sets.map((set, i) => ({
                    ...set,
                    order: i,
                })),
            }
            setExercises(newExercises);
        }
    }

    function handleUpdateSet(eIdx: number, sIdx: number, field: string, value: string) {
        const newExercises = [...exercises];
        if (newExercises[eIdx]?.sets[sIdx]) {
            const numValue = value === '' ? undefined : Number(value);
            newExercises[eIdx] = {
                ...newExercises[eIdx],
                sets: newExercises[eIdx].sets.map((set, idx) =>
                    idx === sIdx ? { ...set, [field]: numValue } : set
                )
            };
            setExercises(newExercises);
        }
    }

    function handleUpdateExerciseNote(eIdx: number, value: string) {
        const newExercises = [...exercises];
        if (newExercises[eIdx]) {
            newExercises[eIdx] = {
                ...newExercises[eIdx],
                note: value
            }
            setExercises(newExercises);
        }
    }

    function handleAddExercise() {
        if (exerciseToAdd.name.length === 0) {
            toast.error("you must enter an exercise name");
            return;
        }
        const newExercises = [...exercises];

        if (exerciseToAdd.position > 0) {
            newExercises.splice(exerciseToAdd.position, 0, {
                id: crypto.randomUUID(),
                name: exerciseToAdd.name,
                order: exerciseToAdd.position > 0 ? exerciseToAdd.position : newExercises.length,
                sets: [],
                note: undefined,
            });
        } else {
            newExercises.push({
                id: crypto.randomUUID(),
                name: exerciseToAdd.name,
                order: newExercises.length,
                sets: [],
                note: undefined,
            });
        }
        setExercises(newExercises);
        setExerciseToAdd({ name: "", position: -1 });
    }

    return (
        <main className="flex flex-col items-center mt-8 space-y-6">
            <h1 className="text-2xl">{workout.title}</h1>
            <p className="leading-relaxed text-muted-foreground">{workout.description}</p>

            <section className="flex flex-col w-full space-y-12">
                {exercises.map((exercise, eIdx) => (
                    <div key={eIdx} className="space-y-4">
                        <div className="flex flex-row justify-between text-xl">
                            <h2>{exercise.name}</h2>
                            <h2>result</h2>
                        </div>
                        {exercise.sets.map((set, sIdx) => (
                            <div className="flex flex-row justify-between items-center" key={sIdx}>
                                <span className="text-muted-foreground">set {sIdx + 1}</span>
                                <div className="flex flex-row items-center space-x-2">
                                    <Input className="w-[75]" placeholder="lbs..." value={set.weight ?? ''} type="number" onChange={(e) => handleUpdateSet(eIdx, sIdx, "weight", e.target.value)} />
                                    <Input className="w-[75]" placeholder="reps..." value={set.reps ?? ''} type="number" onChange={(e) => handleUpdateSet(eIdx, sIdx, "reps", e.target.value)} />
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
                                    <Info size={16} className="hover:text-muted-foreground duration-200" />
                                </TooltipTrigger>
                                <TooltipContent className="w-[128] text-center">
                                    <p>(coming soon!) your notes will be used as data in pregenerating your next workout</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <Textarea id="notes" value={exercise.note} onChange={(e) => handleUpdateExerciseNote(eIdx, e.target.value)} placeholder={`(optional) enter notes about this exercies... (e.g., "felt strong today, hit a PR")`} />
                    </div>
                ))}
                <div className="flex flex-row">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="w-1/2 rounded-none rounded-l-md">add exercise</Button>
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
                                            setExerciseToAdd(prev => ({
                                                ...prev,
                                                name: e.target.value
                                            }))
                                        }
                                        placeholder="incline dumbell press"
                                    />
                                </div>
                            </div>
                            {exercises.map((exercise, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <span>{exercise.name}</span>
                                    <div className="space-x-1">
                                        <Button
                                            variant={"ghost"}
                                            className={i === exerciseToAdd.position ? "bg-accent" : ""}
                                            onClick={() =>
                                                setExerciseToAdd(prev => ({
                                                    ...prev,
                                                    position: i
                                                }))
                                            }
                                        >
                                            <ArrowUp />
                                        </Button>
                                        <Button
                                            variant={"ghost"}
                                            className={i + 1 === exerciseToAdd.position ?
                                                "bg-accent" : ""}
                                            onClick={() => setExerciseToAdd(prev => ({
                                                ...prev,
                                                position: i + 1,
                                            }))}
                                        ><ArrowDown /></Button>
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
                    <Button className="w-1/2 rounded-none rounded-r-md">save changes</Button>
                </div>
            </section>
        </main>
    )
}