import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-sm font-display uppercase tracking-wide transition duration-150 disabled:cursor-not-allowed disabled:opacity-50",
    variant === "primary" &&
      "border-2 border-ink bg-electric text-white shadow-[3px_3px_0_var(--ink)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--ink)]",
    variant === "secondary" &&
      "border-2 border-ink bg-sun text-ink shadow-[3px_3px_0_var(--ink)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--ink)]",
    variant === "outline" &&
      "border-2 border-ink bg-white text-ink shadow-[3px_3px_0_var(--ink)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--ink)]",
    variant === "ghost" &&
      "border-2 border-transparent text-ink hover:border-ink hover:bg-cream-deep hover:shadow-[3px_3px_0_var(--ink)]",
    variant === "danger" &&
      "border-2 border-ink bg-danger text-white shadow-[3px_3px_0_var(--ink)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)]",
    size === "sm" && "min-h-9 px-3.5 py-1.5 text-xs",
    size === "md" && "min-h-11 px-5 py-2.5 text-xs sm:text-sm",
    size === "lg" && "min-h-13 px-7 py-3 text-sm sm:text-base",
    className,
  );
}

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      {...props}
    />
  );
}
