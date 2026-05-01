import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const appButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-focus-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "dashboard-primary-button border-transparent text-[var(--text-primary-action)] hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "dashboard-secondary-button border text-[var(--dashboard-text)] hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "border-[var(--dashboard-border-strong)] bg-transparent text-[var(--dashboard-text)] hover:bg-[var(--dashboard-section-emphasis)] hover:text-[var(--dashboard-text)]",
        ghost:
          "border-transparent bg-transparent text-[var(--dashboard-text-soft)] shadow-none hover:bg-[var(--dashboard-action-soft-bg)] hover:text-[var(--dashboard-text)]",
        danger:
          "border-transparent bg-[var(--dashboard-danger-soft-fg)] text-white shadow-[0_12px_30px_rgba(225,29,72,0.22)] hover:-translate-y-0.5 hover:brightness-95 active:translate-y-0",
      },
      size: {
        sm: "min-h-9 px-3.5 py-2 text-xs",
        md: "min-h-11 px-5 py-2.5",
        lg: "min-h-12 px-6 py-3 text-[15px]",
        icon: "h-11 w-11 p-0",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

export interface AppButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof appButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(appButtonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" /> : leftIcon}
        {children}
        {!loading ? rightIcon : null}
      </Comp>
    );
  }
);

AppButton.displayName = "AppButton";

export { appButtonVariants };
