import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "~/server/auth/auth";
import { selectSetsByWorkout, selectWorkout } from "~/server/db/queries";


export async function GET(request: Request, { params }: { params: Promise<{ workoutId: string }> }) {
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

        const sets = selectSetsByWorkout(workoutId);

        return NextResponse.json(sets);
    } catch (err) {
        console.error("Error fetching sets", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}