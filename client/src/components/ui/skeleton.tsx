import * as React from "react"

import { cn } from "@/lib/utils"

const DEFAULT_TEXT_WIDTHS = ["100%", "90%", "80%", "60%"] as const

type SkeletonTextProps = React.HTMLAttributes<HTMLDivElement> & {
  lines?: number
  size?: "sm" | "md" | "lg"
  widths?: string[]
  lineClassName?: string
}

type SkeletonCardProps = React.HTMLAttributes<HTMLDivElement> & {
  textLines?: number
  showThumbnail?: boolean
  showButton?: boolean
  thumbnailClassName?: string
  contentClassName?: string
  buttonClassName?: string
  titleWidth?: string
}

type SkeletonTableProps = React.HTMLAttributes<HTMLDivElement> & {
  columns?: number
  rows?: number
  columnTemplate?: string
  showHeader?: boolean
}

type SkeletonFormProps = React.HTMLAttributes<HTMLDivElement> & {
  fields?: number
  showButton?: boolean
  buttonWidth?: string
}

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("skeleton", className)} {...props} />
}

function SkeletonText({
  lines = 3,
  size = "md",
  widths,
  className,
  lineClassName,
  ...props
}: SkeletonTextProps) {
  const sizeClassName = {
    sm: "skeleton-text-sm",
    md: "skeleton-text-md",
    lg: "skeleton-text-lg",
  }[size]

  const widthOptions = widths?.length ? widths : DEFAULT_TEXT_WIDTHS
  const widthSignature = widthOptions.join("|")
  const resolvedWidths = React.useMemo(
    () =>
      Array.from({ length: lines }, (_, index) => {
        if (index === 0) return "100%"
        return widthOptions[Math.floor(Math.random() * widthOptions.length)] ?? "100%"
      }),
    [lines, widthSignature]
  )

  return (
    <div className={cn("skeleton-stack-sm", className)} {...props}>
      {resolvedWidths.map((width, index) => (
        <Skeleton
          key={`${width}-${index}`}
          className={cn(sizeClassName, lineClassName)}
          style={{ width }}
        />
      ))}
    </div>
  )
}

function SkeletonCard({
  textLines = 3,
  showThumbnail = true,
  showButton = false,
  className,
  thumbnailClassName,
  contentClassName,
  buttonClassName,
  titleWidth = "40%",
  ...props
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/80 shadow-sm sm:rounded-[2rem]",
        className
      )}
      {...props}
    >
      {showThumbnail ? (
        <Skeleton className={cn("h-40 rounded-none sm:h-44", thumbnailClassName)} />
      ) : null}
      <div className={cn("skeleton-stack p-5 sm:p-6", contentClassName)}>
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="skeleton-title" style={{ width: titleWidth }} />
        <SkeletonText lines={textLines} size="md" />
        {showButton ? <Skeleton className={cn("h-10 w-32 rounded-xl", buttonClassName)} /> : null}
      </div>
    </div>
  )
}

function SkeletonTable({
  columns = 4,
  rows = 6,
  columnTemplate,
  showHeader = true,
  className,
  ...props
}: SkeletonTableProps) {
  const gridTemplateColumns = columnTemplate ?? `repeat(${columns}, minmax(0, 1fr))`

  return (
    <div
      className={cn("overflow-hidden rounded-2xl border border-border/70 bg-card/90", className)}
      {...props}
    >
      {showHeader ? (
        <div className="border-b border-border/60 px-4 py-3 lg:px-6">
          <div className="grid gap-3" style={{ gridTemplateColumns }}>
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton
                key={`header-${index}`}
                className="skeleton-text-sm"
                style={{ width: index === 0 ? "70%" : "55%" }}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="border-b border-border/50 px-4 py-4 last:border-b-0 lg:px-6"
          >
            <div className="grid items-center gap-3" style={{ gridTemplateColumns }}>
              {Array.from({ length: columns }).map((__, colIndex) => (
                <Skeleton
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="h-9 rounded-xl"
                  style={{ width: colIndex === 0 ? "78%" : colIndex === columns - 1 ? "52%" : "64%" }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SkeletonForm({
  fields = 4,
  showButton = true,
  buttonWidth = "9rem",
  className,
  ...props
}: SkeletonFormProps) {
  return (
    <div className={cn("skeleton-stack-lg", className)} {...props}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={`field-${index}`} className="skeleton-stack-sm">
          <Skeleton className="skeleton-text-sm w-24" />
          <Skeleton className="h-11 w-full" />
        </div>
      ))}
      {showButton ? <Skeleton className="h-11 rounded-xl" style={{ width: buttonWidth }} /> : null}
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonForm, SkeletonTable, SkeletonText }
