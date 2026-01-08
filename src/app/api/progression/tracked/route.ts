import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "~/server/auth/auth";
import {
  selectUserTrackedExercises,
  insertUserTrackedExercise,
} from "~/server/db/queries";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trackedExercises = await selectUserTrackedExercises(session.user.id);
    return NextResponse.json(trackedExercises);
  } catch (err) {
    console.error("Error fetching tracked exercises:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as { exerciseSelectionId: string };
    
    if (!body.exerciseSelectionId) {
      return NextResponse.json(
        { error: "exerciseSelectionId is required" },
        { status: 400 }
      );
    }

    const trackedExercise = await insertUserTrackedExercise({
      userId: session.user.id,
      exerciseSelectionId: body.exerciseSelectionId,
    });

    return NextResponse.json(trackedExercise, { status: 201 });
  } catch (err) {
    console.error("Error adding tracked exercise:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

