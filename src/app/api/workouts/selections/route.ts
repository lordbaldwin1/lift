import { NextResponse } from "next/server";
import { selectExerciseSelections } from "~/server/db/queries";


export async function GET(_: Request) {
  try {
    const selections = await selectExerciseSelections();

    if (selections.length === 0) {
      return NextResponse.json(
        { error: "No selections found" },
        { status: 404 },
      );
    }
    
    return NextResponse.json(selections);
  } catch (err) {
    console.error("Error fetching exercise selections:", (err as Error).message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}