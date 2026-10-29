import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md bg-gradient-to-r from-muted via-slate-200/70 to-muted bg-[length:200%_100%] animate-[shimmer_1.6s_linear_infinite]", className)}
      {...props}
    />
  )
}

export { Skeleton }
