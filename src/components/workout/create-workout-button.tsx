"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";

type CreateWorkoutButtonProps = {
  className?: string;
}
export default function CreateWorkoutButton({className = ""}: CreateWorkoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <Button size="default" className={`w-full ${className}`} disabled={isLoading} onClick={() => {
      setIsLoading(true);
      router.push("/workout/create")
    }}>
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Start new workout`}
    </Button>
  )
}