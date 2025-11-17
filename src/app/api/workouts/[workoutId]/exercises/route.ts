import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "~/server/auth/auth";
import { selectExercisesWithSelection, selectWorkout } from "~/server/db/queries";


export async function GET(_: Request, { params }: { params: Promise<{ workoutId: string }> }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { workoutId } = await params;

        const workout = await selectWorkout(workoutId);

        if (!workout) {
            return NextResponse.json(
                { error: "Workout not found" },
                { status: 404 },
            );
        }

        if (workout.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 },
            );
        }

        const exercises = await selectExercisesWithSelection(workoutId);

        return NextResponse.json(exercises);
    } catch (err) {
        console.error("Error fetching exercises:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}