import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import Link from "next/link";

import { ProductVisual } from "@/components/products/product-visual";
import { Badge } from "@/components/ui/badge";
import { getProducts } from "@/lib/data/dogs";
import { productCategoryLabels } from "@/lib/constants";

export const metadata: Metadata = { title: "Catálogo experimental" };

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <div>
      <div className="max-w-2xl">
        <p className="font-brush text-3xl text-electric">Catálogo experimental</p>
        <h1 className="mt-1 text-4xl sm:text-6xl">¿Qué ha probado tu perro?</h1>
        <p className="mt-4 text-base leading-7 text-ink/75">
          No es una tienda. Este catálogo existe para registrar y compartir qué productos funcionan
          para perros con distintas características, mandíbulas y personalidades.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="edge-card group block p-5 shadow-[6px_6px_0_var(--ink)] transition duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--ink)]"
          >
            <ProductVisual product={product} />
            <div className="pt-4">
              <Badge tone="yellow">{productCategoryLabels[product.category]}</Badge>
              <h2 className="mt-3 font-display text-xl uppercase tracking-tight group-hover:text-electric">
                {product.name}
              </h2>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-ink/75">
                {product.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {!products.length ? (
        <div className="edge-card mt-12 border-dashed p-10 text-center text-ink/70">
          <PackageSearch className="mx-auto text-ink/50" size={36} />
          <p className="mt-3 font-display uppercase text-sm">
            El catálogo estará disponible después de ejecutar el seed.
          </p>
        </div>
      ) : null}
    </div>
  );
}
