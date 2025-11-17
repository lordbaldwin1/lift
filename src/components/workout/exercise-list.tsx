import type { DBExercise, DBSet, DBWorkout, ExerciseWithSelection } from "~/server/db/schema";
import ExerciseButtonGroup from "./exercise-button-group";
import { Button } from "../ui/button";
import SetRow from "./set-row";
import useWorkoutData from "./hooks/use-workout-data";
import { Trash } from "lucide-react";
import useWorkoutMutations from "./hooks/use-workout-mutations";

type ExerciseListProps = {
  workout: DBWorkout;
  exercises: ExerciseWithSelection[];
  sets: DBSet[];
}
export default function ExerciseList({
  workout,
  exercises,
  sets,
}: ExerciseListProps) {

  const {
    getSetsForExercise,
  } = useWorkoutData({ workoutId: workout.id, initialExercises: exercises, initialSets: sets });

  const {
    deleteExerciseMutation,
  } = useWorkoutMutations({ userId: workout.userId, workoutId: workout.id, exercises: exercises, sets: sets })

  function handleDeleteExercise(exerciseId: string) {
    deleteExerciseMutation.mutate(exerciseId);
  }
  return (
    <>
      {exercises.map((exercise) => {
        const exerciseSets = getSetsForExercise(exercise.id);
        const isDeleting = deleteExerciseMutation.isPending &&
          deleteExerciseMutation.variables === exercise.id;
        const isPending = exercise.id.startsWith("temp-");

        return (
          <div
            key={exercise.id}
            className={`space-y-4 transition-opacity ${isDeleting ? "opacity-50" : ""}`}
          >
            <div className="flex flex-row justify-between text-xl">
              <div className="flex flex-row items-center gap-2">
              <Button
                  variant={"ghost"}
                  onClick={() => handleDeleteExercise(exercise.id)}
                  disabled={workout.completed || isDeleting || isPending}
                >
                  <Trash size={18} />
                </Button>
                <h2>{exercise.exerciseSelection.name}</h2>
              </div>
            </div>
            {exerciseSets.map((set, sIdx) => {
              return <SetRow key={sIdx} workout={workout} exercises={exercises} sets={sets} set={set} sIdx={sIdx} />
            })}
            <ExerciseButtonGroup workout={workout} exercises={exercises} sets={sets} exercise={exercise} />
          </div>
        );
      })}
    </>
  )
}