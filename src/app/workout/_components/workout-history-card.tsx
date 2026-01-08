"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2, Trash, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import Link from "next/link";
import type { DBWorkout } from "~/server/db/schema";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
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
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Workout History
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {workouts.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Your workout history will appear here.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Start a workout to begin tracking.</p>
          </div>
        ) : (
          <ScrollArea className="h-[320px]">
            <div className="space-y-1 pr-4">
              {workouts
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((workout) => (
                  <div 
                    key={workout.id} 
                    className="flex items-center gap-2 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                  >
                    <Button
                      variant="ghost"
                      className="flex items-center gap-3 flex-1 h-auto justify-start text-left group px-3 py-3 min-w-0 hover:bg-transparent"
                      asChild
                    >
                      <Link href={`/workout/${workout.id}`}>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate group-hover:text-primary transition-colors duration-200">
                            {workout.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {workout.completed ? (
                              <CheckCircle2 className="h-3 w-3 text-primary" />
                            ) : (
                              <Clock className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {workout.completed ? "Completed" : "In progress"}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground/60 shrink-0 font-normal tabular-nums">
                          {(workout.completedAt ?? workout.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                      </Link>
                    </Button>
                    <Dialog open={openDialogId === workout.id} onOpenChange={(open) => setOpenDialogId(open ? workout.id : null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 shrink-0 mr-2 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete workout?</DialogTitle>
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

