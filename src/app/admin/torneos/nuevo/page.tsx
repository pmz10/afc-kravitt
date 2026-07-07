import Link from "next/link";
import { getJugadores, getRivales, getTorneos } from "@/lib/data";
import { crearTorneo } from "../actions";
import { PlantillaTorneo } from "../_components/PlantillaTorneo";

const inputCls =
    "w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-orange-500 focus:outline-none text-sm";

export default async function NuevoTorneoPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;
    const [rivales, jugadores, torneosExistentes] = await Promise.all([
        getRivales(),
        getJugadores(),
        getTorneos(),
    ]);
    const jugadoresActivos = jugadores.filter((j) => j.activo);

    return (
        <div className="space-y-6 max-w-3xl">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Nuevo torneo</h1>
                    <p className="text-sm text-neutral-400">
                        Liga, copa o competición que vas a disputar.
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

            {rivales.length === 0 && (
                <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3">
                    Tip: aún no tenés rivales cargados. Podés crear el torneo sin
                    participantes y agregarlos después, o{" "}
                    <Link
                        href="/admin/rivales/nuevo"
                        className="underline hover:text-amber-200"
                    >
                        cargar uno ahora
                    </Link>
                    .
                </p>
            )}

            <form action={crearTorneo} className="space-y-8">
                <Seccion titulo="Datos del torneo">
                    <Field label="Nombre *" full>
                        <input
                            name="nombre"
                            required
                            placeholder="ej: Liga AFCM Apertura 2026"
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Temporada *">
                        <input
                            name="temporada"
                            required
                            placeholder="2025-2026"
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Organizador">
                        <input
                            name="organizador"
                            placeholder="ej: Liga Amateur CDMX"
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Categoría *">
                        <select name="categoria" required defaultValue="" className={inputCls}>
                            <option value="" disabled>
                                Elegí
                            </option>
                            <option value="Fut7">Fut 7</option>
                            <option value="Fut6">Fut 6</option>
                            <option value="Fut5">Fut 5</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </Field>
                    <Field label="Tipo *">
                        <select name="tipo" required defaultValue="" className={inputCls}>
                            <option value="" disabled>
                                Elegí
                            </option>
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
                            defaultValue="proximo"
                            className={inputCls}
                        >
                            <option value="proximo">Próximo</option>
                            <option value="en_curso">En curso</option>
                            <option value="finalizado">Finalizado</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </Field>
                    <Field label="Sede">
                        <input name="sede" className={inputCls} />
                    </Field>
                    <Field label="Fecha de inicio">
                        <input type="date" name="fechaInicio" className={inputCls} />
                    </Field>
                    <Field label="Fecha de fin">
                        <input type="date" name="fechaFin" className={inputCls} />
                    </Field>
                </Seccion>

                <Seccion titulo="Equipos participantes">
                    {rivales.length === 0 ? (
                        <p className="text-sm text-neutral-500 md:col-span-2">
                            Sin rivales cargados todavía.
                        </p>
                    ) : (
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto rounded-lg border border-neutral-800 p-3 bg-neutral-950">
                            {rivales.map((r) => (
                                <label
                                    key={r.id}
                                    className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-md hover:bg-neutral-900"
                                >
                                    <input
                                        type="checkbox"
                                        name="participantes"
                                        value={r.id}
                                    />
                                    <span className="truncate">{r.nombre}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </Seccion>

                <Seccion titulo="Plantilla del club en este torneo">
                    <p className="md:col-span-2 text-xs text-neutral-500 -mt-2">
                        Elegí qué jugadores participan en este torneo. Si ya tenías otro
                        torneo con plantel similar (ej. otro de Fut7), podés copiarla en
                        vez de recapturar uno por uno.
                    </p>
                    <PlantillaTorneo
                        jugadores={jugadoresActivos}
                        torneosExistentes={torneosExistentes}
                        seleccionInicial={[]}
                    />
                </Seccion>

                <Seccion titulo="Resultado del club (opcional)">
                    <Field label="Posición final">
                        <input
                            type="number"
                            name="posicionFinal"
                            min={1}
                            placeholder="1 = campeones"
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Fase alcanzada">
                        <input
                            name="faseAlcanzada"
                            placeholder="Final, Semifinal, Octavos..."
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Resumen / notas" full>
                        <textarea name="resumen" rows={3} className={inputCls} />
                    </Field>
                </Seccion>

                <div className="flex gap-3 pt-4 border-t border-neutral-800">
                    <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-medium text-sm"
                    >
                        Crear torneo
                    </button>
                    <Link
                        href="/admin/torneos"
                        className="px-5 py-2 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-sm"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
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