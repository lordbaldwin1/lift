import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export default function Loading() {
  return (
    <main className="py-8 space-y-8">
      <div>
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-5 w-48 mt-2" />
      </div>

      <Skeleton className="h-14 w-full" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-3 w-20" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-12 w-16 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-3 w-28" />
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-14" />
                  </div>
                  <Skeleton className="h-1.5 w-full" />
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-14" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-3 w-32" />
        </CardHeader>
        <CardContent className="flex justify-center pt-2">
          <Skeleton className="h-48 w-full max-w-md" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-3 w-32" />
        </CardHeader>
        <CardContent className="pt-2 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-9 w-9" />
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}

