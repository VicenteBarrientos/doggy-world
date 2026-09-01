import "server-only";

import { dogPhotoBucket } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function resolveDogPhoto(photoPath: string | null) {
  if (!photoPath) return null;
  if (/^https?:\/\//.test(photoPath)) return photoPath;
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(dogPhotoBucket)
    .createSignedUrl(photoPath, 60 * 60);

  if (error) return null;
  return data.signedUrl;
}
