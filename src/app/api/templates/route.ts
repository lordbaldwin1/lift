import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "~/server/auth/auth";
import { selectWorkoutTemplatesByUser } from "~/server/db/queries";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await selectWorkoutTemplatesByUser(session.user.id);

    return NextResponse.json(templates);
  } catch (err) {
    console.error("Error fetching templates:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

