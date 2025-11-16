import { notFound } from "next/navigation";
import RateWorkout from "~/components/rate-workout";
import { selectWorkout } from "~/server/db/queries";


export default async function CompletedWorkoutPage({
    params,
}: {
    params: Promise<{ workoutId: string }>;
}) {
    const { workoutId } = await params;

    const workout = await selectWorkout(workoutId);

    if (!workout) {
        notFound();
    }
    
    return (
        <main className="">
            <RateWorkout workout={workout} />
        </main>
    )
}