import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getRival } from "@/lib/data";
import { editarRival, eliminarRival } from "../../actions";

const inputCls =
    "w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-orange-500 focus:outline-none text-sm";

const ERRORES: Record<string, string> = {
    campos: "El nombre es obligatorio.",
    escudo_grande: "El escudo pesa más de 2 MB.",
    escudo_tipo: "El escudo debe ser JPG, PNG o WebP.",
};

export default async function EditarRivalPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ error?: string }>;
}) {
    const { id } = await params;
    const { error } = await searchParams;
    const rival = await getRival(id);
    if (!rival) notFound();

    const mensajeError = error ? ERRORES[error] : null;

    return (
        <div className="space-y-6 max-w-2xl">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Editar {rival.nombre}</h1>
                    {rival.ciudad && (
                        <p className="text-sm text-neutral-400">{rival.ciudad}</p>
                    )}
                </div>
                <Link
                    href="/admin/rivales"
                    className="text-sm text-neutral-400 hover:text-neutral-100"
                >
                    ← Volver
                </Link>
            </header>

            {mensajeError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                    {mensajeError}
                </p>
            )}

            <form action={editarRival} className="space-y-6">
                <input type="hidden" name="id" value={rival.id} />

                <Field label="Nombre *">
                    <input
                        name="nombre"
                        required
                        defaultValue={rival.nombre}
                        className={inputCls}
                    />
                </Field>
                <Field label="Nombre corto">
                    <input
                        name="nombreCorto"
                        defaultValue={rival.nombreCorto ?? ""}
                        className={inputCls}
                    />
                </Field>
                <Field label="Ciudad">
                    <input
                        name="ciudad"
                        defaultValue={rival.ciudad ?? ""}
                        className={inputCls}
                    />
                </Field>
                <Field label="Escudo">
                    {rival.escudo && (
                        <div className="flex items-center gap-3 mb-2">
                            <Image
                                src={rival.escudo}
                                alt={rival.nombre}
                                width={64}
                                height={64}
                                className="rounded-lg object-cover w-16 h-16"
                            />
                            <label className="flex items-center gap-2 text-xs text-neutral-400">
                                <input type="checkbox" name="eliminarEscudo" />
                                Eliminar escudo actual
                            </label>
                        </div>
                    )}
                    <input
                        type="file"
                        name="escudo"
                        accept="image/jpeg,image/png,image/webp"
                        className={`${inputCls} file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-neutral-800 file:text-neutral-100 file:text-xs file:cursor-pointer`}
                    />
                    <span className="text-xs text-neutral-500 mt-1 block">
                        Subí uno nuevo para reemplazar. Máx 2 MB.
                    </span>
                </Field>
                <Field label="Notas tácticas">
                    <textarea
                        name="notas"
                        rows={4}
                        defaultValue={rival.notas ?? ""}
                        className={inputCls}
                    />
                </Field>

                <div className="flex gap-3 pt-4 border-t border-neutral-800">
                    <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-medium text-sm"
                    >
                        Guardar cambios
                    </button>
                    <Link
                        href="/admin/rivales"
                        className="px-5 py-2 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-sm"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>

            <section className="pt-8 border-t border-neutral-800">
                <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-3">
                    Zona peligrosa
                </h2>
                <form action={eliminarRival}>
                    <input type="hidden" name="id" value={rival.id} />
                    <button
                        type="submit"
                        className="text-xs px-3 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30"
                    >
                        Eliminar rival permanentemente
                    </button>
                    <p className="text-xs text-neutral-500 mt-2">
                        Borra el rival y su escudo. No se puede recuperar. Si el rival tiene
                        partidos registrados, los partidos quedan apuntando a un id
                        inexistente.
                    </p>
                </form>
            </section>
        </div>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-wider text-neutral-400">
                {label}
            </span>
            {children}
        </label>
    );
}