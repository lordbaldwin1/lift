"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { createWorkout } from "~/server/actions/workout-actions";
import { deleteWorkoutTemplateAction } from "~/server/actions/template-actions";
import { toast } from "sonner";
import { Loader2, Plus, ChevronRight, Trash, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import type { DBWorkoutTemplate } from "~/server/db/schema";
import GenerateAIWorkoutDialog from "./_components/generate-ai-workout-dialog";
import { precreatedTemplates, type WorkoutTemplate } from "./_components/precreated-templates";
import SegmentedButtonGroup from "./_components/segmented-button-group";

type Tab = "my-templates" | "precreated";

export default function WorkoutCreatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("my-templates");
  const [userTemplates, setUserTemplates] = useState<DBWorkoutTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchUserTemplates() {
      try {
        const response = await fetch("/api/templates");
        if (response.ok) {
          const templates = (await response.json()) as DBWorkoutTemplate[];
          setUserTemplates(templates);
        }
      } catch (err) {
        console.error("Failed to fetch user templates:", err);
      } finally {
        setIsLoadingTemplates(false);
      }
    }
    void fetchUserTemplates();
  }, []);

  async function handleDeleteTemplate(templateId: string) {
    setIsDeleting(true);
    try {
      await deleteWorkoutTemplateAction(templateId);
      setUserTemplates((prev) => prev.filter((t) => t.id !== templateId));
      toast.success("Template deleted successfully");
      setDeleteDialogId(null);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSelectTemplate(template: WorkoutTemplate) {
    setIsLoading(true);
    try {
      const newWorkout = await createWorkout(template);
      router.push(`/workout/${newWorkout.id}`);
    } catch (err) {
      toast.error(`${(err as Error).message}`);
      return;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="py-8 space-y-8">
      <div className="text-center opacity-0 animate-fade-in-up">
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight text-foreground">
          CHOOSE A TEMPLATE
        </h1>
        <p className="text-muted-foreground mt-2">
          Select a workout template to get started
        </p>
      </div>

      <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <SegmentedButtonGroup
          options={[
            { value: "my-templates", label: "My Templates" },
            { value: "precreated", label: "Precreated Templates" },
          ]}
          selectedValue={activeTab}
          onSelectedValueChange={(value) => setActiveTab(value as Tab)}
        />
      </div>

      <div 
        className="flex w-full flex-col gap-4 opacity-0 animate-fade-in-up"
        style={{ animationDelay: '100ms' }}
      >
        {activeTab === "my-templates" && (
          <>
            {isLoadingTemplates ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : userTemplates.length === 0 ? (
              <div className="flex flex-col items-center gap-6 py-12 text-center">
                <div>
                  <p className="text-muted-foreground">
                    You haven&apos;t created any templates yet
                  </p>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    Create a custom template or use a precreated one
                  </p>
                </div>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <Button asChild size="lg" className="font-semibold">
                    <Link href="/workout/create/custom">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Custom Template
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setActiveTab("precreated")}
                  >
                    View Precreated Templates
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {userTemplates.length} template{userTemplates.length !== 1 ? "s" : ""}
                  </span>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/workout/create/custom">
                      <Plus className="mr-2 h-4 w-4" />
                      New
                    </Link>
                  </Button>
                </div>
                <div className="space-y-1">
                  {userTemplates.map((template) => (
                    <div 
                      key={template.id} 
                      className="flex items-center gap-2 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                    >
                      <Button
                        variant="ghost"
                        className="flex items-center gap-3 flex-1 h-auto justify-start text-left group px-3 py-3 min-w-0 hover:bg-transparent"
                        onClick={() =>
                          handleSelectTemplate({
                            title: template.title,
                            description: template.description,
                            exercises: template.exercises,
                          })
                        }
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate group-hover:text-primary transition-colors duration-200">
                            {template.title}
                          </p>
                          <p className="text-sm text-muted-foreground truncate font-normal">
                            {template.description || `${template.exercises.length} exercises`}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground/60 shrink-0 font-normal tabular-nums">
                          {new Date(template.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 text-muted-foreground/60 hover:text-foreground transition-colors duration-200"
                        asChild
                      >
                        <Link href={`/workout/create/custom?edit=${template.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Dialog
                        open={deleteDialogId === template.id}
                        onOpenChange={(open) => setDeleteDialogId(open ? template.id : null)}
                      >
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
                            <DialogTitle>Delete template?</DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. This will permanently delete &quot;{template.title}&quot;.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogId(null)}>
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteTemplate(template.id)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
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
              </div>
            )}
          </>
        )}

        {activeTab === "precreated" && (
          <div className="space-y-4">
            <GenerateAIWorkoutDialog onSelectTemplate={handleSelectTemplate} />

            <div className="space-y-1">
              {precreatedTemplates.map((template) => (
                <div 
                  key={template.title}
                  className="rounded-lg hover:bg-muted/50 transition-colors duration-200"
                >
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 py-3 w-full h-auto justify-start text-left group px-3 hover:bg-transparent"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate group-hover:text-primary transition-colors duration-200">
                        {template.title}
                      </p>
                      <p className="text-sm text-muted-foreground truncate font-normal">
                        {template.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isLoading}>
        <DialogContent showCloseButton={false} className="flex flex-col items-center gap-4 sm:max-w-xs" aria-describedby="workout loading">
          <DialogTitle className="sr-only">Creating Workout</DialogTitle>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium">Creating Workout...</p>
          <DialogDescription className="sr-only">
            Your workout will be ready soon.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </main>
  );
}
