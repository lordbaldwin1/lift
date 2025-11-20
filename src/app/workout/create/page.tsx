"use client";

import { Dumbbell } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { createWorkout } from "~/server/actions/workout-actions";
import { toast } from "sonner";

export type WorkoutTemplate = {
  title: string;
  description: string;
}
const templates: WorkoutTemplate[] = [
  {
    title: "push day",
    description: "chest, shoulders, and triceps",
  },
  {
    title: "pull day",
    description: "back and biceps",
  },
  {
    title: "leg day",
    description: "quads, hamstrings, and calves",
  },
];

export default function WorkoutCreatePage() {
  const router = useRouter();

  async function handleSelectTemplate(template: WorkoutTemplate) {
    try {
      const newWorkout = await createWorkout(template);
      router.push(`/workout/${newWorkout.id}`);
    } catch(err) {
      toast.error(`${(err as Error).message}`);
      return;
    }
  }

  return (
    <main className="mt-8 flex flex-col items-center space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl">choose a template</h1>
        <p className="text-muted-foreground text-sm">
          select a workout template to get started
        </p>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card
            key={template.title}
            className="hover:border-primary transition-colors cursor-pointer"
            onClick={() => handleSelectTemplate(template)}
          >
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell size={20} />
                <CardTitle>{template.title}</CardTitle>
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </main>
  );
}
