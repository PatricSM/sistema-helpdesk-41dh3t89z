import { ReactNode } from 'react'
import { LifeBuoy } from 'lucide-react'

interface PageTitleProps {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  rightSlot?: ReactNode
  leftSlot?: ReactNode
}

export function PageTitle({ title, icon: Icon = LifeBuoy, rightSlot, leftSlot }: PageTitleProps) {
  return (
    <div className="flex items-center justify-between h-14 px-5">
      <div className="flex items-center gap-3 min-w-0">
        {leftSlot}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-100 text-violet-600">
            <Icon className="h-4 w-4" />
          </div>
          <h1 className="text-base font-semibold tracking-tight truncate">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">{rightSlot}</div>
    </div>
  )
}
