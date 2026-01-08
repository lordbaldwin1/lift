import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "~/server/auth/auth";
import { selectProgressionData, selectExerciseProgressionData } from "~/server/db/queries";

function getStartDateFromRange(range: string): Date {
  const now = new Date();
  switch (range) {
    case "1m":
      return new Date(now.setMonth(now.getMonth() - 1));
    case "3m":
      return new Date(now.setMonth(now.getMonth() - 3));
    case "6m":
      return new Date(now.setMonth(now.getMonth() - 6));
    case "1y":
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case "all":
      return new Date(0); // Beginning of time
    default:
      return new Date(now.setMonth(now.getMonth() - 3)); // Default to 3 months
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") ?? "3m";
    const exerciseSelectionId = searchParams.get("exerciseId");

    const startDate = getStartDateFromRange(range);

    if (exerciseSelectionId) {
      const data = await selectExerciseProgressionData(
        session.user.id,
        exerciseSelectionId,
        startDate
      );
      return NextResponse.json({ type: "exercise", data });
    } else {
      const data = await selectProgressionData(session.user.id, startDate);
      return NextResponse.json({ type: "muscleGroups", data });
    }
  } catch (err) {
    console.error("Error fetching progression data:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

