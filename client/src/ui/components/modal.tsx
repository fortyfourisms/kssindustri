import * as React from "react";
import { X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type AppModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  closeOnOutsideClick?: boolean;
  showCloseButton?: boolean;
};

export function AppModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  contentClassName,
  closeOnOutsideClick = true,
  showCloseButton = true,
}: AppModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "dashboard-modal-panel rounded-[var(--radius-2xl)] border p-0 sm:max-w-lg",
          contentClassName
        )}
        onPointerDownOutside={(event) => {
          if (!closeOnOutsideClick) {
            event.preventDefault();
          }
        }}
      >
        <div className={cn("space-y-6 p-6", className)}>
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DialogTitle className="text-xl font-bold text-[var(--dashboard-text)]">
                  {title}
                </DialogTitle>
                {description ? (
                  <DialogDescription className="text-sm text-[var(--dashboard-text-soft)]">
                    {description}
                  </DialogDescription>
                ) : null}
              </div>
              {!showCloseButton ? null : (
                <DialogClose className="dashboard-modal-close rounded-xl p-2 transition hover:brightness-95">
                  <X className="h-4 w-4" />
                </DialogClose>
              )}
            </div>
          </DialogHeader>
          <div>{children}</div>
          {footer ? <DialogFooter className="gap-3 sm:gap-3">{footer}</DialogFooter> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
