"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { deleteTorneo, getTorneo, upsertTorneo } from "@/lib/data";
import { requireAuth } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import type {
    CategoriaTorneo,
    EstadoTorneo,
    TipoTorneo,
    Torneo,
} from "@/types";

const CATEGORIAS: CategoriaTorneo[] = ["Fut7", "Fut6", "Fut5", "Otro"];
const TIPOS: TipoTorneo[] = ["liga", "copa", "amistoso", "interno"];
const ESTADOS: EstadoTorneo[] = [
    "proximo",
    "en_curso",
    "finalizado",
    "cancelado",
];

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

function readCategoria(v: FormDataEntryValue | null): CategoriaTorneo | null {
    return typeof v === "string" && CATEGORIAS.includes(v as CategoriaTorneo)
        ? (v as CategoriaTorneo)
        : null;
}
function readTipo(v: FormDataEntryValue | null): TipoTorneo | null {
    return typeof v === "string" && TIPOS.includes(v as TipoTorneo)
        ? (v as TipoTorneo)
        : null;
}
function readEstado(v: FormDataEntryValue | null): EstadoTorneo | null {
    return typeof v === "string" && ESTADOS.includes(v as EstadoTorneo)
        ? (v as EstadoTorneo)
        : null;
}

function construirTorneo(formData: FormData, id: string): Torneo | null {
    const nombre = readStr(formData, "nombre");
    const temporada = readStr(formData, "temporada");
    const categoria = readCategoria(formData.get("categoria"));
    const tipo = readTipo(formData.get("tipo"));
    const estado = readEstado(formData.get("estado"));

    if (!nombre || !temporada || !categoria || !tipo || !estado) return null;

    const participantes = formData
        .getAll("participantes")
        .filter((v): v is string => typeof v === "string");

    return {
        id,
        nombre,
        temporada,
        categoria,
        tipo,
        estado,
        fechaInicio: readStr(formData, "fechaInicio"),
        fechaFin: readStr(formData, "fechaFin"),
        sede: readStr(formData, "sede"),
        organizador: readStr(formData, "organizador"),
        participantes,
        posicionFinal: readInt(formData.get("posicionFinal")),
        faseAlcanzada: readStr(formData, "faseAlcanzada"),
        resumen: readStr(formData, "resumen"),
    };
}

// -------- crearTorneo --------
export async function crearTorneo(formData: FormData) {
    await requireAuth();
    const id = generateId("t");
    const torneo = construirTorneo(formData, id);
    if (!torneo) redirect("/admin/torneos/nuevo?error=campos");

    await upsertTorneo(torneo);
    revalidatePath("/admin/torneos");
    redirect("/admin/torneos");
}

// -------- editarTorneo --------
export async function editarTorneo(formData: FormData) {
    await requireAuth();
    const id = readStr(formData, "id");
    if (!id) redirect("/admin/torneos");
    const actual = await getTorneo(id);
    if (!actual) redirect("/admin/torneos");

    const torneo = construirTorneo(formData, id);
    if (!torneo) redirect(`/admin/torneos/${id}/editar?error=campos`);

    await upsertTorneo(torneo);
    revalidatePath("/admin/torneos");
    revalidatePath(`/admin/torneos/${id}/editar`);
    redirect("/admin/torneos");
}

// -------- eliminarTorneo --------
export async function eliminarTorneo(formData: FormData) {
    await requireAuth();
    const id = readStr(formData, "id");
    if (!id) redirect("/admin/torneos");

    await deleteTorneo(id);
    revalidatePath("/admin/torneos");
    redirect("/admin/torneos");
}