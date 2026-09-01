import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import Link from "next/link";

import { ProductVisual } from "@/components/products/product-visual";
import { Badge } from "@/components/ui/badge";
import { getProducts } from "@/lib/data/dogs";
import { productCategoryLabels } from "@/lib/constants";

export const metadata: Metadata = { title: "Productos" };

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <div>
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Catálogo experimental</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">¿Qué ha probado tu perro?</h1>
        <p className="mt-4 text-base leading-7 text-ink-muted">No es una tienda. Este catálogo existe para registrar qué productos funcionan para perros con distintas características.</p>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`} className="group rounded-[2rem] border border-line bg-white p-4 shadow-card transition hover:-translate-y-1 hover:shadow-float">
            <ProductVisual product={product} />
            <div className="px-1 pb-2 pt-4">
              <Badge tone="orange">{productCategoryLabels[product.category]}</Badge>
              <h2 className="mt-3 font-display text-xl font-semibold group-hover:text-brand">{product.name}</h2>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-muted">{product.description}</p>
            </div>
          </Link>
        ))}
      </div>
      {!products.length ? (
        <div className="mt-10 rounded-[2rem] border border-dashed border-line p-10 text-center text-ink-muted"><PackageSearch className="mx-auto" /><p className="mt-3">El catálogo estará disponible después de ejecutar el seed.</p></div>
      ) : null}
    </div>
  );
}
