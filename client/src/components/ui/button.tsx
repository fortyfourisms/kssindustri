import { cva } from "class-variance-authority";

import { AppButton, type AppButtonProps } from "@/ui/components/button";

const buttonVariants = cva("", {
  variants: {
    variant: {
      default: "",
      destructive: "",
      outline: "",
      secondary: "",
      ghost: "",
    },
    size: {
      default: "",
      sm: "",
      lg: "",
      icon: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type LegacyVariant = "default" | "destructive" | "outline" | "secondary" | "ghost";
type LegacySize = "default" | "sm" | "lg" | "icon";

function mapVariant(variant?: LegacyVariant): AppButtonProps["variant"] {
  switch (variant) {
    case "destructive":
      return "danger";
    case "outline":
      return "outline";
    case "secondary":
      return "secondary";
    case "ghost":
      return "ghost";
    default:
      return "primary";
  }
}

function mapSize(size?: LegacySize): AppButtonProps["size"] {
  switch (size) {
    case "sm":
      return "sm";
    case "lg":
      return "lg";
    case "icon":
      return "icon";
    default:
      return "md";
  }
}

export interface ButtonProps
  extends Omit<AppButtonProps, "variant" | "size"> {
  variant?: LegacyVariant;
  size?: LegacySize;
}

function Button({ variant, size, ...props }: ButtonProps) {
  return <AppButton variant={mapVariant(variant)} size={mapSize(size)} {...props} />;
}

export { Button, buttonVariants };
