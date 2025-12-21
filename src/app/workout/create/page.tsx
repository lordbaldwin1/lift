"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { createWorkout } from "~/server/actions/workout-actions";
import { generateWorkoutTemplateAction, type GenerationQuestions } from "~/server/actions/liftex";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

export default function WorkoutCreatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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

      <GenerateAIWorkoutDialog onSelectTemplate={handleSelectTemplate} />

      <div className="flex w-full flex-col gap-4">
        {templates.map((template) => (
          <Card
            key={template.title}
            className="hover:border-primary cursor-pointer transition-colors"
            onClick={() => handleSelectTemplate(template)}
          >
            <CardHeader>
              <CardTitle>{template.title}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Dialog open={isLoading}>
        <DialogContent showCloseButton={false} className="flex flex-col items-center gap-4 sm:max-w-xs">
          <DialogTitle className="sr-only">Creating Workout</DialogTitle>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium">Creating Workout...</p>
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
    frequency: "twice_a_week"
  });

  const handleSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const isComplete = Object.keys(answers).length === questions.length;

  const handleGenerate = async () => {
    // TODO: Call AI generation logic with answer
    console.log("Generating workout with answers:", answers);
    
    const generatedTemplate = await generateWorkoutTemplateAction(answers);
    await onSelectTemplate(generatedTemplate);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>*New* Generate a workout</Button>
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

const templates: WorkoutTemplate[] = [
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
