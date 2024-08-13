import type { ButtonHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type Sizes = "full" | "small";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Sizes;
  children: ReactNode;
}

export const CustomButton = ({
  className,
  children,
  size = "full",
  disabled,
  ...rest
}: ButtonProps) => {
  return (
    <button
      type="button"
      disabled={disabled}
      {...rest}
      tabIndex={0}
      className={twMerge(
        "text-white flex items-center justify-center gap-2 bg-theme-primary px-3 font-primary",
        "transition-[filter] hover:[filter:brightness(0.9)]",
        size === "full" && "rounded-xl py-2.5 tracking-wide",
        size === "small" && "rounded-lg py-1 text-sm",
        disabled && "bg-theme-secondary",
        className,
      )}
    >
      {children}
    </button>
  );
};
