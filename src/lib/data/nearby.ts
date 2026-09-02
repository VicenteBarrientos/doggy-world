import "server-only";

import { resolveDogPhoto } from "@/lib/data/photos";
import { requireViewer } from "@/lib/data/viewer";
import { demoDogs } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { DogLocation, NearbyDog } from "@/types/database";

// Synthetic coordinates in Santiago for demo fallback
const demoDogCoordinates: Record<string, { lat: number; lng: number; city: string }> = {
  "11111111-1111-4111-8111-111111111111": { lat: -33.4312, lng: -70.6125, city: "Providencia" }, // Rocky
  "22222222-2222-4222-8222-222222222222": { lat: -33.4125, lng: -70.583, city: "Las Condes" }, // Luna
  "33333333-3333-4333-8333-333333333333": { lat: -33.0245, lng: -71.5518, city: "Viña del Mar" }, // Coco
  "44444444-4444-4444-8444-444444444444": { lat: -33.395, lng: -70.578, city: "Vitacura" }, // Milo
  "55555555-5555-4555-8555-555555555555": { lat: -29.9027, lng: -71.2519, city: "La Serena" }, // Nala
  "66666666-6666-4666-8666-666666666666": { lat: -33.456, lng: -70.603, city: "Ñuñoa" }, // Bruno
  "77777777-7777-4777-8777-777777777777": { lat: -33.015, lng: -71.542, city: "Viña del Mar" }, // Kira
  "88888888-8888-4888-8888-888888888888": { lat: -33.4372, lng: -70.6506, city: "Santiago Centro" }, // Simba
  "99999999-9999-4999-8999-999999999999": { lat: -29.91, lng: -71.26, city: "La Serena" }, // Toby
  "aaaaaaaa-0000-4000-8000-000000000000": { lat: -33.36, lng: -70.51, city: "Lo Barnechea" }, // Maya
};

export function getDemoApproxDistanceKm(fromDogId: string, toDogId: string) {
  const from = demoDogCoordinates[fromDogId];
  const to = demoDogCoordinates[toDogId];
  if (!from || !to) return undefined;
  return calculateHaversineKm(from.lat, from.lng, to.lat, to.lng);
}

function calculateHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function getDogLocation(
  dogId: string,
): Promise<Pick<DogLocation, "id" | "dog_id" | "nearby_enabled" | "city" | "location_label"> | null> {
  const viewer = await requireViewer();
  if (viewer.isDemo || !isSupabaseConfigured()) {
    const coords = demoDogCoordinates[dogId];
    if (!coords) return null;
    return {
      id: `demo-loc-${dogId}`,
      dog_id: dogId,
      nearby_enabled: true,
      city: coords.city,
      location_label: coords.city,
    };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("dog_locations")
    .select("id, dog_id, nearby_enabled, city, location_label")
    .eq("dog_id", dogId)
    .maybeSingle();

  return data ?? null;
}

export async function getNearbyDogs({
  requestingDogId,
  centerLat,
  centerLng,
  radiusKm = 5.0,
}: {
  requestingDogId: string;
  centerLat: number;
  centerLng: number;
  radiusKm?: number;
}): Promise<NearbyDog[]> {
  const viewer = await requireViewer();

  if (viewer.isDemo || !isSupabaseConfigured()) {
    const requestingCoords = demoDogCoordinates[requestingDogId];
    const originLat = centerLat || requestingCoords?.lat || -33.4372;
    const originLng = centerLng || requestingCoords?.lng || -70.6506;

    const nearby: NearbyDog[] = [];
    for (const dog of demoDogs) {
      if (dog.id === requestingDogId) continue;
      if (dog.owner_id === viewer.id) continue;
      if (!dog.is_public) continue;

      const coords = demoDogCoordinates[dog.id];
      if (!coords) continue;

      const dist = calculateHaversineKm(originLat, originLng, coords.lat, coords.lng);
      if (dist <= radiusKm) {
        // Approximate coordinates snapped to ~1 km grid
        const approxLat = Math.round(coords.lat * 100) / 100;
        const approxLng = Math.round(coords.lng * 100) / 100;

        nearby.push({
          dog_id: dog.id,
          name: dog.name,
          slug: dog.slug,
          breed: dog.breed,
          photo_path: dog.photo_path,
          photo_url: dog.photo_url,
          size: dog.size,
          energy_level: dog.energy_level,
          sociability: dog.sociability,
          play_style: dog.play_style,
          city: coords.city,
          approx_lat: approxLat,
          approx_lng: approxLng,
          distance_km: dist,
        });
      }
    }

    return nearby.sort((a, b) => a.distance_km - b.distance_km);
  }

  const supabase = await createClient();
  const { data: rows, error } = await supabase.rpc("get_nearby_dogs", {
    requesting_dog_id: requestingDogId,
    center_lat: centerLat,
    center_lng: centerLng,
    radius_km: radiusKm,
  });

  if (error) {
    console.error("[getNearbyDogs RPC Error]", error);
    return [];
  }

  if (!rows || rows.length === 0) return [];

  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      photo_url: await resolveDogPhoto(row.photo_path),
    })),
  );
}
