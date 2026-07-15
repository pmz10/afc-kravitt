"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
    deletePartido,
    getPartido,
    upsertPartido,
} from "@/lib/data";
import { requireAuth } from "@/lib/auth";
import { generateId, localClubAIso } from "@/lib/utils";
import type {
    EventoPartido,
    Partido,
    ResultadoPartido,
    TipoEvento,
    TipoEventoPropio,
    TipoEventoRival,
} from "@/types";

const RESULTADOS: ResultadoPartido[] = [
    "ganado",
    "perdido",
    "empatado",
    "default-favor",
    "default-contra",
    "pendiente",
];

const TIPOS_PROPIOS: TipoEventoPropio[] = [
    "gol",
    "asistencia",
    "amarilla",
    "roja",
    "doble_amarilla",
    "autogol",
    "penal_anotado",
    "penal_fallado",
    "atajada",
    "falta",
    "lesion",
];

const TIPOS_RIVAL: TipoEventoRival[] = [
    "gol_rival",
    "asistencia_rival",
    "amarilla_rival",
    "roja_rival",
    "doble_amarilla_rival",
    "penal_anotado_rival",
    "penal_fallado_rival",
    "atajada_rival",
    "falta_rival",
];

const TIPOS_VALIDOS: TipoEvento[] = [...TIPOS_PROPIOS, ...TIPOS_RIVAL];

function readStr(formData: FormData, key: string): string | undefined {
    const v = formData.get(key);
    if (typeof v !== "string") return undefined;
    const trimmed = v.trim();
    return trimmed.length ? trimmed : undefined;
}

function readInt(value: FormDataEntryValue | null): number | undefined {
    if (typeof value !== "string" || value === "") return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
}

function readResultado(v: FormDataEntryValue | null): ResultadoPartido {
    if (typeof v === "string" && RESULTADOS.includes(v as ResultadoPartido)) {
        return v as ResultadoPartido;
    }
    return "pendiente";
}

// El form manda un único campo "eventosJson" (armado por <EventosEditor>)
// con un array de eventos sin límite de cantidad.
function parsearEventos(formData: FormData): EventoPartido[] {
    const raw = formData.get("eventosJson");
    if (typeof raw !== "string" || !raw.trim()) return [];

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return [];
    }
    if (!Array.isArray(parsed)) return [];

    const out: EventoPartido[] = [];
    for (const item of parsed) {
        if (!item || typeof item !== "object") continue;
        const { tipo, jugadorId, jugadorRivalId, minuto, notas } = item as Record<
            string,
            unknown
        >;
        if (typeof tipo !== "string" || !TIPOS_VALIDOS.includes(tipo as TipoEvento)) {
            continue;
        }

        const minutoNum =
            typeof minuto === "number" && Number.isFinite(minuto) ? minuto : undefined;
        const notasStr =
            typeof notas === "string" && notas.trim() ? notas.trim() : undefined;

        if (TIPOS_PROPIOS.includes(tipo as TipoEventoPropio)) {
            if (typeof jugadorId !== "string" || !jugadorId) continue;
            out.push({
                id: generateId("ev"),
                tipo: tipo as TipoEventoPropio,
                jugadorId,
                minuto: minutoNum,
                notas: notasStr,
            });
        } else if (TIPOS_RIVAL.includes(tipo as TipoEventoRival)) {
            out.push({
                id: generateId("ev"),
                tipo: tipo as TipoEventoRival,
                ...(typeof jugadorRivalId === "string" && jugadorRivalId
                    ? { jugadorRivalId }
                    : {}),
                minuto: minutoNum,
                notas: notasStr,
            });
        }
    }
    return out;
}

function construirPartido(formData: FormData, id: string): Partido | null {
    const torneoId = readStr(formData, "torneoId");
    const rivalId = readStr(formData, "rivalId");
    const fecha = readStr(formData, "fecha");
    if (!torneoId || !rivalId || !fecha) return null;

    const convocados = formData
        .getAll("convocados")
        .filter((v): v is string => typeof v === "string");

    const titularesForm = formData
        .getAll("titulares")
        .filter((v): v is string => typeof v === "string");
    const titulares = titularesForm.filter((id) => convocados.includes(id));

    const golesFavor = readInt(formData.get("golesFavor"));
    const golesContra = readInt(formData.get("golesContra"));
    const penalesFavor = readInt(formData.get("penalesFavor"));
    const penalesContra = readInt(formData.get("penalesContra"));
    const tienePenales =
        penalesFavor !== undefined && penalesContra !== undefined;

    return {
        id,
        torneoId,
        rivalId,
        jornada: readInt(formData.get("jornada")),
        fecha: localClubAIso(fecha),
        sede: readStr(formData, "sede"),
        esLocal: formData.get("esLocal") === "on",
        resultado: readResultado(formData.get("resultado")),
        golesFavor,
        golesContra,
        penales: tienePenales
            ? { favor: penalesFavor, contra: penalesContra }
            : undefined,
        convocados,
        titulares,
        eventos: parsearEventos(formData),
        notas: readStr(formData, "notas"),
        mvpId: readStr(formData, "mvpId"),
    };
}

// -------- crearPartido --------
export async function crearPartido(formData: FormData) {
    await requireAuth();
    const id = generateId("p");
    const partido = construirPartido(formData, id);
    if (!partido) redirect("/admin/partidos/nuevo?error=campos");

    await upsertPartido(partido);
    revalidatePath("/admin/partidos");
    redirect("/admin/partidos");
}

// -------- editarPartido --------
export async function editarPartido(formData: FormData) {
    await requireAuth();
    const id = readStr(formData, "id");
    if (!id) redirect("/admin/partidos");
    const actual = await getPartido(id);
    if (!actual) redirect("/admin/partidos");

    const partido = construirPartido(formData, id);
    if (!partido) redirect(`/admin/partidos/${id}/editar?error=campos`);

    await upsertPartido(partido);
    revalidatePath("/admin/partidos");
    revalidatePath(`/admin/partidos/${id}/editar`);
    redirect("/admin/partidos");
}

// -------- eliminarPartido --------
export async function eliminarPartido(formData: FormData) {
    await requireAuth();
    const id = readStr(formData, "id");
    if (!id) redirect("/admin/partidos");
    await deletePartido(id);
    revalidatePath("/admin/partidos");
    redirect("/admin/partidos");
}