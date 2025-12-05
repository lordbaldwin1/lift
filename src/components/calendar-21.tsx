"use client"

import * as React from "react"

import { Calendar, CalendarDayButton } from "~/components/ui/calendar"

type DateRange = { from: Date | undefined; to?: Date | undefined }

type DayButtonProps = React.ComponentProps<typeof CalendarDayButton>

export default function Calendar21() {
  return (
    <Calendar
      mode="range"
      numberOfMonths={2}
      showOutsideDays={false}
      className="rounded-lg border shadow-sm [--cell-size:--spacing(11)] md:[--cell-size:--spacing(13)]"
      formatters={{
        formatMonthDropdown: (date: Date) => {
          return date.toLocaleString("default", { month: "long" })
        },
      }}
      components={{
        DayButton: ({ children, modifiers, day, ...props }: DayButtonProps) => {
          const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6

          return (
            <CalendarDayButton day={day} modifiers={modifiers} {...props}>
              {children}
              {!modifiers.outside && <span>{isWeekend ? "$220" : "$100"}</span>}
            </CalendarDayButton>
          )
        },
      }}
    />
  )
}
