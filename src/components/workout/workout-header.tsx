
type WorkoutHeaderProps = {
    title: string,
    description: string,
}
export default function WorkoutHeader({ title, description }: WorkoutHeaderProps) {
    return (
        <>
            <h1 className="text-2xl">{title}</h1>
            <p className="text-muted-foreground leading-relaxed">
                {description}
            </p>
        </>
    )
}