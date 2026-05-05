import * as React from "react";

import { cn } from "@/lib/utils";

export function FormGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid grid-cols-1 gap-5 md:grid-cols-2", className)} {...props} />;
}

export function FormSection({
  title,
  description,
  icon,
  className,
  children,
}: React.PropsWithChildren<{
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}>) {
  return (
    <section className={cn("dashboard-section-card rounded-[var(--radius-xl)] border p-6", className)}>
      {(title || description) ? (
        <div className="dashboard-divider mb-6 border-b pb-4">
          <div className="flex items-start gap-3">
            {icon ? (
              <div className="dashboard-icon-info flex h-10 w-10 items-center justify-center rounded-2xl">
                {icon}
              </div>
            ) : null}
            <div className="space-y-1">
              {title ? <h3 className="text-lg font-bold text-[var(--dashboard-text)]">{title}</h3> : null}
              {description ? <p className="text-sm text-[var(--dashboard-text-soft)]">{description}</p> : null}
            </div>
          </div>
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function FormActions({
  className,
  align = "between",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: "between" | "end" }) {
  return (
    <div
      className={cn(
        "dashboard-divider mt-8 flex flex-col-reverse items-stretch gap-3 border-t pt-5 sm:flex-row sm:items-center",
        align === "between" ? "sm:justify-between" : "sm:justify-end",
        className
      )}
      {...props}
    />
  );
}
