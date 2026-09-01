import "server-only";

import { demoDogs, demoFriendships } from "@/lib/demo-data";
import { resolveDogPhoto } from "@/lib/data/photos";
import { requireViewer } from "@/lib/data/viewer";
import { createClient } from "@/lib/supabase/server";
import type { DogFriendship, DogWithPhoto } from "@/types/database";

export type FriendRequestView = {
  friendship: DogFriendship;
  requester: DogWithPhoto;
  recipient: DogWithPhoto;
};

export function recordDemoFriendRequest(requesterDogId: string, recipientDogId: string) {
  const duplicate = demoFriendships.some(
    (friendship) =>
      (friendship.requester_dog_id === requesterDogId &&
        friendship.recipient_dog_id === recipientDogId) ||
      (friendship.requester_dog_id === recipientDogId &&
        friendship.recipient_dog_id === requesterDogId),
  );

  if (duplicate) {
    return { ok: false, message: "Estos perros ya tienen una solicitud o amistad demo." };
  }

  const now = new Date().toISOString();
  demoFriendships.unshift({
    id: crypto.randomUUID(),
    requester_dog_id: requesterDogId,
    recipient_dog_id: recipientDogId,
    status: "pending",
    created_at: now,
    updated_at: now,
    responded_at: null,
  });
  return { ok: true };
}

export function respondDemoFriendRequest(
  friendshipId: string,
  ownerDogIds: string[],
  status: "accepted" | "declined" | "blocked",
) {
  const friendship = demoFriendships.find(
    (item) =>
      item.id === friendshipId &&
      item.status === "pending" &&
      ownerDogIds.includes(item.recipient_dog_id),
  );
  if (!friendship) return false;

  const now = new Date().toISOString();
  friendship.status = status;
  friendship.responded_at = now;
  friendship.updated_at = now;
  return true;
}

export function removeDemoFriendship(friendshipId: string, ownerDogIds: string[]) {
  const index = demoFriendships.findIndex(
    (friendship) =>
      friendship.id === friendshipId &&
      (ownerDogIds.includes(friendship.requester_dog_id) ||
        ownerDogIds.includes(friendship.recipient_dog_id)),
  );
  if (index === -1) return false;
  demoFriendships.splice(index, 1);
  return true;
}

export async function getFriendRequests(): Promise<FriendRequestView[]> {
  const viewer = await requireViewer();
  const ownerDogs = viewer.isDemo
    ? demoDogs.filter((dog) => dog.owner_id === viewer.id)
    : await (async () => {
        const supabase = await createClient();
        const { data } = await supabase
          .from("dogs")
          .select("*")
          .eq("owner_id", viewer.id);
        return data ?? [];
      })();
  const ownerDogIds = ownerDogs.map((dog) => dog.id);

  if (!ownerDogIds.length) return [];

  if (viewer.isDemo) {
    return demoFriendships
      .filter(
        (friendship) =>
          friendship.status === "pending" &&
          ownerDogIds.includes(friendship.recipient_dog_id),
      )
      .map((friendship) => ({
        friendship,
        requester: demoDogs.find(
          (dog) => dog.id === friendship.requester_dog_id,
        )!,
        recipient: demoDogs.find(
          (dog) => dog.id === friendship.recipient_dog_id,
        )!,
      }));
  }

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("dog_friendships")
    .select("*")
    .eq("status", "pending")
    .in("recipient_dog_id", ownerDogIds)
    .order("created_at", { ascending: false });
  if (!rows?.length) return [];

  const allDogIds = Array.from(
    new Set(rows.flatMap((row) => [row.requester_dog_id, row.recipient_dog_id])),
  );
  const { data: dogs } = await supabase.from("dogs").select("*").in("id", allDogIds);
  const dogMap = new Map<string, DogWithPhoto>();
  await Promise.all(
    (dogs ?? []).map(async (dog) => {
      dogMap.set(dog.id, { ...dog, photo_url: await resolveDogPhoto(dog.photo_path) });
    }),
  );

  return rows.flatMap((friendship) => {
    const requester = dogMap.get(friendship.requester_dog_id);
    const recipient = dogMap.get(friendship.recipient_dog_id);
    return requester && recipient ? [{ friendship, requester, recipient }] : [];
  });
}

export async function getDogFriends(dogId: string): Promise<DogWithPhoto[]> {
  const viewer = await requireViewer();
  if (viewer.isDemo) {
    const friendIds = demoFriendships
      .filter(
        (friendship) =>
          friendship.status === "accepted" &&
          (friendship.requester_dog_id === dogId ||
            friendship.recipient_dog_id === dogId),
      )
      .map((friendship) =>
        friendship.requester_dog_id === dogId
          ? friendship.recipient_dog_id
          : friendship.requester_dog_id,
      );
    return demoDogs.filter((dog) => friendIds.includes(dog.id));
  }

  const supabase = await createClient();
  const { data: friendships } = await supabase
    .from("dog_friendships")
    .select("*")
    .eq("status", "accepted")
    .or(`requester_dog_id.eq.${dogId},recipient_dog_id.eq.${dogId}`);
  const friendIds = (friendships ?? []).map((friendship) =>
    friendship.requester_dog_id === dogId
      ? friendship.recipient_dog_id
      : friendship.requester_dog_id,
  );
  if (!friendIds.length) return [];
  const { data: dogs } = await supabase.from("dogs").select("*").in("id", friendIds);
  return Promise.all(
    (dogs ?? []).map(async (dog) => ({
      ...dog,
      photo_url: await resolveDogPhoto(dog.photo_path),
    })),
  );
}

export async function getDogFriendConnections(dogId: string) {
  const viewer = await requireViewer();
  if (viewer.isDemo) {
    return demoFriendships.flatMap((friendship) => {
      if (
        friendship.status !== "accepted" ||
        (friendship.requester_dog_id !== dogId &&
          friendship.recipient_dog_id !== dogId)
      ) {
        return [];
      }
      const friendId =
        friendship.requester_dog_id === dogId
          ? friendship.recipient_dog_id
          : friendship.requester_dog_id;
      const friend = demoDogs.find((dog) => dog.id === friendId);
      return friend ? [{ friendship, friend }] : [];
    });
  }

  const supabase = await createClient();
  const { data: friendships } = await supabase
    .from("dog_friendships")
    .select("*")
    .eq("status", "accepted")
    .or(`requester_dog_id.eq.${dogId},recipient_dog_id.eq.${dogId}`);
  if (!friendships?.length) return [];

  const friendIds = friendships.map((friendship) =>
    friendship.requester_dog_id === dogId
      ? friendship.recipient_dog_id
      : friendship.requester_dog_id,
  );
  const { data: dogs } = await supabase.from("dogs").select("*").in("id", friendIds);
  const dogMap = new Map<string, DogWithPhoto>();
  await Promise.all(
    (dogs ?? []).map(async (dog) => {
      dogMap.set(dog.id, { ...dog, photo_url: await resolveDogPhoto(dog.photo_path) });
    }),
  );
  return friendships.flatMap((friendship) => {
    const friendId =
      friendship.requester_dog_id === dogId
        ? friendship.recipient_dog_id
        : friendship.requester_dog_id;
    const friend = dogMap.get(friendId);
    return friend ? [{ friendship, friend }] : [];
  });
}
