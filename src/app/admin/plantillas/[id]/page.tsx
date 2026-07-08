import Link from "next/link";
import { notFound } from "next/navigation";
import { getJugadores, getRivales, getTorneo, getTorneos } from "@/lib/data";
import { actualizarPlantilla, crearJugadorEnPlantilla } from "../actions";
import { PlantillaJugadores } from "../_components/PlantillaJugadores";
import { SelectorRivales } from "../_components/SelectorRivales";

const inputCls =
    "w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-orange-500 focus:outline-none text-sm";

export default async function PlantillaTorneoPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ error?: string; ok?: string }>;
}) {
    const { id } = await params;
    const { error, ok } = await searchParams;
    const [torneo, rivales, jugadores, todosTorneos] = await Promise.all([
        getTorneo(id),
        getRivales(),
        getJugadores(),
        getTorneos(),
    ]);
    if (!torneo) notFound();

    const jugadoresActivos = [...jugadores]
        .filter((j) => j.activo || torneo.jugadoresIds.includes(j.id))
        .sort((a, b) => a.dorsal - b.dorsal);
    const rivalesOrdenados = [...rivales].sort((a, b) => a.nombre.localeCompare(b.nombre));
    const otrosTorneos = todosTorneos.filter((t) => t.id !== torneo.id);

    return (
        <div className="space-y-8 max-w-3xl">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Plantilla · {torneo.nombre}</h1>
                    <p className="text-sm text-neutral-400">
                        {torneo.temporada} · {torneo.categoria}
                    </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <Link
                        href={`/admin/torneos/${torneo.id}/editar`}
                        className="text-neutral-400 hover:text-neutral-100"
                    >
                        Editar datos del torneo
                    </Link>
                    <Link
                        href="/admin/plantillas"
                        className="text-neutral-400 hover:text-neutral-100"
                    >
                        ← Volver
                    </Link>
                </div>
            </header>

            {ok === "1" && (
                <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2">
                    Guardado.
                </p>
            )}
            {error === "campos_jugador" && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                    Faltan campos para dar de alta al jugador nuevo.
                </p>
            )}

            <form action={actualizarPlantilla} className="space-y-8">
                <input type="hidden" name="torneoId" value={torneo.id} />

                <Seccion titulo="Jugadores del club en este torneo">
                    <p className="md:col-span-2 text-xs text-neutral-500 -mt-2">
                        El número gris junto al nombre es el dorsal global del jugador. Si
                        en este torneo usa uno distinto, escribilo en el campo que aparece
                        al marcarlo — si lo dejás vacío, se usa el global.
                    </p>
                    <PlantillaJugadores
                        jugadores={jugadoresActivos}
                        torneosExistentes={otrosTorneos}
                        seleccionInicial={torneo.jugadoresIds}
                        dorsalesIniciales={torneo.dorsalesPorJugador}
                    />
                </Seccion>

                <Seccion titulo="Equipos participantes">
                    {rivales.length === 0 ? (
                        <p className="text-sm text-neutral-500 md:col-span-2">
                            Sin rivales cargados.{" "}
                            <Link
                                href="/admin/rivales/nuevo"
                                className="text-orange-400 hover:text-orange-300 underline"
                            >
                                Cargá uno
                            </Link>{" "}
                            y volvé a esta página.
                        </p>
                    ) : (
                        <SelectorRivales
                            rivales={rivalesOrdenados}
                            torneosExistentes={otrosTorneos}
                            seleccionInicial={torneo.participantes}
                        />
                    )}
                </Seccion>

                <div className="flex gap-3 pt-4 border-t border-neutral-800">
                    <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-medium text-sm"
                    >
                        Guardar plantilla
                    </button>
                </div>
            </form>

            <section className="pt-8 border-t border-neutral-800 space-y-4">
                <h2 className="text-sm uppercase tracking-widest text-neutral-500">
                    Jugador nuevo, específico de este torneo
                </h2>
                <p className="text-xs text-neutral-500 -mt-2">
                    Se da de alta como jugador normal del club y queda agregado
                    directamente a esta plantilla. Podés completar más datos (foto, bio,
                    etc.) después desde Jugadores.
                </p>
                <form
                    action={crearJugadorEnPlantilla}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <input type="hidden" name="torneoId" value={torneo.id} />
                    <Field label="Nombre *">
                        <input name="nombreNuevo" required className={inputCls} />
                    </Field>
                    <Field label="Apellido *">
                        <input name="apellidoNuevo" required className={inputCls} />
                    </Field>
                    <Field label="Dorsal *">
                        <input
                            type="number"
                            name="dorsalNuevo"
                            min={0}
                            required
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Posición *">
                        <select
                            name="posicionNuevo"
                            required
                            defaultValue=""
                            className={inputCls}
                        >
                            <option value="" disabled>
                                Elegí
                            </option>
                            <option value="POR">Portero</option>
                            <option value="DEF">Defensa</option>
                            <option value="MED">Medio</option>
                            <option value="DEL">Delantero</option>
                        </select>
                    </Field>
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-sm"
                        >
                            + Agregar jugador nuevo a este torneo
                        </button>
                    </div>
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
