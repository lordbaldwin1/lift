"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "~/components/ui/chart";
import type { ProgressionDataPoint, ExerciseProgressionDataPoint } from "~/server/db/queries";

const muscleGroupChartConfig = {
  chest: {
    label: "Chest",
    color: "var(--chart-1)",
  },
  back: {
    label: "Back",
    color: "var(--chart-2)",
  },
  legs: {
    label: "Legs",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const exerciseChartConfig = {
  e1rm: {
    label: "Est. 1RM",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type MuscleGroupChartProps = {
  type: "muscleGroups";
  data: ProgressionDataPoint[];
};

type ExerciseChartProps = {
  type: "exercise";
  data: ExerciseProgressionDataPoint[];
  exerciseName: string;
};

type ProgressionLineChartProps = MuscleGroupChartProps | ExerciseChartProps;

function formatWeekLabel(weekStart: string): string {
  const date = new Date(weekStart);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ProgressionLineChart(props: ProgressionLineChartProps) {
  if (props.type === "muscleGroups") {
    return <MuscleGroupChart data={props.data} />;
  }
  return <ExerciseChart data={props.data} exerciseName={props.exerciseName} />;
}

function MuscleGroupChart({ data }: { data: ProgressionDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        <p>No progression data available for this time range.</p>
      </div>
    );
  }

  const formattedData = data.map((d) => ({
    ...d,
    weekLabel: formatWeekLabel(d.weekStart),
  }));

  return (
    <ChartContainer config={muscleGroupChartConfig} className="h-[300px] w-full">
      <LineChart data={formattedData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="weekLabel"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={11}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          fontSize={11}
          width={40}
          tickFormatter={(value: number) => `${value}`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                if (payload?.[0]?.payload?.weekStart) {
                  const date = new Date(payload[0].payload.weekStart as string);
                  return `Week of ${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
                }
                return "";
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="chest"
          stroke="var(--color-chest)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, fill: "var(--color-chest)" }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="back"
          stroke="var(--color-back)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, fill: "var(--color-back)" }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="legs"
          stroke="var(--color-legs)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, fill: "var(--color-legs)" }}
          connectNulls
        />
      </LineChart>
    </ChartContainer>
  );
}

function ExerciseChart({
  data,
  exerciseName,
}: {
  data: ExerciseProgressionDataPoint[];
  exerciseName: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        <p>No progression data available for {exerciseName}.</p>
      </div>
    );
  }

  const formattedData = data.map((d) => ({
    ...d,
    weekLabel: formatWeekLabel(d.weekStart),
  }));

  const chartConfig = {
    e1rm: {
      label: exerciseName,
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <LineChart data={formattedData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="weekLabel"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={11}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          fontSize={11}
          width={40}
          tickFormatter={(value: number) => `${value}`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                if (payload?.[0]?.payload?.weekStart) {
                  const date = new Date(payload[0].payload.weekStart as string);
                  return `Week of ${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
                }
                return "";
              }}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="e1rm"
          stroke="var(--color-e1rm)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, fill: "var(--color-e1rm)" }}
          connectNulls
        />
      </LineChart>
    </ChartContainer>
  );
}

