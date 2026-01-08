import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

type MuscleGroupCardProps = {
  title: string;
  data: { muscleGroup: string; value: number }[];
  valueLabel: string;
};

export default function MuscleGroupCard({
  title,
  data,
  valueLabel,
}: MuscleGroupCardProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const displayTotal = Number.isInteger(total) ? total : Math.round(total * 10) / 10;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">No data yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Complete a workout to see your stats</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...data].sort((a, b) => b.value - a.value).map((item) => {
              const maxValue = data[0] ? Math.max(...data.map((d) => d.value)) : 0;
              const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
              return (
                <div key={item.muscleGroup} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="capitalize text-foreground">
                      {item.muscleGroup.replace(/_/g, " ")}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {item.value} {valueLabel}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="flex justify-between items-center text-sm pt-3 border-t border-border">
              <span className="font-medium text-foreground">Total</span>
              <span className="font-medium text-foreground tabular-nums">
                {displayTotal} {valueLabel}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

