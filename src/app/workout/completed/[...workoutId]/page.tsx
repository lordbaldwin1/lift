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
        return <div>uh oh</div>
    }
    
    return (
        <main className="flex flex-col items-center justify-center h-[60vw]">
            <RateWorkout workout={workout} />
        </main>
    )
}