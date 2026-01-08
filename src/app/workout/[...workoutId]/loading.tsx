import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="py-8 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      <div className="w-full space-y-8">
        {Array.from({ length: 2 }).map((_, exerciseIdx) => (
          <div key={exerciseIdx} className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-6 w-40" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, setIdx) => (
                <div 
                  key={setIdx} 
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
                >
                  <Skeleton className="h-4 w-12" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-4 w-3" />
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}

        <div className="flex flex-col items-center gap-3 pt-8">
          <Skeleton className="h-12 w-full max-w-md" />
          <Skeleton className="h-12 w-full max-w-md" />
        </div>
      </div>
    </main>
  );
}
