import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DogForm } from "@/components/dogs/dog-form";
import { buttonStyles } from "@/components/ui/button";
import { getOwnerDog } from "@/lib/data/dogs";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getOwnerDog(id);
  return { title: data ? `Editar a ${data.dog.name}` : "Editar pasaporte" };
}

export default async function EditDogPage({ params }: Props) {
  const { id } = await params;
  const data = await getOwnerDog(id);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={`/dogs/${id}`} className={buttonStyles({ variant: "ghost", size: "sm", className: "-ml-3" })}>
        <ArrowLeft size={16} /> Volver al pasaporte
      </Link>
      <div className="mb-8 mt-5">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Editar identidad</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Actualiza el mundo de {data.dog.name}.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink-muted">Los gustos, etapas y rutinas cambian. Su pasaporte está hecho para acompañarlos.</p>
      </div>
      <DogForm dog={data.dog} />
    </div>
  );
}
