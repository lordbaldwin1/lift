"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2, Trash } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import type { DBWorkout } from "~/server/db/schema";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { deleteWorkoutAction } from "~/server/actions/workout-actions";

type WorkoutHistoryCardProps = {
  workouts: DBWorkout[];
  userId: string;
}

export default function WorkoutHistoryCard({
  workouts,
  userId,
}: WorkoutHistoryCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  const handleDelete = (workoutId: string) => {
    setDeletingId(workoutId);
    startTransition(async () => {
      try {
        await deleteWorkoutAction(userId, workoutId);
        toast.success("Workout deleted successfully");
        setOpenDialogId(null);
        router.refresh();
      } catch {
        toast.error("Failed to delete workout");
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Workout history
        </CardTitle>
      </CardHeader>
      <CardContent>
        {workouts.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Your workout history will appear here.
          </p>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="divide-y divide-border/50 py-2 pr-4">
              {workouts
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((workout) => (
                  <div key={workout.id} className="flex items-center gap-2 py-2">
                    <Button
                      variant="ghost"
                      className="flex items-center gap-3 flex-1 h-auto justify-start text-left group px-3 py-2 min-w-0"
                      asChild
                    >
                      <Link href={`/workout/${workout.id}`}>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate group-hover:text-primary transition-colors">
                            {workout.title}
                          </p>
                          <p className="text-sm text-muted-foreground truncate font-normal">
                            {workout.completed ? "Completed" : "In progress"}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground/60 shrink-0 font-normal">
                          {(workout.completedAt ?? workout.createdAt).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                      </Link>
                    </Button>
                    <Dialog open={openDialogId === workout.id} onOpenChange={(open) => setOpenDialogId(open ? workout.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you sure?</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently delete &quot;{workout.title}&quot; and all associated data.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setOpenDialogId(null)}>
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(workout.id)}
                            disabled={isPending && deletingId === workout.id}
                            className="w-20"
                          >
                            {isPending && deletingId === workout.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Delete"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
