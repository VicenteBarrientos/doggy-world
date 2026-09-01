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
      <Link
        href="/products"
        className={buttonStyles({ variant: "ghost", size: "sm", className: "-ml-3" })}
      >
        <ArrowLeft size={16} /> Volver al catálogo
      </Link>
      <div className="edge-card mt-6 grid gap-8 p-6 shadow-[8px_8px_0_var(--ink)] sm:p-8 lg:grid-cols-[.8fr_1.2fr] lg:p-10">
        <ProductVisual product={product} className="w-full" />
        <div className="flex flex-col justify-center">
          <Badge tone="yellow" className="w-fit">
            {productCategoryLabels[product.category]}
          </Badge>
          <h1 className="mt-4 font-display text-4xl uppercase tracking-[-0.03em] sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/80">{product.description}</p>

          <dl className="mt-7 grid gap-3 sm:grid-cols-2">
            {product.material ? (
              <div className="border-2 border-ink bg-cream p-3.5 shadow-[2px_2px_0_var(--ink)]">
                <dt className="text-[10px] font-display uppercase tracking-wider text-ink/65">
                  Material
                </dt>
                <dd className="mt-0.5 font-display text-sm text-ink">{product.material}</dd>
              </div>
            ) : null}
            {product.texture ? (
              <div className="border-2 border-ink bg-cream p-3.5 shadow-[2px_2px_0_var(--ink)]">
                <dt className="text-[10px] font-display uppercase tracking-wider text-ink/65">
                  Textura
                </dt>
                <dd className="mt-0.5 font-display text-sm capitalize text-ink">
                  {product.texture}
                </dd>
              </div>
            ) : null}
            {product.durability ? (
              <div className="border-2 border-ink bg-cream p-3.5 shadow-[2px_2px_0_var(--ink)]">
                <dt className="text-[10px] font-display uppercase tracking-wider text-ink/65">
                  Durabilidad
                </dt>
                <dd className="mt-0.5 font-display text-sm text-ink">
                  {product.durability} / 5
                </dd>
              </div>
            ) : null}
            {product.food_protein ? (
              <div className="border-2 border-ink bg-cream p-3.5 shadow-[2px_2px_0_var(--ink)]">
                <dt className="text-[10px] font-display uppercase tracking-wider text-ink/65">
                  Proteína
                </dt>
                <dd className="mt-0.5 font-display text-sm capitalize text-ink">
                  {product.food_protein}
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-8 border-2 border-ink bg-sun p-5 text-ink shadow-[4px_4px_0_var(--ink)]">
            <p className="flex items-center gap-2 font-display text-sm uppercase">
              <BarChart3 size={18} /> Datos reales para la comunidad
            </p>
            <p className="mt-1.5 text-xs leading-5 text-ink/80">
              Tu feedback se asocia al perfil de tu perro, sus dimensiones y su nivel de energía
              para entender qué juguetes y premios realmente sobreviven.
            </p>
          </div>

          {dogs.length ? (
            <div className="mt-7">
              <p className="font-display text-xs uppercase tracking-wider text-ink/75">
                ¿Quién lo probó en tu manada?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {dogs.map((dog) => (
                  <Link
                    key={dog.id}
                    href={`/dogs/${dog.id}/products?product=${product.id}`}
                    className={buttonStyles({ variant: "primary", size: "sm" })}
                  >
                    <Dog size={16} /> {dog.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className={buttonStyles({ variant: "primary", className: "mt-7 w-fit" })}
            >
              Inicia sesión para dar feedback
            </Link>
          )}

          <p className="mt-5 flex items-center gap-2 text-xs text-ink/65">
            <ShieldCheck size={14} /> Las notas privadas nunca se exponen públicamente.
          </p>
        </div>
      </div>
    </div>
  );
}
