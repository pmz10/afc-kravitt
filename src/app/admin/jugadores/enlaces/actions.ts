"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import {
  claimPlayerInviteSubmission,
  completePlayerInviteSubmission,
  createPlayerInvite,
  deletePlayerInvite,
  PLAYER_INVITE_SECTIONS,
  rejectPlayerInviteSubmission,
  releasePlayerInviteSubmission,
  revokePlayerInvite,
  type PlayerInviteSection,
} from "@/lib/player-invites";
import { getJugador, upsertJugador } from "@/lib/data";
import { estaActivoEn, generateId, nowISO } from "@/lib/utils";
import type {
  Jugador,
  PieDominante,
  Posicion,
} from "@/types";

const POSICIONES: Posicion[] = ["POR", "DEF", "MED", "DEL"];
const PLAYER_INVITE_SECTION_SET = new Set<PlayerInviteSection>(
  PLAYER_INVITE_SECTIONS,
);

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
  const allowedSections = formData
    .getAll("allowedSections")
    .filter(
      (section): section is PlayerInviteSection =>
        typeof section === "string" &&
        PLAYER_INVITE_SECTION_SET.has(section as PlayerInviteSection),
    );

  if (mode === "edit") {
    if (!jugadorId || !(await getJugador(jugadorId))) {
      redirect("/admin/jugadores/enlaces?error=jugador");
    }
    if (!allowedSections.length) {
      redirect("/admin/jugadores/enlaces?error=sections");
    }
  }

  const { token } = await createPlayerInvite({
    mode,
    jugadorId,
    maxUses,
    expiresInDays,
    requiresApproval,
    allowedSections:
      mode === "edit" ? allowedSections : [...PLAYER_INVITE_SECTIONS],
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

function payloadHas(payload: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(payload, key);
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
  const nombre = payloadHas(payload, "nombre")
    ? payloadString(payload, "nombre")
    : current?.nombre;
  const apellido = payloadHas(payload, "apellido")
    ? payloadString(payload, "apellido")
    : current?.apellido;
  const posicion = payloadHas(payload, "posicion")
    ? payloadPosition(payload, "posicion")
    : current?.posicion;
  const dorsal = payloadHas(payload, "dorsal")
    ? Number(payloadString(payload, "dorsal"))
    : current?.dorsal;

  if (
    !nombre ||
    !apellido ||
    !posicion ||
    !Number.isInteger(dorsal ?? Number.NaN) ||
    (dorsal ?? -1) < 0 ||
    (dorsal ?? 100) > 99
  ) {
    throw new Error("La solicitud contiene campos obligatorios inválidos");
  }

  const positionsRaw = payload.posicionesSecundarias;
  const posicionesSecundarias = payloadHas(payload, "posicionesSecundarias")
    ? Array.isArray(positionsRaw)
      ? positionsRaw.filter(
          (value): value is Posicion =>
            typeof value === "string" && POSICIONES.includes(value as Posicion),
        )
      : []
    : (current?.posicionesSecundarias ?? []);

  if (current) {
    const player: Jugador = {
      ...current,
      nombre,
      apellido,
      apodo: payloadHas(payload, "apodo")
        ? payloadString(payload, "apodo")
        : current.apodo,
      dorsal: dorsal!,
      posicion,
      posicionesSecundarias: posicionesSecundarias.length
        ? posicionesSecundarias
        : undefined,
      pieDominante: payloadHas(payload, "pieDominante")
        ? payloadFoot(payload)
        : current.pieDominante,
      bio: payloadHas(payload, "bio")
        ? payloadString(payload, "bio")
        : current.bio,
      fechaNacimiento: payloadHas(payload, "fechaNacimiento")
        ? payloadString(payload, "fechaNacimiento")
        : current.fechaNacimiento,
      email: payloadHas(payload, "email")
        ? payloadString(payload, "email")
        : current.email,
      capitan: payloadHas(payload, "capitan")
        ? payloadBoolean(payload, "capitan")
        : current.capitan,
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
    dorsal: dorsal!,
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

function editedPayloadString(
  formData: FormData,
  payload: Record<string, unknown>,
  key: string,
) {
  if (!formData.has(key)) return;
  const value = formData.get(key);
  payload[key] = typeof value === "string" ? value.trim() : "";
}

function buildEditedPayloadFromFormData(
  formData: FormData,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  [
    "nombre",
    "apellido",
    "apodo",
    "dorsal",
    "posicion",
    "fechaNacimiento",
    "email",
    "bio",
    "desde",
    "notasPeriodo",
  ].forEach((key) => editedPayloadString(formData, payload, key));

  if (formData.get("posicionesSecundariasPresent") === "1") {
    payload.posicionesSecundarias = formData
      .getAll("posicionesSecundarias")
      .filter((value): value is string => typeof value === "string");
  }

  if (formData.get("pieDominantePresent") === "1") {
    const value = formData.get("pieDominante");
    payload.pieDominante = typeof value === "string" ? value : "";
  }

  if (formData.get("capitanPresent") === "1") {
    payload.capitan = formData.get("capitan") === "on";
  }

  return payload;
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

    const payload =
      formData.get("payloadEditor") === "1"
        ? buildEditedPayloadFromFormData(formData)
        : submission.payload;
    const player = buildPlayerFromSubmission(payload, current ?? undefined);
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

export async function eliminarEnlaceJugador(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/jugadores/enlaces");

  try {
    await deletePlayerInvite(id);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo eliminar el enlace";
    redirect(
      `/admin/jugadores/enlaces?deleteError=${encodeURIComponent(message)}`,
    );
  }

  revalidatePath("/admin/jugadores/enlaces");
  redirect("/admin/jugadores/enlaces?deleted=1");
}
