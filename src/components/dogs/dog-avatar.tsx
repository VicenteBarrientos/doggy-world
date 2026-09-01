import { PawPrint } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export function DogAvatar({
  src,
  name,
  size = "md",
  className,
  priority = false,
}: {
  src: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
  priority?: boolean;
}) {
  const dimension = size === "sm" ? 48 : size === "md" ? 72 : size === "lg" ? 104 : 360;
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-brand-soft text-brand",
        size === "sm" && "size-12 rounded-2xl",
        size === "md" && "size-18 rounded-3xl",
        size === "lg" && "size-26 rounded-[2rem]",
        size === "hero" && "aspect-[4/5] w-full rounded-[2.5rem]",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={`Foto de ${name}`}
          fill
          priority={priority}
          sizes={
            size === "hero"
              ? "(max-width: 768px) 100vw, 42vw"
              : `${dimension}px`
          }
          className="object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <PawPrint
            aria-hidden="true"
            size={Math.round(dimension * 0.32)}
            strokeWidth={1.8}
          />
        </div>
      )}
    </div>
  );
}
