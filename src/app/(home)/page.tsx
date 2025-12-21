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
    <div className="flex-1 flex flex-col items-center justify-center px-4 animate-[fade-in-up_0.4s_ease-out_forwards]
         [@keyframes_fade-in-up:{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}]">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          Better workout tracking <span className="text-primary">for lifters</span>
        </h1>
        <p className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
          Lifters deserve better than bloated, expensive fitness apps. That&apos;s why I built
          something simpler. I track only the stats that matter for progress.
        </p>
        <div className="flex flex-row gap-4 items-center justify-center pt-4">
          <Button
            className="text-lg px-8 py-6 font-semibold w-44"
            onClick={() => handleNavigate('/workout', 'start')}
            disabled={loadingButton !== null}
          >
            {loadingButton === 'start' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Get Started'
            )}
          </Button>
          <Button
            variant="ghost"
            className="text-lg px-6 py-6 font-medium gap-2 w-44"
            onClick={() => handleNavigate('/about', 'learn')}
            disabled={loadingButton !== null}
          >
            {loadingButton === 'learn' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Learn More
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
