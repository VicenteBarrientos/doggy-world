import "server-only";

import { resolveDogPhoto } from "@/lib/data/photos";
import { requireViewer } from "@/lib/data/viewer";
import { demoDogs } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { DogWithPhoto, PlaydateWithDetails } from "@/types/database";

// In-memory synthetic playdates store for demo mode sessions
const demoPlaydates: PlaydateWithDetails[] = [
  {
    id: "p1111111-1111-4111-8111-111111111111",
    host_dog_id: demoDogs[0].id, // Rocky
    title: "Paseo y carreras en el parque",
    starts_at: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days ahead
    ends_at: null,
    city: "Santiago",
    location_label: "Parque Inés de Suárez, Providencia",
    meeting_point: null,
    notes: "Traeremos pelotas y agua fresca para los perros.",
    status: "scheduled",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    host_dog: demoDogs[0],
    participants: [
      {
        id: "pp111111-1111-4111-8111-111111111111",
        playdate_id: "p1111111-1111-4111-8111-111111111111",
        dog_id: demoDogs[2].id, // Coco
        status: "accepted",
        invited_at: new Date().toISOString(),
        responded_at: new Date().toISOString(),
        dog: demoDogs[2],
      },
    ],
  },
  {
    id: "p2222222-2222-4222-8222-222222222222",
    host_dog_id: demoDogs[3].id, // Milo
    title: "Práctica de agility y rastreo",
    starts_at: new Date(Date.now() + 86400000 * 4).toISOString(), // 4 days ahead
    ends_at: null,
    city: "Santiago",
    location_label: "Parque Bicentenario, Vitacura",
    meeting_point: null,
    notes: "Sesión corta de juegos de obediencia y carreras suaves.",
    status: "scheduled",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    host_dog: demoDogs[3],
    participants: [
      {
        id: "pp222222-2222-4222-8222-222222222222",
        playdate_id: "p2222222-2222-4222-8222-222222222222",
        dog_id: demoDogs[0].id, // Rocky (invited)
        status: "invited",
        invited_at: new Date().toISOString(),
        responded_at: null,
        dog: demoDogs[0],
      },
    ],
  },
];

export function recordDemoPlaydate(playdate: PlaydateWithDetails) {
  demoPlaydates.unshift(playdate);
}

export function respondDemoPlaydate(playdateId: string, dogId: string, status: "accepted" | "declined") {
  const p = demoPlaydates.find((d) => d.id === playdateId);
  if (p) {
    const part = p.participants.find((pt) => pt.dog_id === dogId);
    if (part) {
      part.status = status;
      part.responded_at = new Date().toISOString();
    }
  }
}

export async function getDogPlaydates(dogId: string): Promise<{
  upcoming: PlaydateWithDetails[];
  invitations: PlaydateWithDetails[];
  past: PlaydateWithDetails[];
}> {
  const viewer = await requireViewer();

  if (viewer.isDemo || !isSupabaseConfigured()) {
    const relevant = demoPlaydates.filter(
      (p) => p.host_dog_id === dogId || p.participants.some((pt) => pt.dog_id === dogId),
    );

    const now = new Date().toISOString();
    const upcoming: PlaydateWithDetails[] = [];
    const invitations: PlaydateWithDetails[] = [];
    const past: PlaydateWithDetails[] = [];

    for (const p of relevant) {
      const isHost = p.host_dog_id === dogId;
      const myPart = p.participants.find((pt) => pt.dog_id === dogId);

      if (p.status === "cancelled" || p.status === "completed" || p.starts_at < now) {
        past.push(p);
      } else if (!isHost && myPart?.status === "invited") {
        invitations.push(p);
      } else if (isHost || myPart?.status === "accepted") {
        upcoming.push(p);
      }
    }

    return { upcoming, invitations, past };
  }

  const supabase = await createClient();

  // 1. Get playdates where dog is host
  const { data: hostPlaydates } = await supabase
    .from("playdates")
    .select("*")
    .eq("host_dog_id", dogId)
    .order("starts_at", { ascending: true });

  // 2. Get playdates where dog is participant
  const { data: participantRows } = await supabase
    .from("playdate_participants")
    .select("playdate_id, status, invited_at, responded_at")
    .eq("dog_id", dogId);

  const participantPlaydateIds = (participantRows || []).map((r) => r.playdate_id);
  const { data: participantPlaydates } = participantPlaydateIds.length
    ? await supabase
        .from("playdates")
        .select("*")
        .in("id", participantPlaydateIds)
        .order("starts_at", { ascending: true })
    : { data: [] };

  const allPlaydatesMap = new Map<string, typeof hostPlaydates extends (infer T)[] ? T : never>();
  for (const p of [...(hostPlaydates || []), ...(participantPlaydates || [])]) {
    allPlaydatesMap.set(p.id, p);
  }

  const playdatesList = Array.from(allPlaydatesMap.values());
  if (playdatesList.length === 0) {
    return { upcoming: [], invitations: [], past: [] };
  }

  // Fetch all participants for these playdates
  const { data: allParticipants } = await supabase
    .from("playdate_participants")
    .select("*")
    .in("playdate_id", Array.from(allPlaydatesMap.keys()));

  // Fetch all dogs involved
  const allDogIds = new Set<string>();
  for (const p of playdatesList) allDogIds.add(p.host_dog_id);
  for (const pt of allParticipants || []) allDogIds.add(pt.dog_id);

  const { data: dogs } = await supabase
    .from("dogs")
    .select("*")
    .in("id", Array.from(allDogIds));

  const dogMap = new Map<string, DogWithPhoto>();
  for (const d of dogs || []) {
    dogMap.set(d.id, { ...d, photo_url: await resolveDogPhoto(d.photo_path) });
  }

  const now = new Date().toISOString();
  const upcoming: PlaydateWithDetails[] = [];
  const invitations: PlaydateWithDetails[] = [];
  const past: PlaydateWithDetails[] = [];

  for (const p of playdatesList) {
    const hostDog = dogMap.get(p.host_dog_id);
    if (!hostDog) continue;

    const parts = (allParticipants || [])
      .filter((pt) => pt.playdate_id === p.id)
      .map((pt) => ({
        ...pt,
        dog: dogMap.get(pt.dog_id)!,
      }))
      .filter((pt) => Boolean(pt.dog));

    const playdateDetails: PlaydateWithDetails = {
      ...p,
      host_dog: hostDog,
      participants: parts,
    };

    const isHost = p.host_dog_id === dogId;
    const myPart = parts.find((pt) => pt.dog_id === dogId);

    if (p.status === "cancelled" || p.status === "completed" || p.starts_at < now) {
      past.push(playdateDetails);
    } else if (!isHost && myPart?.status === "invited") {
      invitations.push(playdateDetails);
    } else if (isHost || myPart?.status === "accepted") {
      upcoming.push(playdateDetails);
    }
  }

  return { upcoming, invitations, past };
}
