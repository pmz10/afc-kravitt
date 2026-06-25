import { createHash, randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";

export type PlayerInviteMode = "create" | "edit";

export type PlayerInvite = {
  id: string;
  mode: PlayerInviteMode;
  jugadorId?: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  revokedAt?: string;
  createdAt: string;
  lastUsedAt?: string;
  requiresApproval: boolean;
  token?: string;
};

export type PlayerInviteSubmissionStatus =
  | "pending"
  | "processing"
  | "approved"
  | "rejected";

export type PlayerInviteSubmission = {
  id: string;
  inviteId: string;
  mode: PlayerInviteMode;
  jugadorId?: string;
  payload: Record<string, unknown>;
  status: PlayerInviteSubmissionStatus;
  submittedAt: string;
  reviewedAt?: string;
  resultJugadorId?: string;
  errorMessage?: string;
};

export type PublicPlayerInvite = {
  valid: boolean;
  mode?: PlayerInviteMode;
  remainingUses?: number;
  expiresAt?: string;
  jugador?: {
    id: string;
    nombre: string;
    apellido: string;
    apodo?: string;
    dorsal: number;
    posicion: "POR" | "DEF" | "MED" | "DEL";
    posicionesSecundarias?: ("POR" | "DEF" | "MED" | "DEL")[];
    pieDominante?: "izq" | "der" | "ambos";
    bio?: string;
    fechaNacimiento?: string;
    capitan?: boolean;
    email?: string;
  };
};

type InviteRow = {
  id: string;
  mode: PlayerInviteMode;
  jugador_id: string | null;
  max_uses: number;
  used_count: number;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
  last_used_at: string | null;
  requires_approval: boolean;
  token_value: string | null;
};

type SubmissionRow = {
  id: string;
  invite_id: string;
  mode: PlayerInviteMode;
  jugador_id: string | null;
  payload: Record<string, unknown>;
  status: PlayerInviteSubmissionStatus;
  submitted_at: string;
  reviewed_at: string | null;
  result_jugador_id: string | null;
  error_message: string | null;
};

function mapInvite(row: InviteRow): PlayerInvite {
  return {
    id: row.id,
    mode: row.mode,
    jugadorId: row.jugador_id ?? undefined,
    maxUses: row.max_uses,
    usedCount: row.used_count,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at ?? undefined,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at ?? undefined,
    requiresApproval: row.requires_approval,
    token: row.token_value ?? undefined,
  };
}

function mapSubmission(row: SubmissionRow): PlayerInviteSubmission {
  return {
    id: row.id,
    inviteId: row.invite_id,
    mode: row.mode,
    jugadorId: row.jugador_id ?? undefined,
    payload: row.payload,
    status: row.status,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at ?? undefined,
    resultJugadorId: row.result_jugador_id ?? undefined,
    errorMessage: row.error_message ?? undefined,
  };
}

export async function createPlayerInvite(input: {
  mode: PlayerInviteMode;
  jugadorId?: string;
  maxUses: number;
  expiresInDays: number;
  requiresApproval: boolean;
}): Promise<{ token: string; invite: PlayerInvite }> {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(
    Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000,
  ).toISOString();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_invite_links")
    .insert({
      token_hash: tokenHash,
      mode: input.mode,
      jugador_id: input.mode === "edit" ? input.jugadorId : null,
      max_uses: input.mode === "create" ? 1 : input.maxUses,
      expires_at: expiresAt,
      requires_approval: input.requiresApproval,
      token_value: token,
    })
    .select(
      "id, mode, jugador_id, max_uses, used_count, expires_at, revoked_at, created_at, last_used_at, requires_approval, token_value",
    )
    .single();

  if (error) throw new Error(`Supabase (crear enlace): ${error.message}`);
  return { token, invite: mapInvite(data as InviteRow) };
}

export async function listPlayerInvites(): Promise<PlayerInvite[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_invite_links")
    .select(
      "id, mode, jugador_id, max_uses, used_count, expires_at, revoked_at, created_at, last_used_at, requires_approval, token_value",
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Supabase (leer enlaces): ${error.message}`);
  return (data as InviteRow[]).map(mapInvite);
}

export async function revokePlayerInvite(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("player_invite_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`Supabase (revocar enlace): ${error.message}`);
}

export async function deletePlayerInvite(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: invite, error: inviteError } = await supabase
    .from("player_invite_links")
    .select("used_count, max_uses")
    .eq("id", id)
    .single();
  if (inviteError) {
    throw new Error(`Supabase (leer enlace): ${inviteError.message}`);
  }
  if (invite.used_count < invite.max_uses) {
    throw new Error("Solo se pueden eliminar enlaces ya consumidos");
  }

  const { count, error: pendingError } = await supabase
    .from("player_invite_submissions")
    .select("id", { count: "exact", head: true })
    .eq("invite_id", id)
    .in("status", ["pending", "processing"]);
  if (pendingError) {
    throw new Error(`Supabase (revisar solicitudes): ${pendingError.message}`);
  }
  if ((count ?? 0) > 0) {
    throw new Error(
      "No se puede eliminar un enlace con solicitudes pendientes",
    );
  }

  const { error } = await supabase
    .from("player_invite_links")
    .delete()
    .eq("id", id);
  if (error) throw new Error(`Supabase (eliminar enlace): ${error.message}`);
}

export async function getPublicPlayerInvite(
  token: string,
): Promise<PublicPlayerInvite> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_player_invite", {
    p_token: token,
  });
  if (error) return { valid: false };
  return data as PublicPlayerInvite;
}

export async function submitPublicPlayerInvite(
  token: string,
  payload: Record<string, unknown>,
): Promise<{
  jugadorId?: string;
  remainingUses: number;
  pendingApproval: boolean;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_player_invite", {
    p_token: token,
    p_data: payload,
  });
  if (error) throw new Error(error.message);
  return {
    jugadorId: data.jugadorId as string | undefined,
    remainingUses: data.remainingUses as number,
    pendingApproval: data.pendingApproval === true,
  };
}

export async function listPlayerInviteSubmissions(): Promise<
  PlayerInviteSubmission[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_invite_submissions")
    .select(
      "id, invite_id, mode, jugador_id, payload, status, submitted_at, reviewed_at, result_jugador_id, error_message",
    )
    .order("submitted_at", { ascending: false });
  if (error) throw new Error(`Supabase (leer solicitudes): ${error.message}`);
  return (data as SubmissionRow[]).map(mapSubmission);
}

export async function claimPlayerInviteSubmission(
  id: string,
): Promise<PlayerInviteSubmission> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_invite_submissions")
    .update({ status: "processing", error_message: null })
    .eq("id", id)
    .eq("status", "pending")
    .select(
      "id, invite_id, mode, jugador_id, payload, status, submitted_at, reviewed_at, result_jugador_id, error_message",
    )
    .single();
  if (error) {
    throw new Error(
      "La solicitud ya fue procesada o está siendo revisada por otro administrador",
    );
  }
  return mapSubmission(data as SubmissionRow);
}

export async function completePlayerInviteSubmission(
  id: string,
  resultJugadorId: string,
): Promise<void> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const { error } = await supabase
    .from("player_invite_submissions")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: claims?.claims?.sub ?? null,
      result_jugador_id: resultJugadorId,
      error_message: null,
    })
    .eq("id", id)
    .eq("status", "processing");
  if (error) throw new Error(`Supabase (aprobar solicitud): ${error.message}`);
}

export async function releasePlayerInviteSubmission(
  id: string,
  message: string,
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("player_invite_submissions")
    .update({
      status: "pending",
      error_message: message.slice(0, 500),
    })
    .eq("id", id)
    .eq("status", "processing");
}

export async function rejectPlayerInviteSubmission(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const { error } = await supabase
    .from("player_invite_submissions")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: claims?.claims?.sub ?? null,
    })
    .eq("id", id)
    .eq("status", "pending");
  if (error) throw new Error(`Supabase (rechazar solicitud): ${error.message}`);
}
