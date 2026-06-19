"use server";

import { promises as fs } from "fs";
import path from "path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { upsertJugador } from "@/lib/data";
import { requireAuth } from "@/lib/auth";
import { generateId, estaActivoEn, nowISO } from "@/lib/utils";
import type {
    Jugador,
    Posicion,
    PieDominante,
    StatsCarryOver,
} from "@/types";

// -------- Configuración de upload de foto --------
const MAX_FOTO_BYTES = 2 * 1024 * 1024; // 2 MB
const TIPOS_FOTO_VALIDOS = ["image/jpeg", "image/png", "image/webp"];

// -------- Helpers de parseo --------
const POSICIONES: Posicion[] = ["POR", "DEF", "MED", "DEL"];

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

// -------- Server Action: crear jugador --------
export async function crearJugador(formData: FormData) {
    await requireAuth();

    // Obligatorios
    const nombre = readStr(formData, "nombre");
    const apellido = readStr(formData, "apellido");
    const dorsal = readInt(formData.get("dorsal"), -1);
    const posicion = readPosicion(formData.get("posicion"));
    const desde = readStr(formData, "desde");

    if (!nombre || !apellido || dorsal < 0 || !posicion || !desde) {
        redirect("/admin/jugadores/nuevo?error=campos");
    }

    // Validación de foto (antes de generar nada)
    const fotoFile = formData.get("foto");
    let fotoPath: string | undefined;

    if (fotoFile instanceof File && fotoFile.size > 0) {
        if (fotoFile.size > MAX_FOTO_BYTES) {
            redirect("/admin/jugadores/nuevo?error=foto_grande");
        }
        if (!TIPOS_FOTO_VALIDOS.includes(fotoFile.type)) {
            redirect("/admin/jugadores/nuevo?error=foto_tipo");
        }
    }

    // Otros opcionales
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

    // ID + guardado físico de foto
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