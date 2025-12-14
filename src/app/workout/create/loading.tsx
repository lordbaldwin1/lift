import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardHeader } from "~/components/ui/card";

export default function Loading() {
  return (
    <main className="mt-8 flex flex-col items-center space-y-6">
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      <div className="flex w-full flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </main>
  );
}

