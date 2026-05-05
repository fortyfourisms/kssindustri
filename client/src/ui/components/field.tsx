import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

type FieldState = "default" | "error" | "success";

type BaseFieldProps = {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  optionalLabel?: React.ReactNode;
  state?: FieldState;
  containerClassName?: string;
};

function getFieldStateClass(state: FieldState, disabled?: boolean) {
  if (disabled) {
    return "cursor-not-allowed bg-[var(--dashboard-section-muted)] text-[var(--dashboard-text-muted)]";
  }

  if (state === "error") {
    return "border-[var(--dashboard-danger-soft-fg)] focus-visible:ring-[var(--dashboard-danger-soft-fg)]";
  }

  if (state === "success") {
    return "border-[var(--dashboard-success-soft-fg)] focus-visible:ring-[var(--dashboard-success-soft-fg)]";
  }

  return "";
}

export function FormField({
  label,
  helperText,
  error,
  optionalLabel,
  children,
  containerClassName,
}: React.PropsWithChildren<BaseFieldProps>) {
  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label ? (
        <div className="flex items-center justify-between gap-3">
          <Label className="dashboard-label text-sm font-semibold">{label}</Label>
          {optionalLabel ? (
            <span className="text-xs text-[var(--dashboard-text-muted)]">{optionalLabel}</span>
          ) : null}
        </div>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-[var(--dashboard-danger-soft-fg)]">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[var(--dashboard-text-muted)]">{helperText}</p>
      ) : null}
    </div>
  );
}

export type AppInputProps = React.InputHTMLAttributes<HTMLInputElement> & BaseFieldProps;

export const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(
  ({ label, helperText, error, state = "default", containerClassName, className, optionalLabel, ...props }, ref) => (
    <FormField
      label={label}
      helperText={helperText}
      error={error}
      optionalLabel={optionalLabel}
      containerClassName={containerClassName}
    >
      <input
        ref={ref}
        className={cn(
          "dashboard-input flex min-h-11 w-full rounded-[var(--radius-md)] border px-4 py-2.5 text-sm transition",
          getFieldStateClass(error ? "error" : state, props.disabled),
          className
        )}
        {...props}
      />
    </FormField>
  )
);
AppInput.displayName = "AppInput";

export type AppTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & BaseFieldProps;

export const AppTextarea = React.forwardRef<HTMLTextAreaElement, AppTextareaProps>(
  ({ label, helperText, error, state = "default", containerClassName, className, optionalLabel, ...props }, ref) => (
    <FormField
      label={label}
      helperText={helperText}
      error={error}
      optionalLabel={optionalLabel}
      containerClassName={containerClassName}
    >
      <textarea
        ref={ref}
        className={cn(
          "dashboard-input flex min-h-[110px] w-full rounded-[var(--radius-md)] border px-4 py-3 text-sm transition",
          getFieldStateClass(error ? "error" : state, props.disabled),
          className
        )}
        {...props}
      />
    </FormField>
  )
);
AppTextarea.displayName = "AppTextarea";

type AppSelectOption = {
  label: string;
  value: string;
};

type AppSelectProps = BaseFieldProps & {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options: AppSelectOption[];
  disabled?: boolean;
  className?: string;
};

export function AppSelect({
  label,
  helperText,
  error,
  state = "default",
  containerClassName,
  optionalLabel,
  value,
  onValueChange,
  placeholder = "Pilih opsi",
  options,
  disabled,
  className,
}: AppSelectProps) {
  return (
    <FormField
      label={label}
      helperText={helperText}
      error={error}
      optionalLabel={optionalLabel}
      containerClassName={containerClassName}
    >
      <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          className={cn(
            "dashboard-input flex min-h-11 w-full items-center justify-between rounded-[var(--radius-md)] border px-4 py-2.5 text-sm transition",
            getFieldStateClass(error ? "error" : state, disabled),
            className
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown className="h-4 w-4 opacity-70" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className="z-50 min-w-[8rem] overflow-hidden rounded-[var(--radius-md)] border border-[var(--dashboard-border)] bg-[var(--dashboard-surface-strong)] shadow-[var(--dashboard-card-shadow)]">
            <SelectPrimitive.Viewport className="p-1.5">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex cursor-default select-none items-center rounded-xl py-2 pl-9 pr-3 text-sm outline-none focus:bg-[var(--dashboard-section-emphasis)]"
                >
                  <span className="absolute left-3 flex h-4 w-4 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </FormField>
  );
}

type AppCheckboxProps = BaseFieldProps & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
};

export function AppCheckbox({
  label,
  helperText,
  error,
  checked,
  onCheckedChange,
  disabled,
  containerClassName,
}: AppCheckboxProps) {
  return (
    <FormField helperText={helperText} error={error} containerClassName={containerClassName}>
      <label className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] px-4 py-3">
        <Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange?.(Boolean(value))} disabled={disabled} />
        <span className="space-y-1">
          <span className="block text-sm font-semibold text-[var(--dashboard-text)]">{label}</span>
          {helperText ? <span className="block text-xs text-[var(--dashboard-text-muted)]">{helperText}</span> : null}
        </span>
      </label>
    </FormField>
  );
}

type AppRadioOption = {
  label: string;
  value: string;
  helperText?: string;
};

type AppRadioGroupProps = BaseFieldProps & {
  value?: string;
  onValueChange?: (value: string) => void;
  options: AppRadioOption[];
  name: string;
};

export function AppRadioGroup({
  label,
  helperText,
  error,
  options,
  value,
  onValueChange,
  name,
  containerClassName,
}: AppRadioGroupProps) {
  return (
    <FormField label={label} helperText={helperText} error={error} containerClassName={containerClassName}>
      <div className="grid gap-3">
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3 transition",
                checked
                  ? "dashboard-option-selected"
                  : "border-[var(--dashboard-border)] bg-[var(--dashboard-surface)]"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={(event) => onValueChange?.(event.target.value)}
                className="mt-0.5"
              />
              <span>
                <span className="block text-sm font-semibold text-[var(--dashboard-text)]">{option.label}</span>
                {option.helperText ? (
                  <span className="block text-xs text-[var(--dashboard-text-muted)]">{option.helperText}</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </FormField>
  );
}

type AppSwitchProps = BaseFieldProps & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
};

export function AppSwitch({
  label,
  helperText,
  error,
  checked,
  onCheckedChange,
  disabled,
  containerClassName,
}: AppSwitchProps) {
  return (
    <FormField helperText={helperText} error={error} containerClassName={containerClassName}>
      <label className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] px-4 py-3">
        <span>
          <span className="block text-sm font-semibold text-[var(--dashboard-text)]">{label}</span>
          {helperText ? <span className="block text-xs text-[var(--dashboard-text-muted)]">{helperText}</span> : null}
        </span>
        <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
      </label>
    </FormField>
  );
}
