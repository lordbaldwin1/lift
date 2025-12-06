"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Calendar, CalendarDayButton } from "~/components/ui/calendar"
import type { DBWorkout, Sentiment } from "~/server/db/schema"

type DayButtonProps = React.ComponentProps<typeof CalendarDayButton>

type WorkoutHistoryCalendarProps = {
  workouts: DBWorkout[];
}

const sentimentFaces: Record<Sentiment, string> = {
  good: "(•‿•)",
  medium: "(• _ •)",
  bad: "(• ‸ •)",
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export default function WorkoutHistoryCalendar({ workouts }: WorkoutHistoryCalendarProps) {
  const router = useRouter()

  const getWorkoutForDay = (date: Date): DBWorkout | undefined => {
    return workouts.find(
      (workout) => workout.completedAt && isSameDay(workout.completedAt, date)
    )
  }

  return (
    <Calendar
      mode="single"
      numberOfMonths={1}
      showOutsideDays={false}
      onSelect={() => {}}
      className="rounded-md border shadow-sm [--cell-size:--spacing(11)] md:[--cell-size:--spacing(13)]"
      formatters={{
        formatMonthDropdown: (date: Date) => {
          return date.toLocaleString("default", { month: "long" })
        },
      }}
      components={{
        DayButton: ({ children, modifiers, day, ...props }: DayButtonProps) => {
          const workout = getWorkoutForDay(day.date)
          const sentimentFace = workout ? sentimentFaces[workout.sentiment] : null

          return (
            <CalendarDayButton
              day={day}
              modifiers={modifiers}
              {...props}
              onClick={() => {
                if (workout) {
                  router.push(`/workout/${workout.id}`)
                }
              }}
            >
              {children}
              {!modifiers.outside && (
                <span className={`text-[0.5rem] ${sentimentFace ? "" : "text-accent"}`}>
                  {sentimentFace ?? "n/a"}
                </span>
              )}
            </CalendarDayButton>
          )
        },
      }}
    />
  )
}
