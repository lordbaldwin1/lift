"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";
import useExerciseSelectionData from "~/components/workout/hooks/use-exercise-selection-data";
import {
  createWorkoutTemplateAction,
  getWorkoutTemplateAction,
  updateWorkoutTemplateAction,
} from "~/server/actions/template-actions";
import type { TemplateExercise } from "~/server/db/schema";

type ExerciseEntry = TemplateExercise & { id: string };

export default function CustomTemplatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editTemplateId = searchParams.get("edit");
  const isEditMode = Boolean(editTemplateId);

  const exerciseSelections = useExerciseSelectionData();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(isEditMode);

  // For the exercise picker popover
  const [popoverOpenIndex, setPopoverOpenIndex] = useState<number | null>(null);

  // Fetch template data when editing
  useEffect(() => {
    if (!editTemplateId) return;

    async function fetchTemplate() {
      try {
        const template = await getWorkoutTemplateAction(editTemplateId!);
        setTitle(template.title);
        setDescription(template.description);
        setExercises(
          template.exercises.map((e) => ({
            ...e,
            id: crypto.randomUUID(),
          }))
        );
      } catch (err) {
        toast.error((err as Error).message);
        router.push("/workout/create");
      } finally {
        setIsLoadingTemplate(false);
      }
    }

    void fetchTemplate();
  }, [editTemplateId, router]);

  function handleAddExercise() {
    setExercises([
      ...exercises,
      {
        id: crypto.randomUUID(),
        exerciseSelectionName: "",
        sets: 3,
      },
    ]);
  }

  function handleRemoveExercise(id: string) {
    setExercises(exercises.filter((e) => e.id !== id));
  }

  function handleExerciseChange(
    id: string,
    field: keyof TemplateExercise,
    value: string | number
  ) {
    setExercises(
      exercises.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  }

  function handleMoveExercise(index: number, direction: "up" | "down") {
    const newExercises = [...exercises];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newExercises.length) return;
    
    const temp = newExercises[index];
    newExercises[index] = newExercises[targetIndex]!;
    newExercises[targetIndex] = temp!;
    
    setExercises(newExercises);
  }

  async function handleSaveTemplate() {
    if (!title.trim()) {
      toast.error("Please enter a template title.");
      return;
    }

    if (exercises.length === 0) {
      toast.error("Please add at least one exercise.");
      return;
    }

    const emptyExercise = exercises.find((e) => !e.exerciseSelectionName);
    if (emptyExercise) {
      toast.error("Please select an exercise for all entries.");
      return;
    }

    setIsSaving(true);
    try {
      const exerciseData = exercises.map(({ exerciseSelectionName, sets }) => ({
        exerciseSelectionName,
        sets,
      }));

      if (isEditMode && editTemplateId) {
        await updateWorkoutTemplateAction({
          templateId: editTemplateId,
          title: title.trim(),
          description: description.trim(),
          exercises: exerciseData,
        });
        toast.success("Template updated successfully!");
      } else {
        await createWorkoutTemplateAction({
          title: title.trim(),
          description: description.trim(),
          exercises: exerciseData,
        });
        toast.success("Template created successfully!");
      }
      router.push("/workout/create");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoadingTemplate) {
    return (
      <main className="mt-8 flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <main
      className="mt-8 flex flex-col items-center space-y-8 animate-[fade-in-up_0.3s_ease-out_forwards]
         [@keyframes_fade-in-up:{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}]"
    >
      <div className="text-center space-y-2">
        <h1 className="text-2xl">
          {isEditMode ? "Edit Template" : "Create Custom Template"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isEditMode ? "Update your workout template" : "Build your own workout template"}
        </p>
      </div>

      <div className="flex w-full flex-col gap-8">
        {/* Template Details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">Title</Label>
              <span className="text-xs text-muted-foreground">{title.length}/50</span>
            </div>
            <Input
              id="title"
              placeholder="e.g., Upper Body Day"
              value={title}
              maxLength={50}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description (optional)</Label>
              <span className="text-xs text-muted-foreground">{description.length}/100</span>
            </div>
            <Input
              id="description"
              placeholder="e.g., Focus on chest and shoulders"
              value={description}
              maxLength={100}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Exercises</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddExercise}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>

          {exercises.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6 border border-dashed rounded-lg">
              No exercises added yet
            </p>
          ) : (
            <div className="divide-y divide-border/50">
              {exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="text-muted-foreground/60 text-xs font-mono w-5 text-right">
                    {index + 1}
                  </span>

                  {/* Exercise Picker */}
                  <Popover
                    open={popoverOpenIndex === index}
                    onOpenChange={(open) =>
                      setPopoverOpenIndex(open ? index : null)
                    }
                    modal={true}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex-1 justify-start font-normal h-9 px-2"
                      >
                        {exercise.exerciseSelectionName || (
                          <span className="text-muted-foreground italic">
                            Select exercise...
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[300px]">
                      <Command className="max-h-[300px]">
                        <CommandInput placeholder="Search exercises..." />
                        <CommandList className="max-h-[250px] overflow-y-auto">
                          <CommandEmpty>No exercise found.</CommandEmpty>
                          <CommandGroup>
                            {exerciseSelections.map((selection) => (
                              <CommandItem
                                key={selection.id}
                                value={selection.name}
                                onSelect={() => {
                                  handleExerciseChange(
                                    exercise.id,
                                    "exerciseSelectionName",
                                    selection.name
                                  );
                                  setPopoverOpenIndex(null);
                                }}
                              >
                                {selection.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Sets */}
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-lg"
                      onClick={() =>
                        handleExerciseChange(
                          exercise.id,
                          "sets",
                          Math.max(1, exercise.sets - 1)
                        )
                      }
                    >
                      −
                    </Button>
                    <span className="w-7 text-center font-medium text-foreground text-sm">
                      {exercise.sets}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-lg"
                      onClick={() =>
                        handleExerciseChange(
                          exercise.id,
                          "sets",
                          Math.min(20, exercise.sets + 1)
                        )
                      }
                    >
                      +
                    </Button>
                  </div>

                  {/* Reorder Buttons */}
                  <div className="flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => handleMoveExercise(index, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => handleMoveExercise(index, "down")}
                      disabled={index === exercises.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveExercise(exercise.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/workout/create")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSaveTemplate}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              isEditMode ? "Update Template" : "Save Template"
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}

