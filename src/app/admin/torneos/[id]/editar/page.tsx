import Link from "next/link";
import { notFound } from "next/navigation";
import { getTorneo } from "@/lib/data";
import { editarTorneo, eliminarTorneo } from "../../actions";

const inputCls =
    "w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-orange-500 focus:outline-none text-sm";

export default async function EditarTorneoPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ error?: string }>;
}) {
    const { id } = await params;
    const { error } = await searchParams;
    const torneo = await getTorneo(id);
    if (!torneo) notFound();

    return (
        <div className="space-y-6 max-w-3xl">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Editar {torneo.nombre}</h1>
                    <p className="text-sm text-neutral-400">
                        {torneo.temporada} · {torneo.categoria}
                    </p>
                </div>
                <Link
                    href="/admin/torneos"
                    className="text-sm text-neutral-400 hover:text-neutral-100"
                >
                    ← Volver
                </Link>
            </header>

            {error === "campos" && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                    Faltan campos obligatorios.
                </p>
            )}

            <form action={editarTorneo} className="space-y-8">
                <input type="hidden" name="id" value={torneo.id} />

                <Seccion titulo="Datos del torneo">
                    <Field label="Nombre *" full>
                        <input
                            name="nombre"
                            required
                            defaultValue={torneo.nombre}
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Temporada *">
                        <input
                            name="temporada"
                            required
                            defaultValue={torneo.temporada}
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Organizador">
                        <input
                            name="organizador"
                            defaultValue={torneo.organizador ?? ""}
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Categoría *">
                        <select
                            name="categoria"
                            required
                            defaultValue={torneo.categoria}
                            className={inputCls}
                        >
                            <option value="Fut7">Fut 7</option>
                            <option value="Fut6">Fut 6</option>
                            <option value="Fut5">Fut 5</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </Field>
                    <Field label="Tipo *">
                        <select
                            name="tipo"
                            required
                            defaultValue={torneo.tipo}
                            className={inputCls}
                        >
                            <option value="liga">Liga</option>
                            <option value="copa">Copa</option>
                            <option value="amistoso">Amistoso</option>
                            <option value="interno">Interno</option>
                        </select>
                    </Field>
                    <Field label="Estado *">
                        <select
                            name="estado"
                            required
                            defaultValue={torneo.estado}
                            className={inputCls}
                        >
                            <option value="proximo">Próximo</option>
                            <option value="en_curso">En curso</option>
                            <option value="finalizado">Finalizado</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </Field>
                    <Field label="Sede">
                        <input
                            name="sede"
                            defaultValue={torneo.sede ?? ""}
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Fecha de inicio">
                        <input
                            type="date"
                            name="fechaInicio"
                            defaultValue={torneo.fechaInicio ?? ""}
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Fecha de fin">
                        <input
                            type="date"
                            name="fechaFin"
                            defaultValue={torneo.fechaFin ?? ""}
                            className={inputCls}
                        />
                    </Field>
                </Seccion>

                <div className="md:col-span-2 flex items-center justify-between gap-4 text-xs bg-neutral-900/50 border border-neutral-800 rounded-lg px-4 py-3">
                    <span className="text-neutral-500">
                        Plantilla ({torneo.jugadoresIds.length} jugadores) y equipos
                        participantes ({torneo.participantes.length}) se gestionan aparte.
                    </span>
                    <Link
                        href={`/admin/plantillas/${torneo.id}`}
                        className="shrink-0 text-orange-400 hover:text-orange-300 underline underline-offset-2"
                    >
                        Ir a Plantillas →
                    </Link>
                </div>

                <Seccion titulo="Resultado del club">
                    <Field label="Posición final">
                        <input
                            type="number"
                            name="posicionFinal"
                            min={1}
                            defaultValue={torneo.posicionFinal ?? ""}
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Fase alcanzada">
                        <input
                            name="faseAlcanzada"
                            defaultValue={torneo.faseAlcanzada ?? ""}
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Resumen / notas" full>
                        <textarea
                            name="resumen"
                            rows={3}
                            defaultValue={torneo.resumen ?? ""}
                            className={inputCls}
                        />
                    </Field>
                </Seccion>

                <div className="flex gap-3 pt-4 border-t border-neutral-800">
                    <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-medium text-sm"
                    >
                        Guardar cambios
                    </button>
                    <Link
                        href="/admin/torneos"
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
                <form action={eliminarTorneo}>
                    <input type="hidden" name="id" value={torneo.id} />
                    <button
                        type="submit"
                        className="text-xs px-3 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30"
                    >
                        Eliminar torneo permanentemente
                    </button>
                    <p className="text-xs text-neutral-500 mt-2">
                        Si el torneo tiene partidos registrados, los partidos quedarán
                        huérfanos.
                    </p>
                </form>
            </section>
        </div>
    );
}

function Seccion({
    titulo,
    children,
}: {
    titulo: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-4">
            <h2 className="text-sm uppercase tracking-widest text-neutral-500">
                {titulo}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
        </section>
    );
}

function Field({
    label,
    children,
    full = false,
}: {
    label: string;
    children: React.ReactNode;
    full?: boolean;
}) {
    return (
        <label className={`flex flex-col gap-1.5 ${full ? "md:col-span-2" : ""}`}>
            <span className="text-xs uppercase tracking-wider text-neutral-400">
                {label}
            </span>
            {children}
        </label>
    );
}