"use server";

import { promises as fs } from "fs";
import path from "path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { deleteRival, getRival, upsertRival } from "@/lib/data";
import { requireAuth } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import type { Rival } from "@/types";

const MAX_ESCUDO_BYTES = 2 * 1024 * 1024;
const TIPOS_ESCUDO_VALIDOS = ["image/jpeg", "image/png", "image/webp"];

function readStr(formData: FormData, key: string): string | undefined {
    const v = formData.get(key);
    if (typeof v !== "string") return undefined;
    const trimmed = v.trim();
    return trimmed.length ? trimmed : undefined;
}

async function guardarEscudo(file: File, rivalId: string): Promise<string> {
    const ext =
        file.type === "image/png"
            ? "png"
            : file.type === "image/webp"
                ? "webp"
                : "jpg";
    const filename = `${rivalId}-${Date.now()}.${ext}`;
    const dir = path.join(process.cwd(), "public", "rivales");
    await fs.mkdir(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(dir, filename), buffer);
    return `/rivales/${filename}`;
}

async function borrarArchivoEscudo(escudoPath: string | undefined) {
    if (!escudoPath || !escudoPath.startsWith("/rivales/")) return;
    try {
        await fs.unlink(path.join(process.cwd(), "public", escudoPath));
    } catch { }
}

// -------- crearRival --------
export async function crearRival(formData: FormData) {
    await requireAuth();

    const nombre = readStr(formData, "nombre");
    if (!nombre) redirect("/admin/rivales/nuevo?error=campos");

    const escudoFile = formData.get("escudo");
    let escudoPath: string | undefined;
    if (escudoFile instanceof File && escudoFile.size > 0) {
        if (escudoFile.size > MAX_ESCUDO_BYTES)
            redirect("/admin/rivales/nuevo?error=escudo_grande");
        if (!TIPOS_ESCUDO_VALIDOS.includes(escudoFile.type))
            redirect("/admin/rivales/nuevo?error=escudo_tipo");
    }

    const id = generateId("r");
    if (escudoFile instanceof File && escudoFile.size > 0) {
        escudoPath = await guardarEscudo(escudoFile, id);
    }

    const rival: Rival = {
        id,
        nombre,
        nombreCorto: readStr(formData, "nombreCorto"),
        escudo: escudoPath,
        ciudad: readStr(formData, "ciudad"),
        notas: readStr(formData, "notas"),
    };

    await upsertRival(rival);
    revalidatePath("/admin/rivales");
    redirect("/admin/rivales");
}

// -------- editarRival --------
export async function editarRival(formData: FormData) {
    await requireAuth();

    const id = readStr(formData, "id");
    if (!id) redirect("/admin/rivales");
    const actual = await getRival(id);
    if (!actual) redirect("/admin/rivales");

    const nombre = readStr(formData, "nombre");
    if (!nombre) redirect(`/admin/rivales/${id}/editar?error=campos`);

    const eliminarEscudo = formData.get("eliminarEscudo") === "on";
    const escudoFile = formData.get("escudo");
    let escudoPath: string | undefined = actual.escudo;

    if (escudoFile instanceof File && escudoFile.size > 0) {
        if (escudoFile.size > MAX_ESCUDO_BYTES)
            redirect(`/admin/rivales/${id}/editar?error=escudo_grande`);
        if (!TIPOS_ESCUDO_VALIDOS.includes(escudoFile.type))
            redirect(`/admin/rivales/${id}/editar?error=escudo_tipo`);
        await borrarArchivoEscudo(actual.escudo);
        escudoPath = await guardarEscudo(escudoFile, id);
    } else if (eliminarEscudo) {
        await borrarArchivoEscudo(actual.escudo);
        escudoPath = undefined;
    }

    const rival: Rival = {
        ...actual,
        nombre,
        nombreCorto: readStr(formData, "nombreCorto"),
        escudo: escudoPath,
        ciudad: readStr(formData, "ciudad"),
        notas: readStr(formData, "notas"),
    };

    await upsertRival(rival);
    revalidatePath("/admin/rivales");
    revalidatePath(`/admin/rivales/${id}/editar`);
    redirect("/admin/rivales");
}

// -------- eliminarRival --------
export async function eliminarRival(formData: FormData) {
    await requireAuth();
    const id = readStr(formData, "id");
    if (!id) redirect("/admin/rivales");

    const rival = await getRival(id);
    if (rival) await borrarArchivoEscudo(rival.escudo);

    await deleteRival(id);
    revalidatePath("/admin/rivales");
    redirect("/admin/rivales");
}