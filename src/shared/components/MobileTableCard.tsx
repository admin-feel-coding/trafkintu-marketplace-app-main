import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MobileTableCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function MobileTableCard({ children, className, onClick }: MobileTableCardProps) {
  return (
    <Card
      className={cn(
        "mb-3 touch-active",
        onClick && "cursor-pointer hover:shadow-md transition-shadow",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  )
}

interface CardRowProps {
  label: string
  value: React.ReactNode
  className?: string
}

export function CardRow({ label, value, className }: CardRowProps) {
  return (
    <div className={cn("flex justify-between items-center py-1.5", className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  )
}

interface CardActionsProps {
  children: React.ReactNode
  className?: string
}

export function CardActions({ children, className }: CardActionsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2 mt-3 pt-3 border-t", className)}>
      {children}
    </div>
  )
}
