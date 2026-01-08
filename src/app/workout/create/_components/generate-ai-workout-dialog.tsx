"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { generateWorkoutTemplateAction, type GenerationQuestions } from "~/server/actions/liftex";
import SegmentedButtonGroup from "./segmented-button-group";
import type { WorkoutTemplate } from "./precreated-templates";
import { Sparkles } from "lucide-react";

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

type GenerateAIWorkoutDialogProps = {
  onSelectTemplate: (template: WorkoutTemplate) => Promise<void>;
};

export default function GenerateAIWorkoutDialog({ onSelectTemplate }: GenerateAIWorkoutDialogProps) {
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
        <Card className="cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-md bg-gradient-to-br from-primary/5 via-transparent to-primary/5 group">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                <Sparkles className="h-3 w-3" />
                AI
              </span>
              <span className="group-hover:text-primary transition-colors duration-200">
                Generate a workout
              </span>
            </CardTitle>
            <CardDescription>
              Create a personalized workout based on your training history and preferences
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight">
            GENERATE WORKOUT
          </DialogTitle>
          <DialogDescription>
            Based on your previous exercise volume and performance, we&apos;ll generate an optimal workout for you.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col w-full space-y-5 pt-2">
          {questions.map((q) => (
            <div key={q.id} className="space-y-2">
              <Label className="text-sm font-medium">{q.question}</Label>
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
            size="lg"
            className="mt-4 font-semibold"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Workout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

