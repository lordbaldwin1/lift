"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { createWorkout } from "~/server/actions/workout-actions";
import { deleteWorkoutTemplateAction } from "~/server/actions/template-actions";
import { generateWorkoutTemplateAction, type GenerationQuestions } from "~/server/actions/liftex";
import { toast } from "sonner";
import { Loader2, Plus, ChevronRight, Trash, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import type { DBWorkoutTemplate } from "~/server/db/schema";

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
    <main className="mt-8 flex flex-col items-center space-y-6 animate-[fade-in-up_0.3s_ease-out_forwards]
         [@keyframes_fade-in-up:{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}]">
      <div className="text-center space-y-2">
        <h1 className="text-2xl">Choose a template</h1>
        <p className="text-muted-foreground text-sm">
          Select a workout template to get started
        </p>
      </div>

      <div className="flex w-full">
        <Button
          variant={activeTab === "my-templates" ? "default" : "outline"}
          className="flex-1 rounded-none rounded-l-md"
          onClick={() => setActiveTab("my-templates")}
        >
          My Templates
        </Button>
        <Button
          variant={activeTab === "precreated" ? "default" : "outline"}
          className="flex-1 rounded-none rounded-r-md"
          onClick={() => setActiveTab("precreated")}
        >
          Precreated Templates
        </Button>
      </div>

      <div className="flex w-full flex-col gap-4">
        {activeTab === "my-templates" && (
          <>
            {isLoadingTemplates ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : userTemplates.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <p className="text-muted-foreground">
                  You have not created any templates
                </p>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <Button asChild>
                    <Link href="/workout/create/custom">
                      Create Custom Template
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
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
                <div className="divide-y divide-border/50 py-2">
                  {userTemplates.map((template) => (
                    <div key={template.id} className="flex items-center gap-2 py-2">
                      <Button
                        variant="ghost"
                        className="flex items-center gap-3 flex-1 h-auto justify-start text-left group px-3 py-2 min-w-0"
                        onClick={() =>
                          handleSelectTemplate({
                            title: template.title,
                            description: template.description,
                            exercises: template.exercises,
                          })
                        }
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate group-hover:text-primary transition-colors">
                            {template.title}
                          </p>
                          <p className="text-sm text-muted-foreground truncate font-normal">
                            {template.description || `${template.exercises.length} exercises`}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground/60 shrink-0 font-normal">
                          {new Date(template.createdAt).toLocaleDateString()}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
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
                          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Are you sure?</DialogTitle>
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
                              className="w-full sm:w-auto"
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

            <div className="divide-y divide-border/50">
              {precreatedTemplates.map((template) => (
                <div className="py-2" key={template.title}>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 py-2 w-full h-auto justify-start text-left group px-3"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate group-hover:text-primary transition-colors">
                        {template.title}
                      </p>
                      <p className="text-sm text-muted-foreground truncate font-normal">
                        {template.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
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
            your workout will be ready soon.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </main>
  );
}

type QuestionConfig = {
  id: keyof GenerationQuestions;
  question: string;
  options: { value: string; label: string }[];
};

const questions: QuestionConfig[] = [
  {
    id: "experience",
    question: "Are you a beginner?",
    options: [
      { value: "beginner", label: "Yes" },
      { value: "experienced", label: "No" },
    ],
  },
  {
    id: "split",
    question: "What type of split do you prefer?",
    options: [
      { value: "ppl", label: "Push Pull Legs" },
      { value: "upper_lower", label: "Upper/Lower" },
      { value: "full_body", label: "Full Body" },
    ],
  },
  {
    id: "volume",
    question: "Do you like low or high volume?",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
  },
  {
    id: "frequency",
    question: "How often do you hit each muscle group each week?",
    options: [
      { value: "once_a_week", label: "1x Weekly" },
      { value: "twice_a_week", label: "2x Weekly" },
    ],
  },
  {
    id: "weightDirection",
    question: "Are you cutting, maintaining, or bulking?",
    options: [
      { value: "cutting", label: "Cutting" },
      { value: "maintaining", label: "Maintaining" },
      { value: "bulking", label: "Bulking" },
    ],
  },
];

type QuizAnswers = GenerationQuestions;

type SegmentedButtonGroupProps = {
  options: { value: string; label: string }[];
  selectedValue: string | undefined;
  onSelectedValueChange: (value: string) => void;
};

function SegmentedButtonGroup({ options, selectedValue, onSelectedValueChange }: SegmentedButtonGroupProps) {
  return (
    <div className="flex flex-row">
      {options.map((option, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === options.length - 1;
        const isSelected = selectedValue === option.value;

        return (
          <Button
            key={option.value}
            type="button"
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "flex-1 rounded-none",
              isFirst && "rounded-l-md",
              isLast && "rounded-r-md"
            )}
            onClick={() => onSelectedValueChange(option.value)}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

type GenerateAIWorkoutDialogProps = {
  onSelectTemplate: (template: WorkoutTemplate) => Promise<void>;
};

function GenerateAIWorkoutDialog({ onSelectTemplate }: GenerateAIWorkoutDialogProps) {
  const [answers, setAnswers] = useState<QuizAnswers>({
    experience: "experienced",
    split: "ppl",
    volume: "low",
    frequency: "twice_a_week",
    weightDirection: "cutting",
  });

  const handleSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const isComplete = Object.keys(answers).length === questions.length;

  const handleGenerate = async () => {
    console.log("Generating workout with answers:", answers);

    const generatedTemplate = await generateWorkoutTemplateAction(answers);
    await onSelectTemplate(generatedTemplate);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="hover:border-primary cursor-pointer transition-colors bg-gradient-to-br from-primary/5 via-transparent to-secondary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full shadow-[0_0_8px_2px_oklch(0.5_0.08_42/0.4)]">AI</span>
              Generate a workout
            </CardTitle>
            <CardDescription>
              Create a personalized workout based on your training history and preferences
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate a workout</DialogTitle>
          <DialogDescription>
            Based on your previous exercise volume and performance (if
            applicable), we will generate an optimal workout for you.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col w-full space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="space-y-2">
              <Label>{q.question}</Label>
              <SegmentedButtonGroup
                options={q.options}
                selectedValue={answers[q.id]}
                onSelectedValueChange={(value) => handleSelect(q.id, value)}
              />
            </div>
          ))}
          <Button
            disabled={!isComplete}
            onClick={handleGenerate}
            className="mt-2"
          >
            Generate Workout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type WorkoutTemplate = {
  title: string;
  description: string;
  exercises: {
    exerciseSelectionName: string;
    sets: number;
  }[];
}

const precreatedTemplates: WorkoutTemplate[] = [
  {
    title: "Lordbaldwin1 push day",
    description: "My personal push day for hitting chest, shoulders, and triceps. Includes 6 sets chest, 5 sets shoulders, 3 sets triceps.",
    exercises: [
      { exerciseSelectionName: "Incline Barbell Bench Press", sets: 2 },
      { exerciseSelectionName: "Dumbbell Bench Press", sets: 2 },
      { exerciseSelectionName: "Dumbbell Fly", sets: 2 },
      { exerciseSelectionName: "Lateral Raise", sets: 5 },
      { exerciseSelectionName: "Tricep Pushdown", sets: 3 },
    ],
  },
  {
    title: "Lordbaldwin pull day",
    description: "My personal pull day for hitting back and biceps. Includes 4 sets upper/mid back, 4 sets lats, 2 sets traps, 4 sets biceps.",
    exercises: [
      { exerciseSelectionName: "Lat Pulldown", sets: 2 },
      { exerciseSelectionName: "Seated Cable Row", sets: 2 },
      { exerciseSelectionName: "Machine Row", sets: 2 },
      { exerciseSelectionName: "Dumbbell Shrugs", sets: 2 },
      { exerciseSelectionName: "Lat Prayer", sets: 2 },
      { exerciseSelectionName: "Dumbbell Curl", sets: 4 },
    ],
  },
  {
    title: "Lordbaldwin1 leg day, quad focused",
    description: "My personal leg day for hitting quads, hamstrings, and calves.",
    exercises: [
      { exerciseSelectionName: "Hack Squat", sets: 4 },
      { exerciseSelectionName: "Leg Curl", sets: 4 },
      { exerciseSelectionName: "Leg Extension", sets: 4 },
      { exerciseSelectionName: "Calf Raise", sets: 4 },
    ],
  },
  {
    title: "Lordbaldwin1 leg day, hamstring focused",
    description: "My personal leg day for hitting hamstrings, quads, and calves.",
    exercises: [
      { exerciseSelectionName: "Romanian Deadlift", sets: 4 },
      { exerciseSelectionName: "Leg Extension", sets: 4 },
      { exerciseSelectionName: "Leg Curl", sets: 4 },
      { exerciseSelectionName: "Calf Raise", sets: 4 },
    ],
  },
];
