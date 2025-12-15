"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash } from "lucide-react";
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
    <Card className="py-4">
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
            <div className="space-y-2 pr-4">
              {workouts
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((workout) => (
                  <div key={workout.id} className="flex items-stretch w-full gap-2">
                    <Link
                      href={`/workout/${workout.id}`}
                      className="flex-1 flex justify-between items-center p-3 rounded-lg border transition-colors"
                    >
                      <span className="font-medium">{workout.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {workout.completedAt
                          ? workout.completedAt.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })
                          : workout.createdAt.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                      </span>
                    </Link>
                    <Dialog open={openDialogId === workout.id} onOpenChange={(open) => setOpenDialogId(open ? workout.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="secondary" className="h-auto w-12">
                          <Trash />
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
                              <Loader2 className="animate-spin" />
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
