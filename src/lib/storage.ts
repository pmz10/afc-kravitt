import { createClient } from "@/lib/supabase/server";

const PUBLIC_IMAGE_BUCKETS = {
  jugadores: "jugadores",
  equipos: "equipos",
} as const;

const DELETABLE_IMAGE_BUCKETS = [...Object.values(PUBLIC_IMAGE_BUCKETS), "media"];

type PublicImageBucket = keyof typeof PUBLIC_IMAGE_BUCKETS;

export async function uploadPublicImage(
  file: File,
  bucket: PublicImageBucket,
  entityId: string,
): Promise<string> {
  const extension =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const bucketName = PUBLIC_IMAGE_BUCKETS[bucket];
  const objectPath = `${entityId}/${Date.now()}.${extension}`;
  const supabase = await createClient();
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(bucketName).upload(objectPath, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(`Supabase Storage: ${error.message}`);

  return supabase.storage.from(bucketName).getPublicUrl(objectPath).data.publicUrl;
}

export async function deletePublicImage(url: string | undefined): Promise<void> {
  if (!url) return;
  const bucketName = DELETABLE_IMAGE_BUCKETS.find((name) =>
    url.includes(`/storage/v1/object/public/${name}/`),
  );
  if (!bucketName) return;

  const marker = `/storage/v1/object/public/${bucketName}/`;
  const objectPath = decodeURIComponent(url.slice(url.indexOf(marker) + marker.length));
  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucketName).remove([objectPath]);
  if (error) throw new Error(`Supabase Storage: ${error.message}`);
}
