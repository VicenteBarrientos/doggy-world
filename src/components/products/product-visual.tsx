import { Bone, HeartPulse, Package, Puzzle, Salad, ShoppingBag, ToyBrick } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import type { Product } from "@/types/database";

const icons = {
  toy: ToyBrick,
  treat: Bone,
  food: Salad,
  accessory: ShoppingBag,
  enrichment: Puzzle,
  health: HeartPulse,
  other: Package,
};

export function ProductVisual({
  product,
  className,
}: {
  product: Pick<Product, "name" | "image_url" | "category">;
  className?: string;
}) {
  const Icon = icons[product.category];
  return (
    <div
      className={cn(
        "relative flex aspect-square items-center justify-center overflow-hidden border-2 border-ink bg-cream-deep text-ink shadow-[2px_2px_0_var(--ink)]",
        className,
      )}
    >
      {product.image_url ? (
        <Image
          src={product.image_url}
          alt={`Foto de ${product.name}`}
          fill
          sizes="(max-width: 768px) 42vw, 240px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <Icon size={44} strokeWidth={1.6} aria-hidden="true" />
      )}
    </div>
  );
}
