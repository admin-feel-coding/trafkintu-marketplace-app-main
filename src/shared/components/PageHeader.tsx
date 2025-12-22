import type React from "react"
interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 md:mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 md:mb-2">{title}</h1>
        {description && <p className="text-sm md:text-base text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0 w-full sm:w-auto">{action}</div>}
    </div>
  )
}
