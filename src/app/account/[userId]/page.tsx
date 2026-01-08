import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "~/server/auth/auth";
import { Card, CardContent } from "~/components/ui/card";
import { CalendarDays, Mail, UserRound } from "lucide-react";
import SignOutButton from "./_components/sign-out-button";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (userId !== session.user.id) {
    redirect(`/account/${session.user.id}`);
  }

  const joinDate = new Date(session.user.createdAt);
  const formattedJoinDate = joinDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="py-8 space-y-8">
      <div className="opacity-0 animate-fade-in-up">
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight text-foreground">
          YOUR ACCOUNT
        </h1>
        <p className="text-muted-foreground mt-2">
          View your profile.
        </p>
      </div>

      <Card
        className="opacity-0 animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="shrink-0">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt="Profile picture"
                  width={96}
                  height={96}
                  className="rounded-full ring-4 ring-border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center ring-4 ring-border">
                  <UserRound className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">{session.user.name}</h2>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{session.user.email}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
                  <CalendarDays className="w-4 h-4" />
                  <span>Member since {formattedJoinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div
        className="opacity-0 animate-fade-in-up"
        style={{ animationDelay: "200ms" }}
      >
        <SignOutButton />
      </div>
    </main>
  );
}

