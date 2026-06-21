"use server";

import { promises as fs } from "fs";
import path from "path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
    deleteJugador,
    getJugador,
    upsertJugador,
} from "@/lib/data";
import { requireAuth } from "@/lib/auth";
import { generateId, estaActivoEn, nowISO } from "@/lib/utils";
import type {
    Jugador,
    PeriodoEnClub,
    PieDominante,
    Posicion,
    StatsCarryOver,
} from "@/types";

const MAX_FOTO_BYTES = 2 * 1024 * 1024;
const TIPOS_FOTO_VALIDOS = ["image/jpeg", "image/png", "image/webp"];
const POSICIONES: Posicion[] = ["POR", "DEF", "MED", "DEL"];

// -------- Helpers --------
function readPosicion(value: FormDataEntryValue | null): Posicion | null {
    if (typeof value !== "string") return null;
    return POSICIONES.includes(value as Posicion) ? (value as Posicion) : null;
}
function readPie(value: FormDataEntryValue | null): PieDominante | undefined {
    if (typeof value !== "string") return undefined;
    if (value === "izq" || value === "der" || value === "ambos") return value;
    return undefined;
}
function readInt(value: FormDataEntryValue | null, fallback = 0): number {
    const n = typeof value === "string" ? Number(value) : NaN;
    return Number.isFinite(n) ? n : fallback;
}
function readStr(formData: FormData, key: string): string | undefined {
    const v = formData.get(key);
    if (typeof v !== "string") return undefined;
    const trimmed = v.trim();
    return trimmed.length ? trimmed : undefined;
}

async function guardarFoto(file: File, jugadorId: string): Promise<string> {
    const ext =
        file.type === "image/png"
            ? "png"
            : file.type === "image/webp"
                ? "webp"
                : "jpg";
    const filename = `${jugadorId}-${Date.now()}.${ext}`;
    const dir = path.join(process.cwd(), "public", "jugadores");
    await fs.mkdir(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(dir, filename), buffer);
    return `/jugadores/${filename}`;
}

async function borrarArchivoFoto(fotoPath: string | undefined) {
    if (!fotoPath || !fotoPath.startsWith("/jugadores/")) return;
    const fullPath = path.join(process.cwd(), "public", fotoPath);
    try {
        await fs.unlink(fullPath);
    } catch {
        // si no existe el archivo, no pasa nada
    }
}

// -------- crearJugador --------
export async function crearJugador(formData: FormData) {
    await requireAuth();

    const nombre = readStr(formData, "nombre");
    const apellido = readStr(formData, "apellido");
    const dorsal = readInt(formData.get("dorsal"), -1);
    const posicion = readPosicion(formData.get("posicion"));
    const desde = readStr(formData, "desde");

    if (!nombre || !apellido || dorsal < 0 || !posicion || !desde) {
        redirect("/admin/jugadores/nuevo?error=campos");
    }

    const fotoFile = formData.get("foto");
    let fotoPath: string | undefined;
    if (fotoFile instanceof File && fotoFile.size > 0) {
        if (fotoFile.size > MAX_FOTO_BYTES)
            redirect("/admin/jugadores/nuevo?error=foto_grande");
        if (!TIPOS_FOTO_VALIDOS.includes(fotoFile.type))
            redirect("/admin/jugadores/nuevo?error=foto_tipo");
    }

    const apodo = readStr(formData, "apodo");
    const fechaNacimiento = readStr(formData, "fechaNacimiento");
    const bio = readStr(formData, "bio");
    const email = readStr(formData, "email");
    const capitan = formData.get("capitan") === "on";
    const esLeyenda = formData.get("esLeyenda") === "on";
    const pieDominante = readPie(formData.get("pieDominante"));
    const notasPeriodo = readStr(formData, "notasPeriodo");

    const posicionesSecundarias = formData
        .getAll("posicionesSecundarias")
        .map((v) => readPosicion(v))
        .filter((p): p is Posicion => p !== null);

    const carryOver: StatsCarryOver = {
        partidosJugados: readInt(formData.get("co_pj")),
        goles: readInt(formData.get("co_goles")),
        asistencias: readInt(formData.get("co_asistencias")),
        amarillas: readInt(formData.get("co_amarillas")),
        rojas: readInt(formData.get("co_rojas")),
    };
    const tieneCarry = Object.values(carryOver).some((v) => v > 0);

    const id = generateId("j");
    if (fotoFile instanceof File && fotoFile.size > 0) {
        fotoPath = await guardarFoto(fotoFile, id);
    }

    const jugador: Jugador = {
        id,
        nombre,
        apellido,
        apodo,
        dorsal,
        posicion,
        posicionesSecundarias: posicionesSecundarias.length
            ? posicionesSecundarias
            : undefined,
        pieDominante,
        foto: fotoPath,
        bio,
        fechaNacimiento,
        capitan,
        historial: [{ id: generateId("per"), desde, notas: notasPeriodo }],
        activo: false,
        carryOver: tieneCarry ? carryOver : undefined,
        esLeyenda: esLeyenda || undefined,
        email,
    };

    jugador.activo = estaActivoEn(jugador, nowISO());

    await upsertJugador(jugador);
    revalidatePath("/admin/jugadores");
    redirect("/admin/jugadores");
}

// -------- editarJugador --------
export async function editarJugador(formData: FormData) {
    await requireAuth();

    const id = readStr(formData, "id");
    if (!id) redirect("/admin/jugadores");
    const actual = await getJugador(id);
    if (!actual) redirect("/admin/jugadores");

    const nombre = readStr(formData, "nombre");
    const apellido = readStr(formData, "apellido");
    const dorsal = readInt(formData.get("dorsal"), -1);
    const posicion = readPosicion(formData.get("posicion"));

    if (!nombre || !apellido || dorsal < 0 || !posicion) {
        redirect(`/admin/jugadores/${id}/editar?error=campos`);
    }

    // Foto: 3 modos
    // (a) suben nueva → reemplaza y borra la vieja
    // (b) marcan "eliminar" → quita la vieja sin reemplazo
    // (c) ninguna → mantiene la actual
    const eliminarFoto = formData.get("eliminarFoto") === "on";
    const fotoFile = formData.get("foto");
    let fotoPath: string | undefined = actual.foto;

    if (fotoFile instanceof File && fotoFile.size > 0) {
        if (fotoFile.size > MAX_FOTO_BYTES)
            redirect(`/admin/jugadores/${id}/editar?error=foto_grande`);
        if (!TIPOS_FOTO_VALIDOS.includes(fotoFile.type))
            redirect(`/admin/jugadores/${id}/editar?error=foto_tipo`);
        await borrarArchivoFoto(actual.foto);
        fotoPath = await guardarFoto(fotoFile, id);
    } else if (eliminarFoto) {
        await borrarArchivoFoto(actual.foto);
        fotoPath = undefined;
    }

    const apodo = readStr(formData, "apodo");
    const fechaNacimiento = readStr(formData, "fechaNacimiento");
    const bio = readStr(formData, "bio");
    const email = readStr(formData, "email");
    const capitan = formData.get("capitan") === "on";
    const esLeyenda = formData.get("esLeyenda") === "on";
    const pieDominante = readPie(formData.get("pieDominante"));

    const posicionesSecundarias = formData
        .getAll("posicionesSecundarias")
        .map((v) => readPosicion(v))
        .filter((p): p is Posicion => p !== null);

    const carryOver: StatsCarryOver = {
        partidosJugados: readInt(formData.get("co_pj")),
        goles: readInt(formData.get("co_goles")),
        asistencias: readInt(formData.get("co_asistencias")),
        amarillas: readInt(formData.get("co_amarillas")),
        rojas: readInt(formData.get("co_rojas")),
    };
    const tieneCarry = Object.values(carryOver).some((v) => v > 0);

    const jugador: Jugador = {
        ...actual,
        nombre,
        apellido,
        apodo,
        dorsal,
        posicion,
        posicionesSecundarias: posicionesSecundarias.length
            ? posicionesSecundarias
            : undefined,
        pieDominante,
        foto: fotoPath,
        bio,
        fechaNacimiento,
        email,
        capitan,
        esLeyenda: esLeyenda || undefined,
        carryOver: tieneCarry ? carryOver : undefined,
    };

    jugador.activo = estaActivoEn(jugador, nowISO());

    await upsertJugador(jugador);
    revalidatePath("/admin/jugadores");
    revalidatePath(`/admin/jugadores/${id}/editar`);
    redirect("/admin/jugadores");
}

// -------- darDeBaja: cierra el periodo vigente --------
export async function darDeBaja(formData: FormData) {
    await requireAuth();

    const id = readStr(formData, "id");
    const hasta = readStr(formData, "hasta");
    const motivoBaja = readStr(formData, "motivoBaja");
    if (!id || !hasta) redirect("/admin/jugadores");

    const jugador = await getJugador(id);
    if (!jugador) redirect("/admin/jugadores");

    // Encuentra el periodo vigente (sin hasta o con hasta a futuro)
    const idxVigente = jugador.historial.findIndex(
        (p) => !p.hasta || new Date(p.hasta).getTime() > new Date(hasta).getTime(),
    );
    if (idxVigente < 0) redirect(`/admin/jugadores/${id}/editar`);

    jugador.historial[idxVigente] = {
        ...jugador.historial[idxVigente],
        hasta,
        motivoBaja,
    };
    jugador.activo = estaActivoEn(jugador, nowISO());

    await upsertJugador(jugador);
    revalidatePath("/admin/jugadores");
    revalidatePath(`/admin/jugadores/${id}/editar`);
    redirect(`/admin/jugadores/${id}/editar`);
}

// -------- marcarRegreso: abre un periodo nuevo --------
export async function marcarRegreso(formData: FormData) {
    await requireAuth();

    const id = readStr(formData, "id");
    const desde = readStr(formData, "desde");
    const notas = readStr(formData, "notas");
    if (!id || !desde) redirect("/admin/jugadores");

    const jugador = await getJugador(id);
    if (!jugador) redirect("/admin/jugadores");

    const nuevoPeriodo: PeriodoEnClub = {
        id: generateId("per"),
        desde,
        notas,
    };
    jugador.historial.push(nuevoPeriodo);
    jugador.activo = estaActivoEn(jugador, nowISO());

    await upsertJugador(jugador);
    revalidatePath("/admin/jugadores");
    revalidatePath(`/admin/jugadores/${id}/editar`);
    redirect(`/admin/jugadores/${id}/editar`);
}

// -------- toggleLeyenda --------
export async function toggleLeyenda(formData: FormData) {
    await requireAuth();
    const id = readStr(formData, "id");
    if (!id) redirect("/admin/jugadores");
    const jugador = await getJugador(id);
    if (!jugador) redirect("/admin/jugadores");

    jugador.esLeyenda = !jugador.esLeyenda ? true : undefined;
    await upsertJugador(jugador);

    revalidatePath("/admin/jugadores");
    revalidatePath(`/admin/jugadores/${id}/editar`);
    redirect(`/admin/jugadores/${id}/editar`);
}

// -------- eliminarJugador (destructivo) --------
export async function eliminarJugador(formData: FormData) {
    await requireAuth();
    const id = readStr(formData, "id");
    if (!id) redirect("/admin/jugadores");

    const jugador = await getJugador(id);
    if (jugador) await borrarArchivoFoto(jugador.foto);

    await deleteJugador(id);
    revalidatePath("/admin/jugadores");
    redirect("/admin/jugadores");
}