import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mt-8 flex flex-col items-center space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-5 w-72" />

      <main className="w-full">
        <section className="flex w-full flex-col space-y-12">
          <div className="space-y-4">
            <div className="flex flex-row items-center gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-12" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-[75px]" />
                <Skeleton className="h-10 w-[75px]" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-12" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-[75px]" />
                <Skeleton className="h-10 w-[75px]" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
            <Skeleton className="h-10 w-24" />
          </div>

          <div className="space-y-4">
            <div className="flex flex-row items-center gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-12" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-[75px]" />
                <Skeleton className="h-10 w-[75px]" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
            <Skeleton className="h-10 w-24" />
          </div>

          <div className="flex flex-col items-center space-y-2">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-10 w-1/2" />
          </div>
        </section>
      </main>
    </main>
  );
}
