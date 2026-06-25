"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import {
  claimPlayerInviteSubmission,
  completePlayerInviteSubmission,
  createPlayerInvite,
  rejectPlayerInviteSubmission,
  releasePlayerInviteSubmission,
  revokePlayerInvite,
} from "@/lib/player-invites";
import { getJugador, upsertJugador } from "@/lib/data";
import { estaActivoEn, generateId, nowISO } from "@/lib/utils";
import type {
  Jugador,
  PieDominante,
  Posicion,
} from "@/types";

const POSICIONES: Posicion[] = ["POR", "DEF", "MED", "DEL"];

function readInt(value: FormDataEntryValue | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : fallback;
}

export async function crearEnlaceJugador(formData: FormData) {
  await requireAuth();

  const mode = formData.get("mode") === "edit" ? "edit" : "create";
  const jugadorId =
    typeof formData.get("jugadorId") === "string"
      ? String(formData.get("jugadorId"))
      : undefined;
  const expiresInDays = Math.min(
    90,
    Math.max(1, readInt(formData.get("expiresInDays"), 7)),
  );
  const maxUses =
    mode === "create"
      ? 1
      : Math.min(100, Math.max(1, readInt(formData.get("maxUses"), 1)));
  const requiresApproval = formData.get("requiresApproval") === "on";

  if (mode === "edit") {
    if (!jugadorId || !(await getJugador(jugadorId))) {
      redirect("/admin/jugadores/enlaces?error=jugador");
    }
  }

  const { token } = await createPlayerInvite({
    mode,
    jugadorId,
    maxUses,
    expiresInDays,
    requiresApproval,
  });

  revalidatePath("/admin/jugadores/enlaces");
  redirect(
    `/admin/jugadores/enlaces?created=${encodeURIComponent(token)}`,
  );
}

function payloadString(
  payload: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = payload[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function payloadBoolean(
  payload: Record<string, unknown>,
  key: string,
): boolean {
  return payload[key] === true;
}

function payloadPosition(
  payload: Record<string, unknown>,
  key: string,
): Posicion | undefined {
  const value = payloadString(payload, key);
  return POSICIONES.includes(value as Posicion)
    ? (value as Posicion)
    : undefined;
}

function payloadFoot(
  payload: Record<string, unknown>,
): PieDominante | undefined {
  const value = payloadString(payload, "pieDominante");
  return value === "izq" || value === "der" || value === "ambos"
    ? value
    : undefined;
}

function buildPlayerFromSubmission(
  payload: Record<string, unknown>,
  current?: Jugador,
): Jugador {
  const nombre = payloadString(payload, "nombre");
  const apellido = payloadString(payload, "apellido");
  const posicion = payloadPosition(payload, "posicion");
  const dorsal = Number(payloadString(payload, "dorsal"));

  if (
    !nombre ||
    !apellido ||
    !posicion ||
    !Number.isInteger(dorsal) ||
    dorsal < 0 ||
    dorsal > 99
  ) {
    throw new Error("La solicitud contiene campos obligatorios inválidos");
  }

  const positionsRaw = payload.posicionesSecundarias;
  const posicionesSecundarias = Array.isArray(positionsRaw)
    ? positionsRaw.filter(
        (value): value is Posicion =>
          typeof value === "string" && POSICIONES.includes(value as Posicion),
      )
    : [];

  if (current) {
    const player: Jugador = {
      ...current,
      nombre,
      apellido,
      apodo: payloadString(payload, "apodo"),
      dorsal,
      posicion,
      posicionesSecundarias: posicionesSecundarias.length
        ? posicionesSecundarias
        : undefined,
      pieDominante: payloadFoot(payload),
      bio: payloadString(payload, "bio"),
      fechaNacimiento: payloadString(payload, "fechaNacimiento"),
      email: payloadString(payload, "email"),
      capitan: payloadBoolean(payload, "capitan"),
    };
    player.activo = estaActivoEn(player, nowISO());
    return player;
  }

  const desde = payloadString(payload, "desde");
  if (!desde || Number.isNaN(new Date(desde).getTime())) {
    throw new Error("La fecha de ingreso no es válida");
  }

  const player: Jugador = {
    id: generateId("j"),
    nombre,
    apellido,
    apodo: payloadString(payload, "apodo"),
    dorsal,
    posicion,
    posicionesSecundarias: posicionesSecundarias.length
      ? posicionesSecundarias
      : undefined,
    pieDominante: payloadFoot(payload),
    bio: payloadString(payload, "bio"),
    fechaNacimiento: payloadString(payload, "fechaNacimiento"),
    email: payloadString(payload, "email"),
    capitan: payloadBoolean(payload, "capitan"),
    historial: [
      {
        id: generateId("per"),
        desde,
        notas: payloadString(payload, "notasPeriodo"),
      },
    ],
    activo: false,
    carryOver: undefined,
  };
  player.activo = estaActivoEn(player, nowISO());
  return player;
}

export async function aprobarSolicitudJugador(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/jugadores/enlaces");

  const submission = await claimPlayerInviteSubmission(id);
  try {
    const current = submission.jugadorId
      ? await getJugador(submission.jugadorId)
      : null;
    if (submission.mode === "edit" && !current) {
      throw new Error("El jugador que se quería editar ya no existe");
    }

    const player = buildPlayerFromSubmission(
      submission.payload,
      current ?? undefined,
    );
    await upsertJugador(player);
    await completePlayerInviteSubmission(submission.id, player.id);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo aplicar la solicitud";
    await releasePlayerInviteSubmission(submission.id, message);
    redirect(
      `/admin/jugadores/enlaces?approvalError=${encodeURIComponent(message)}`,
    );
  }

  revalidatePath("/admin/jugadores");
  revalidatePath("/admin/jugadores/enlaces");
  redirect("/admin/jugadores/enlaces?approved=1");
}

export async function rechazarSolicitudJugador(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (id) await rejectPlayerInviteSubmission(id);
  revalidatePath("/admin/jugadores/enlaces");
  redirect("/admin/jugadores/enlaces?rejected=1");
}

export async function revocarEnlaceJugador(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (id) await revokePlayerInvite(id);
  revalidatePath("/admin/jugadores/enlaces");
  redirect("/admin/jugadores/enlaces");
}
