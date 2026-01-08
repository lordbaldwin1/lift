import { selectTotalCompletedWorkouts } from "~/server/db/queries";

export default async function AboutPage() {
  const totalWorkouts = await selectTotalCompletedWorkouts();

  return (
    <main className="py-8 space-y-12">
      <div className="text-center opacity-0 animate-fade-in-up">
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight text-foreground">
          ABOUT
        </h1>
      </div>

      <div
        className="text-center py-12 opacity-0 animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
          Workouts completed
        </p>
        <p className="font-display text-7xl sm:text-8xl md:text-9xl text-primary">
          {totalWorkouts.toLocaleString()}
        </p>
      </div>

      <div
        className="max-w-2xl mx-auto text-center space-y-6 opacity-0 animate-fade-in-up"
        style={{ animationDelay: "200ms" }}
      >
        <p className="text-muted-foreground leading-relaxed">
          I didn&apos;t want to pay for a workout app. I&apos;m a programmer, so
          I decided to build one myself with everything tracked that I actually
          care about.
        </p>

        <p className="text-muted-foreground leading-relaxed">
          I&apos;ve been doing hypertrophy training consistently since March
          2022. It was about time I started tracking my workouts properly.
          Keeping a paper journal seemed tedious and wouldn&apos;t give me
          visualized statistics on my growth or volume.
        </p>

        <p className="text-muted-foreground leading-relaxed">
          So I built this. Simple. Free. No bloat.
        </p>
      </div>
    </main>
  );
}

