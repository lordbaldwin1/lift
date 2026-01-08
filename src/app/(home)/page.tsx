"use client";

import { Button } from '~/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [loadingButton, setLoadingButton] = useState<'start' | 'learn' | null>(null);

  function handleNavigate(path: string, button: 'start' | 'learn') {
    setLoadingButton(button);
    router.push(path);
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-[500px] md:h-[500px] bg-primary/6 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 
          className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.85] tracking-tight text-foreground opacity-0 animate-fade-in-up"
        >
          TRACK YOUR
          <br />
          <span className="text-primary">PROGRESS</span>
        </h1>

        <p 
          className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto leading-relaxed opacity-0 animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          Lifters deserve better than bloated, expensive fitness apps. That&apos;s why I built
          something simpler. I track only the stats that matter for progress.
        </p>

        <div 
          className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '200ms' }}
        >
          <Button
            size="lg"
            className="text-lg px-10 py-7 font-semibold w-full sm:w-auto min-w-[200px] group"
            onClick={() => handleNavigate('/workout', 'start')}
            disabled={loadingButton !== null}
          >
            {loadingButton === 'start' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Start Training
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-lg px-8 py-7 font-medium w-full sm:w-auto min-w-[200px]"
            onClick={() => handleNavigate('/about', 'learn')}
            disabled={loadingButton !== null}
          >
            {loadingButton === 'learn' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Learn More'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
