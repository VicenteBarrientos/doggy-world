"use client";

import { Trash2 } from "lucide-react";

import { deleteDogAction } from "@/app/actions/dogs";
import { Button } from "@/components/ui/button";

export function DeleteDogButton({ dogId, dogName }: { dogId: string; dogName: string }) {
  return (
    <form
      action={deleteDogAction}
      onSubmit={(event) => {
        if (!window.confirm(`¿Eliminar definitivamente el pasaporte de ${dogName}?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="dogId" value={dogId} />
      <Button type="submit" variant="danger" size="sm">
        <Trash2 size={16} /> Eliminar pasaporte
      </Button>
    </form>
  );
}
