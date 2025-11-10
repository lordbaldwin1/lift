"use client";

import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { useState } from "react";
import type { DBWorkout, Sentiment } from "~/server/db/schema";
import { updateWorkoutSentimentAction } from "~/server/actions/workout-actions";

type RateWorkoutProps = {
    workout: DBWorkout;
}
export default function RateWorkout(props: RateWorkoutProps) {
    const { workout } = props;
    const [loading, setLoading] = useState<boolean>(false);

    async function handleUpdateSentiment(sentiment: Sentiment) {
        setLoading(true);
        try {
            const updatedWorkout = updateWorkoutSentimentAction(workout.userId, workout.id, sentiment);
            if (!updatedWorkout) {
                toast.error("Failed to update sentiment, please try again");
            } else {
                toast.success("Saved workout sentiment");
            }
        } catch (err) {
            toast.error(`Error: ${(err as Error).message}`);
            return;
        } finally {
            setLoading(false);
        }
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl text-center">your workout is complete</CardTitle>
                <CardDescription className="text-lg text-center">how did it go?</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-row gap-6 group">
                    <Button onClick={() => handleUpdateSentiment("good")} variant={"outline"} className="text-8xl size-30 rounded-full">😁</Button>
                    <Button onClick={() => handleUpdateSentiment("medium")} variant={"outline"} className="text-8xl size-30 rounded-full">😐</Button>
                    <Button onClick={() => handleUpdateSentiment("bad")} variant={"outline"} className="text-8xl size-30 rounded-full">😩</Button>
                </div>
            </CardContent>
            <CardFooter className="flex justify-center items-center">
                <Button className="w-1/4">skip</Button>
            </CardFooter>
        </Card>
    )
}