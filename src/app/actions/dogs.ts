"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  actionMessage,
  checkboxValue,
  requireActionUser,
  stringValue,
} from "@/lib/action-helpers";
import { dogPhotoBucket, maxDogPhotoBytes } from "@/lib/constants";
import { fieldErrorsFromZod, type ActionState } from "@/lib/forms";
import { buildDogSlug } from "@/lib/utils";
import { dogSchema } from "@/lib/validation";
import type { Database } from "@/types/database";

const allowedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function parseDogForm(formData: FormData) {
  return dogSchema.safeParse({
    id: stringValue(formData, "id") || undefined,
    name: stringValue(formData, "name"),
    breed: stringValue(formData, "breed"),
    mixedBreed: checkboxValue(formData, "mixedBreed"),
    sex: stringValue(formData, "sex") || undefined,
    birthDate: stringValue(formData, "birthDate") || undefined,
    adoptionDate: stringValue(formData, "adoptionDate") || undefined,
    weightKg: stringValue(formData, "weightKg") || undefined,
    size: stringValue(formData, "size") || undefined,
    energyLevel: stringValue(formData, "energyLevel") || undefined,
    sociability: stringValue(formData, "sociability") || undefined,
    playStyle: stringValue(formData, "playStyle") || undefined,
    personalityTags: formData
      .getAll("personalityTags")
      .filter((value): value is string => typeof value === "string"),
    bio: stringValue(formData, "bio") || undefined,
    city: stringValue(formData, "city") || undefined,
    country: stringValue(formData, "country") || undefined,
    isPublic: formData.has("isPublic") ? checkboxValue(formData, "isPublic") : true,
  });
}

function extensionForPhoto(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

function validatePhoto(file: File | null) {
  if (!file || file.size === 0) return null;
  if (!allowedPhotoTypes.has(file.type)) {
    throw new Error("La foto debe ser JPG, PNG o WebP.");
  }
  if (file.size > maxDogPhotoBytes) {
    throw new Error("La foto debe pesar menos de 3 MB.");
  }
  return file;
}

export async function createDogAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseDogForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: fieldErrorsFromZod(parsed.error.flatten().fieldErrors),
    };
  }

  let dogId = "";
  let dogSlug = "";
  try {
    const { supabase, user } = await requireActionUser();
    dogId = crypto.randomUUID();
    dogSlug = buildDogSlug(parsed.data.name, dogId);
    const photoValue = formData.get("photo");
    const photo = validatePhoto(photoValue instanceof File ? photoValue : null);
    let photoPath: string | null = null;

    if (photo) {
      photoPath = `${user.id}/${dogId}/profile.${extensionForPhoto(photo)}`;
      const { error: uploadError } = await supabase.storage
        .from(dogPhotoBucket)
        .upload(photoPath, photo, { contentType: photo.type, upsert: false });
      if (uploadError) throw new Error("No pudimos subir la foto.");
    }

    const dog: Database["public"]["Tables"]["dogs"]["Insert"] = {
      id: dogId,
      owner_id: user.id,
      name: parsed.data.name,
      slug: dogSlug,
      photo_path: photoPath,
      breed: parsed.data.breed,
      mixed_breed: parsed.data.mixedBreed,
      sex: parsed.data.sex,
      birth_date: parsed.data.birthDate ?? null,
      adoption_date: parsed.data.adoptionDate ?? null,
      weight_kg: parsed.data.weightKg ?? null,
      size: parsed.data.size,
      energy_level: parsed.data.energyLevel,
      sociability: parsed.data.sociability,
      play_style: parsed.data.playStyle ?? null,
      personality_tags: parsed.data.personalityTags,
      bio: parsed.data.bio,
      city: parsed.data.city ?? null,
      country: parsed.data.country ?? null,
      is_public: parsed.data.isPublic,
    };

    const { error } = await supabase.from("dogs").insert(dog);
    if (error) {
      if (photoPath) {
        await supabase.storage.from(dogPhotoBucket).remove([photoPath]);
      }
      throw new Error("No pudimos crear el pasaporte. Inténtalo nuevamente.");
    }
  } catch (error) {
    return { status: "error", message: actionMessage(error) };
  }

  revalidatePath("/dashboard");
  revalidatePath("/discover");
  revalidatePath(`/dog/${dogSlug}`);
  redirect(`/dog/${dogSlug}?created=true`);
}

export async function updateDogAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseDogForm(formData);
  if (!parsed.success || !parsed.data.id) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: parsed.success
        ? { id: ["No encontramos este perro."] }
        : fieldErrorsFromZod(parsed.error.flatten().fieldErrors),
    };
  }

  const dogId = parsed.data.id;
  try {
    const { supabase, user } = await requireActionUser();
    const { data: existing, error: lookupError } = await supabase
      .from("dogs")
      .select("id, photo_path")
      .eq("id", dogId)
      .eq("owner_id", user.id)
      .maybeSingle();
    if (lookupError || !existing) throw new Error("No tienes acceso a este perro.");

    const photoValue = formData.get("photo");
    const photo = validatePhoto(photoValue instanceof File ? photoValue : null);
    let photoPath = existing.photo_path;

    if (photo) {
      const nextPath = `${user.id}/${dogId}/${crypto.randomUUID()}.${extensionForPhoto(photo)}`;
      const { error: uploadError } = await supabase.storage
        .from(dogPhotoBucket)
        .upload(nextPath, photo, { contentType: photo.type, upsert: false });
      if (uploadError) throw new Error("No pudimos subir la foto.");
      photoPath = nextPath;
    }

    const update: Database["public"]["Tables"]["dogs"]["Update"] = {
      name: parsed.data.name,
      breed: parsed.data.breed,
      mixed_breed: parsed.data.mixedBreed,
      sex: parsed.data.sex,
      birth_date: parsed.data.birthDate ?? null,
      adoption_date: parsed.data.adoptionDate ?? null,
      weight_kg: parsed.data.weightKg ?? null,
      size: parsed.data.size,
      energy_level: parsed.data.energyLevel,
      sociability: parsed.data.sociability,
      play_style: parsed.data.playStyle ?? null,
      personality_tags: parsed.data.personalityTags,
      bio: parsed.data.bio,
      city: parsed.data.city ?? null,
      country: parsed.data.country ?? null,
      is_public: parsed.data.isPublic,
      photo_path: photoPath,
    };

    const { error } = await supabase
      .from("dogs")
      .update(update)
      .eq("id", dogId)
      .eq("owner_id", user.id);
    if (error) throw new Error("No pudimos guardar los cambios.");

    if (photo && existing.photo_path) {
      await supabase.storage.from(dogPhotoBucket).remove([existing.photo_path]);
    }
  } catch (error) {
    return { status: "error", message: actionMessage(error) };
  }

  revalidatePath(`/dogs/${dogId}`);
  revalidatePath("/dashboard");
  redirect(`/dogs/${dogId}`);
}

export async function deleteDogAction(formData: FormData) {
  const dogId = stringValue(formData, "dogId");
  if (!/^[0-9a-f-]{36}$/i.test(dogId)) return;

  try {
    const { supabase, user } = await requireActionUser();
    const { data: dog } = await supabase
      .from("dogs")
      .select("photo_path")
      .eq("id", dogId)
      .eq("owner_id", user.id)
      .maybeSingle();
    if (!dog) throw new Error("No tienes acceso a este perro.");

    const { error } = await supabase
      .from("dogs")
      .delete()
      .eq("id", dogId)
      .eq("owner_id", user.id);
    if (error) throw error;
    if (dog.photo_path) {
      await supabase.storage.from(dogPhotoBucket).remove([dog.photo_path]);
    }
  } catch {
    redirect(`/dogs/${dogId}?error=delete`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
