"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTorneo, upsertJugador, upsertTorneo } from "@/lib/data";
import { requireAuth } from "@/lib/auth";
import { estaActivoEn, generateId, nowISO } from "@/lib/utils";
import type { Jugador, Posicion, Torneo } from "@/types";

const POSICIONES: Posicion[] = ["POR", "DEF", "MED", "DEL"];

function readStr(formData: FormData, key: string): string | undefined {
    const v = formData.get(key);
    if (typeof v !== "string") return undefined;
    const trimmed = v.trim();
    return trimmed.length ? trimmed : undefined;
}

function readInt(value: FormDataEntryValue | null, fallback = 0): number {
    if (typeof value !== "string" || value === "") return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function readPosicion(v: FormDataEntryValue | null): Posicion | null {
    return typeof v === "string" && POSICIONES.includes(v as Posicion)
        ? (v as Posicion)
        : null;
}

// -------- actualizarPlantilla --------
export async function actualizarPlantilla(formData: FormData) {
    await requireAuth();
    const torneoId = readStr(formData, "torneoId");
    if (!torneoId) redirect("/admin/plantillas");

    const torneo = await getTorneo(torneoId);
    if (!torneo) redirect("/admin/plantillas");

    const jugadoresIds = formData
        .getAll("jugadoresIds")
        .filter((v): v is string => typeof v === "string");
    const participantes = formData
        .getAll("participantes")
        .filter((v): v is string => typeof v === "string");

    const dorsalesPorJugador: Record<string, number> = {};
    for (const jid of jugadoresIds) {
        const raw = formData.get(`dorsal_${jid}`);
        if (typeof raw === "string" && raw.trim() !== "") {
            const n = Number(raw);
            if (Number.isFinite(n) && n >= 0) dorsalesPorJugador[jid] = n;
        }
    }

    const actualizado: Torneo = {
        ...torneo,
        jugadoresIds,
        dorsalesPorJugador,
        participantes,
    };

    await upsertTorneo(actualizado);
    revalidatePath(`/admin/plantillas/${torneoId}`);
    revalidatePath("/admin/plantillas");
    revalidatePath("/admin");
    revalidatePath("/admin/rivales");
    redirect(`/admin/plantillas/${torneoId}?ok=1`);
}

// -------- crearJugadorEnPlantilla --------
export async function crearJugadorEnPlantilla(formData: FormData) {
    await requireAuth();
    const torneoId = readStr(formData, "torneoId");
    if (!torneoId) redirect("/admin/plantillas");

    const torneo = await getTorneo(torneoId);
    if (!torneo) redirect("/admin/plantillas");

    const nombre = readStr(formData, "nombreNuevo");
    const apellido = readStr(formData, "apellidoNuevo");
    const dorsal = readInt(formData.get("dorsalNuevo"), -1);
    const posicion = readPosicion(formData.get("posicionNuevo"));

    if (!nombre || !apellido || dorsal < 0 || !posicion) {
        redirect(`/admin/plantillas/${torneoId}?error=campos_jugador`);
    }

    const id = generateId("j");
    const jugador: Jugador = {
        id,
        nombre,
        apellido,
        dorsal,
        posicion,
        historial: [{ id: generateId("per"), desde: nowISO() }],
        activo: true,
    };
    jugador.activo = estaActivoEn(jugador, nowISO());

    await upsertJugador(jugador);

    const actualizado: Torneo = {
        ...torneo,
        jugadoresIds: [...torneo.jugadoresIds, id],
        dorsalesPorJugador: { ...torneo.dorsalesPorJugador, [id]: dorsal },
    };
    await upsertTorneo(actualizado);

    revalidatePath(`/admin/plantillas/${torneoId}`);
    revalidatePath("/admin/jugadores");
    revalidatePath("/admin");
    redirect(`/admin/plantillas/${torneoId}?ok=1`);
}
