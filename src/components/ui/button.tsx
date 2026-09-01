import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
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
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-55",
    variant === "primary" &&
      "bg-brand text-white shadow-[0_10px_24px_rgba(25,107,82,.2)] hover:-translate-y-0.5 hover:bg-brand-strong",
    variant === "secondary" &&
      "border border-line bg-white text-ink shadow-sm hover:-translate-y-0.5 hover:border-brand/30 hover:bg-brand-soft/40",
    variant === "ghost" && "text-ink-muted hover:bg-surface-muted hover:text-ink",
    variant === "danger" && "bg-red-50 text-danger hover:bg-red-100",
    size === "sm" && "min-h-9 px-4 py-2 text-sm",
    size === "md" && "min-h-11 px-5 py-2.5 text-sm",
    size === "lg" && "min-h-13 px-7 py-3 text-base",
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
