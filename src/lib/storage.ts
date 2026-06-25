import { createClient } from "@/lib/supabase/server";

const BUCKET = "media";

export async function uploadPublicImage(
  file: File,
  folder: "jugadores" | "rivales",
  entityId: string,
): Promise<string> {
  const extension =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const objectPath = `${folder}/${entityId}-${Date.now()}.${extension}`;
  const supabase = await createClient();
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(`Supabase Storage: ${error.message}`);

  return supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;
}

export async function deletePublicImage(url: string | undefined): Promise<void> {
  if (!url) return;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex < 0) return;

  const objectPath = decodeURIComponent(url.slice(markerIndex + marker.length));
  const supabase = await createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([objectPath]);
  if (error) throw new Error(`Supabase Storage: ${error.message}`);
}
