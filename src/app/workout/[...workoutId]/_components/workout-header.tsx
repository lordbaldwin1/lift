import { CheckCircle2, Clock } from "lucide-react";

type WorkoutHeaderProps = {
    title: string,
    description: string,
    completed?: boolean,
}
export default function WorkoutHeader({ title, description, completed }: WorkoutHeaderProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                <h1 className="font-display text-4xl sm:text-5xl tracking-tight text-foreground uppercase">
                    {title}
                </h1>
                {completed !== undefined && (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        completed 
                            ? "bg-primary/10 text-primary" 
                            : "bg-muted text-muted-foreground"
                    }`}>
                        {completed ? (
                            <>
                                <CheckCircle2 className="h-3 w-3" />
                                Completed
                            </>
                        ) : (
                            <>
                                <Clock className="h-3 w-3" />
                                In Progress
                            </>
                        )}
                    </span>
                )}
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
                {description}
            </p>
        </div>
    )
}

