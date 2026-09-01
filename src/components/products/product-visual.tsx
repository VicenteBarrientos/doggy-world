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
        "relative flex aspect-square items-center justify-center overflow-hidden rounded-[1.75rem] bg-accent-soft text-[#a45c2d]",
        className,
      )}
    >
      {product.image_url ? (
        <Image
          src={product.image_url}
          alt={`Foto de ${product.name}`}
          fill
          sizes="(max-width: 768px) 42vw, 240px"
          className="object-cover"
        />
      ) : (
        <Icon size={46} strokeWidth={1.6} aria-hidden="true" />
      )}
    </div>
  );
}
