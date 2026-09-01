import type { Metadata } from "next";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FeedbackForm } from "@/components/products/feedback-form";
import { ProductVisual } from "@/components/products/product-visual";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { productCategoryLabels } from "@/lib/constants";
import { getOwnerDog, getProducts } from "@/lib/data/dogs";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ product?: string }>;
};

export const metadata: Metadata = { title: "Opiniones de productos" };

export default async function DogProductsPage({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [data, products] = await Promise.all([getOwnerDog(id), getProducts()]);
  if (!data) notFound();
  const selected = products.find((product) => product.id === query.product) ?? products[0];
  const existing = selected
    ? data.interactions.find((interaction) => interaction.product_id === selected.id)
    : undefined;
  const ratedIds = new Set(data.interactions.map((interaction) => interaction.product_id));

  return (
    <div>
      <Link href={`/dogs/${id}`} className={buttonStyles({ variant: "ghost", size: "sm", className: "-ml-3" })}><ArrowLeft size={16} /> Volver a {data.dog.name}</Link>
      <div className="mt-5 max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Feedback rápido</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">¿Qué productos conoce {data.dog.name}?</h1>
        <p className="mt-4 text-base leading-7 text-ink-muted">Elige uno y registra su reacción. Solo verás preguntas relevantes para esa categoría.</p>
      </div>

      <div className="mt-9 grid gap-7 lg:grid-cols-[330px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[2rem] border border-line bg-white p-3 shadow-card">
            <p className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">Catálogo demo</p>
            <div className="max-h-[620px] space-y-2 overflow-y-auto pr-1">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/dogs/${id}/products?product=${product.id}`}
                  className={`flex items-center gap-3 rounded-[1.5rem] p-3 transition ${selected?.id === product.id ? "bg-brand-soft text-brand-strong" : "hover:bg-surface-muted"}`}
                >
                  <ProductVisual product={product} className="size-16 shrink-0 rounded-2xl" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{product.name}</span>
                    <span className="mt-1 block text-xs text-ink-muted">{productCategoryLabels[product.category]}</span>
                  </span>
                  {ratedIds.has(product.id) ? <CheckCircle2 size={18} className="shrink-0 text-brand" aria-label="Opinión guardada" /> : null}
                </Link>
              ))}
            </div>
          </div>
        </aside>
        <div>
          {selected ? (
            <>
              {existing ? <Badge tone="green" className="mb-3">Ya tiene una opinión · puedes actualizarla</Badge> : null}
              <FeedbackForm dog={data.dog} product={selected} existing={existing} />
            </>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-line p-10 text-center text-ink-muted">Ejecuta el seed para cargar productos.</div>
          )}
        </div>
      </div>
    </div>
  );
}
