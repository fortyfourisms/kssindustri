import * as React from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { AppButton } from "@/ui/components/button";
import { AppModal } from "@/ui/components/modal";
import { AppTextarea } from "@/ui/components/field";

type BannerVariant = "info" | "success" | "warning" | "danger";

const bannerStyles: Record<BannerVariant, string> = {
  info: "dashboard-chip-info",
  success: "dashboard-chip-success",
  warning: "dashboard-chip-warning",
  danger: "dashboard-chip-danger",
};

const bannerIcons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: AlertCircle,
};

export function StatusBanner({
  variant,
  title,
  description,
  className,
}: {
  variant: BannerVariant;
  title?: React.ReactNode;
  description: React.ReactNode;
  className?: string;
}) {
  const Icon = bannerIcons[variant];

  return (
    <div className={cn("flex items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-sm", bannerStyles[variant], className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div>{description}</div>
      </div>
    </div>
  );
}

type ConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger";
  onConfirm: () => void;
  loading?: boolean;
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  confirmVariant = "primary",
  onConfirm,
  loading,
}: ConfirmationDialogProps) {
  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <AppButton variant="ghost" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </AppButton>
          <AppButton variant={confirmVariant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </AppButton>
        </>
      }
    >
      <StatusBanner variant={confirmVariant === "danger" ? "danger" : "warning"} description={description} />
    </AppModal>
  );
}

type EditRequestDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  submitLabel?: string;
  loading?: boolean;
};

export function EditRequestDialog({
  open,
  onOpenChange,
  title,
  description,
  value,
  onChange,
  onSubmit,
  submitLabel = "Kirim Pengajuan",
  loading,
}: EditRequestDialogProps) {
  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <AppButton
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
              onChange("");
            }}
          >
            Batal
          </AppButton>
          <AppButton variant="primary" onClick={onSubmit} loading={loading}>
            {submitLabel}
          </AppButton>
        </>
      }
    >
      <AppTextarea
        label="Alasan pengajuan perubahan"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Jelaskan alasan perubahan data yang diajukan."
        rows={5}
        className="resize-none"
      />
    </AppModal>
  );
}
