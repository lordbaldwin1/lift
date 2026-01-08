export type WorkoutTemplate = {
  title: string;
  description: string;
  exercises: {
    exerciseSelectionName: string;
    sets: number;
  }[];
}

export const precreatedTemplates: WorkoutTemplate[] = [
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

