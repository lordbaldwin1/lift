"use client";

import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

type CreateWorkoutButtonProps = {
  className?: string;
}
export default function CreateWorkoutButton({className = ""}: CreateWorkoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <Button 
      size="lg" 
      className={`w-full py-6 text-base font-semibold group ${className}`} 
      disabled={isLoading} 
      onClick={() => {
        setIsLoading(true);
        router.push("/workout/create")
      }}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          <Plus className="h-5 w-5 mr-2 transition-transform group-hover:rotate-90 duration-200" />
          Start New Workout
        </>
      )}
    </Button>
  )
}

