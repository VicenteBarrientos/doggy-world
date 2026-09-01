import "server-only";

import { cache } from "react";

import {
  demoDogs,
  demoFriendships,
  demoInteractions,
  demoPreferences,
  demoProducts,
  getDemoDogById,
  getDemoDogBySlug,
} from "@/lib/demo-data";
import { resolveDogPhoto } from "@/lib/data/photos";
import { requireViewer } from "@/lib/data/viewer";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type {
  Dog,
  DogPreference,
  DogProductInteraction,
  DogWithPhoto,
  Product,
  PublicDogProfile,
} from "@/types/database";

async function attachPhotos(dogs: Dog[]): Promise<DogWithPhoto[]> {
  return Promise.all(
    dogs.map(async (dog) => ({
      ...dog,
      photo_url: await resolveDogPhoto(dog.photo_path),
    })),
  );
}

export const getOwnerDogs = cache(async () => {
  const viewer = await requireViewer();
  if (viewer.isDemo) {
    return demoDogs.filter((dog) => dog.owner_id === viewer.id);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dogs")
    .select("*")
    .eq("owner_id", viewer.id)
    .order("created_at", { ascending: true });

  if (error) throw new Error("No pudimos cargar tus perros.");
  return attachPhotos(data ?? []);
});

export const getOwnerDog = cache(async (id: string) => {
  const viewer = await requireViewer();
  if (viewer.isDemo) {
    const dog = getDemoDogById(id);
    if (!dog || dog.owner_id !== viewer.id) return null;
    return {
      dog,
      preferences: demoPreferences.filter((item) => item.dog_id === dog.id),
      interactions: demoInteractions.filter((item) => item.dog_id === dog.id),
    };
  }

  const supabase = await createClient();
  const [{ data: dog, error }, { data: preferences }, { data: interactions }] =
    await Promise.all([
      supabase.from("dogs").select("*").eq("id", id).eq("owner_id", viewer.id).maybeSingle(),
      supabase.from("dog_preferences").select("*").eq("dog_id", id).order("created_at"),
      supabase
        .from("dog_product_interactions")
        .select("*")
        .eq("dog_id", id)
        .order("updated_at", { ascending: false }),
    ]);

  if (error) throw new Error("No pudimos cargar este pasaporte.");
  if (!dog) return null;

  return {
    dog: {
      ...dog,
      photo_url: await resolveDogPhoto(dog.photo_path),
    },
    preferences: (preferences ?? []) as DogPreference[],
    interactions: (interactions ?? []) as DogProductInteraction[],
  };
});

export const getPublicDog = cache(async (slug: string): Promise<PublicDogProfile | null> => {
  if (!isSupabaseConfigured()) {
    const dog = getDemoDogBySlug(slug);
    if (!dog?.is_public) return null;
    const friendships = demoFriendships.filter(
      (friendship) =>
        friendship.status === "accepted" &&
        (friendship.requester_dog_id === dog.id ||
          friendship.recipient_dog_id === dog.id),
    );
    const friendIds = friendships.map((friendship) =>
      friendship.requester_dog_id === dog.id
        ? friendship.recipient_dog_id
        : friendship.requester_dog_id,
    );
    const favoriteProductIds = demoInteractions
      .filter((interaction) => interaction.dog_id === dog.id && interaction.favorite)
      .map((interaction) => interaction.product_id);

    return {
      ...dog,
      preferences: demoPreferences.filter(
        (preference) => preference.dog_id === dog.id && preference.is_public,
      ),
      favorite_products: demoProducts.filter((product) =>
        favoriteProductIds.includes(product.id),
      ),
      friends: demoDogs.filter((friend) => friendIds.includes(friend.id)),
      friend_count: friendIds.length,
    };
  }

  const supabase = await createClient();
  const { data: dog, error } = await supabase
    .from("dogs")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (error || !dog) return null;

  const [{ data: preferences }, { data: friendships }, { data: favorites }] =
    await Promise.all([
      supabase
        .from("dog_preferences")
        .select("*")
        .eq("dog_id", dog.id)
        .eq("is_public", true),
      supabase
        .from("dog_friendships")
        .select("*")
        .eq("status", "accepted")
        .or(`requester_dog_id.eq.${dog.id},recipient_dog_id.eq.${dog.id}`),
      supabase.rpc("get_public_dog_favorites", { public_dog_id: dog.id }),
    ]);

  const friendshipRows = friendships ?? [];
  const friendIds = friendshipRows.map((friendship) =>
    friendship.requester_dog_id === dog.id
      ? friendship.recipient_dog_id
      : friendship.requester_dog_id,
  );
  let friends: DogWithPhoto[] = [];
  if (friendIds.length) {
    const { data } = await supabase
      .from("dogs")
      .select("*")
      .in("id", friendIds)
      .eq("is_public", true);
    friends = await attachPhotos(data ?? []);
  }

  return {
    ...dog,
    photo_url: await resolveDogPhoto(dog.photo_path),
    preferences: (preferences ?? []) as DogPreference[],
    favorite_products: (favorites ?? []).map((product) => ({
      id: product.product_id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      image_url: product.image_url,
    })) as PublicDogProfile["favorite_products"],
    friends,
    friend_count: friendshipRows.length,
  };
});

export async function getPublicDogs(limit = 12) {
  if (!isSupabaseConfigured()) return demoDogs.filter((dog) => dog.is_public).slice(0, limit);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dogs")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return attachPhotos(data ?? []);
}

export const getProducts = cache(async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) return demoProducts;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("category")
    .order("name");
  if (error) throw new Error("No pudimos cargar el catálogo.");
  return data ?? [];
});

export const getProduct = cache(async (idOrSlug: string): Promise<Product | null> => {
  if (!isSupabaseConfigured()) {
    return (
      demoProducts.find(
        (product) => product.id === idOrSlug || product.slug === idOrSlug,
      ) ?? null
    );
  }
  const supabase = await createClient();
  const query = supabase.from("products").select("*").eq("is_active", true);
  const { data } = idOrSlug.includes("-") && idOrSlug.length === 36
    ? await query.eq("id", idOrSlug).maybeSingle()
    : await query.eq("slug", idOrSlug).maybeSingle();
  return data;
});
