import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "~/server/auth/auth";
import { deleteUserTrackedExercise } from "~/server/db/queries";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const deletedExercise = await deleteUserTrackedExercise(id);

    if (!deletedExercise) {
      return NextResponse.json(
        { error: "Tracked exercise not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting tracked exercise:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

