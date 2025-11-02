"use client";

import { Trash } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

type Workout = {
    title: string;
    description: string;
}

type Exercise = {
    name: string;
    sets: ExerciseSet[];
}

type ExerciseSet = {
    reps: number | undefined;
    weight: number | undefined;
}


export default function WorkoutPage() {
    const [workout, setWorkout] = useState<Workout>({
        title: "pull day",
        description: "a super duper awesome pull day created by lordbaldwin1, the king of kings in the exercise gym guy world."
    });
    const [exercises, setExercises] = useState<Exercise[]>([
        {
            name: "pull day",
            sets: [{ reps: undefined, weight: undefined },],
        }
    ]);

    function handleAddSet(index: number) {
        const newExercises = [...exercises];
        if (newExercises[index]) {
            newExercises[index].sets.push({
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

    return (
        <main className="flex flex-col items-center mt-8 space-y-6">
            <h1 className="text-2xl">{workout.title}</h1>
            <p className="leading-relaxed text-muted-foreground">{workout.description}</p>

            <section className="flex flex-col w-full space-y-4">
                {exercises.map((exercise, eIdx) => (
                    <div key={eIdx} className="space-y-4">
                        <div className="flex flex-row justify-between text-xl">
                            <h2>{exercise.name}</h2>
                            <h2>result</h2>
                        </div>
                        {exercise.sets.map((set, sIdx) => (
                            <div className="flex flex-row justify-between items-center" key={sIdx}>
                                <h3>set {sIdx + 1}</h3>
                                <div className="flex flex-row items-center space-x-2">
                                    <Input className="w-[75]" placeholder="reps..." value={set.reps ?? ''} type="number" onChange={(e) => handleUpdateSet(eIdx, sIdx, "reps", e.target.value)}></Input>
                                    <Input className="w-[75]" placeholder="lbs..." value={set.weight ?? ''} type="number" onChange={(e) => handleUpdateSet(eIdx, sIdx, "weight", e.target.value)}></Input>
                                    <Button onClick={() => handleRemoveSet(eIdx, sIdx)}>
                                        <Trash />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button className="w-full" onClick={() => handleAddSet(eIdx)}>add set</Button>
                    </div>
                ))}
            </section>
        </main>
    )
}