import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardHeader } from "~/components/ui/card";

export default function Loading() {
  return (
    <main className="py-8 space-y-8">
      <div className="text-center">
        <Skeleton className="h-12 w-72 mx-auto" />
        <Skeleton className="h-5 w-56 mx-auto mt-2" />
      </div>

      <Skeleton className="h-12 w-full rounded-lg" />

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-4">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
        </Card>
        
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 px-3">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-4" />
          </div>
        ))}
      </div>
    </main>
  );
}

