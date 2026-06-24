"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
    deletePartido,
    getPartido,
    upsertPartido,
} from "@/lib/data";
import { requireAuth } from "@/lib/auth";
import { generateId } from "@/lib/utils";
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
    "autogol",
    "penal_anotado",
    "penal_fallado",
];

const TIPOS_RIVAL: TipoEventoRival[] = [
    "gol_rival",
    "asistencia_rival",
    "amarilla_rival",
    "roja_rival",
    "penal_anotado_rival",
    "penal_fallado_rival",
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

// Lee hasta MAX_EVENTOS filas del form (evento_0_*, evento_1_*, ...).
// Una fila vacía (sin jugador seleccionado) se descarta.
const MAX_EVENTOS = 20;

function parsearEventos(formData: FormData): EventoPartido[] {
    const out: EventoPartido[] = [];
    for (let i = 0; i < MAX_EVENTOS; i++) {
        const tipoRaw = formData.get(`evento_${i}_tipo`);
        const jugadorRaw = formData.get(`evento_${i}_jugador`);
        if (typeof tipoRaw !== "string" || typeof jugadorRaw !== "string") continue;
        if (!tipoRaw || !jugadorRaw) continue;

        const tipo = TIPOS_VALIDOS.includes(tipoRaw as TipoEvento)
            ? (tipoRaw as TipoEvento)
            : null;
        if (!tipo) continue;

        // El select usa prefijos "prop:" o "riv:" para distinguir
        const [prefix, id] = jugadorRaw.split(":");
        if (!id) continue;

        const minuto = readInt(formData.get(`evento_${i}_minuto`));
        const notas = readStr(formData, `evento_${i}_notas`);

        if (TIPOS_PROPIOS.includes(tipo as TipoEventoPropio) && prefix === "prop") {
            out.push({
                id: generateId("ev"),
                tipo: tipo as TipoEventoPropio,
                jugadorId: id,
                minuto,
                notas,
            });
        } else if (
            TIPOS_RIVAL.includes(tipo as TipoEventoRival) &&
            prefix === "riv"
        ) {
            out.push({
                id: generateId("ev"),
                tipo: tipo as TipoEventoRival,
                jugadorRivalId: id,
                minuto,
                notas,
            });
        }
        // Si el prefijo y el tipo no concuerdan (ej. tipo propio con jugador rival),
        // ignoramos esa fila silenciosamente.
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
        fecha,
        sede: readStr(formData, "sede"),
        esLocal: formData.get("esLocal") === "on",
        resultado: readResultado(formData.get("resultado")),
        golesFavor,
        golesContra,
        penales: tienePenales
            ? { favor: penalesFavor, contra: penalesContra }
            : undefined,
        convocados,
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