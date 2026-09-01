import type { Metadata } from "next";
import { ArrowLeft, BarChart3, Dog, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductVisual } from "@/components/products/product-visual";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { productCategoryLabels } from "@/lib/constants";
import { getOwnerDogs, getProduct } from "@/lib/data/dogs";
import { getViewer } from "@/lib/data/viewer";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  return { title: product?.name ?? "Producto" };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const [product, viewer] = await Promise.all([getProduct(id), getViewer()]);
  if (!product) notFound();
  const dogs = viewer ? await getOwnerDogs() : [];

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/products" className={buttonStyles({ variant: "ghost", size: "sm", className: "-ml-3" })}><ArrowLeft size={16} /> Volver al catálogo</Link>
      <div className="mt-6 grid gap-8 rounded-[2.75rem] border border-line bg-white p-5 shadow-card sm:p-8 lg:grid-cols-[.8fr_1.2fr] lg:p-10">
        <ProductVisual product={product} className="w-full" />
        <div className="flex flex-col justify-center">
          <Badge tone="orange" className="w-fit">{productCategoryLabels[product.category]}</Badge>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{product.name}</h1>
          <p className="mt-4 text-lg leading-8 text-ink-muted">{product.description}</p>
          <dl className="mt-7 grid gap-3 sm:grid-cols-2">
            {product.material ? <div className="rounded-2xl bg-surface-muted p-4"><dt className="text-xs text-ink-muted">Material</dt><dd className="mt-1 font-semibold">{product.material}</dd></div> : null}
            {product.texture ? <div className="rounded-2xl bg-surface-muted p-4"><dt className="text-xs text-ink-muted">Textura</dt><dd className="mt-1 font-semibold capitalize">{product.texture}</dd></div> : null}
            {product.durability ? <div className="rounded-2xl bg-surface-muted p-4"><dt className="text-xs text-ink-muted">Durabilidad estimada</dt><dd className="mt-1 font-semibold">{product.durability} / 5</dd></div> : null}
            {product.food_protein ? <div className="rounded-2xl bg-surface-muted p-4"><dt className="text-xs text-ink-muted">Proteína</dt><dd className="mt-1 font-semibold capitalize">{product.food_protein}</dd></div> : null}
          </dl>
          <div className="mt-8 rounded-[1.75rem] bg-brand-soft p-5 text-brand-strong">
            <p className="flex items-center gap-2 font-semibold"><BarChart3 size={19} /> Ayuda a construir mejores recomendaciones</p>
            <p className="mt-2 text-sm leading-6 opacity-80">Tu feedback se guarda asociado al perro, sus características y este producto. Las notas quedan privadas.</p>
          </div>
          {dogs.length ? (
            <div className="mt-7">
              <p className="text-sm font-semibold">¿Quién lo probó?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {dogs.map((dog) => (
                  <Link key={dog.id} href={`/dogs/${dog.id}/products?product=${product.id}`} className={buttonStyles({ variant: "secondary", size: "sm" })}><Dog size={16} /> {dog.name}</Link>
                ))}
              </div>
            </div>
          ) : (
            <Link href="/login" className={buttonStyles({ className: "mt-7 w-fit" })}>Inicia sesión para dar feedback</Link>
          )}
          <p className="mt-5 flex items-center gap-2 text-xs text-ink-muted"><ShieldCheck size={14} /> Las opiniones no se publican completas en el pasaporte.</p>
        </div>
      </div>
    </div>
  );
}
