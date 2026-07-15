import Link from "next/link";
import Image from "next/image";
import { getPartidos, getRivales, getTorneos } from "@/lib/data";
import { getStatsVsRival } from "@/lib/stats";
import type { Partido, Rival, Torneo } from "@/types";
import { LigaSelector } from "./_components/LigaSelector";

export default async function RivalesPage({
    searchParams,
}: {
    searchParams: Promise<{ torneo?: string }>;
}) {
    const { torneo: torneoIdRaw } = await searchParams;
    const [rivales, torneos, partidos] = await Promise.all([
        getRivales(),
        getTorneos(),
        getPartidos(),
    ]);

    const torneoSeleccionado = torneos.find((t) => t.id === torneoIdRaw);

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-semibold">Rivales</h1>
                    <p className="text-sm text-neutral-400">
                        {rivales.length} equipos enfrentados o por enfrentar
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <LigaSelector torneos={torneos} valorActual={torneoIdRaw ?? ""} />
                    <Link
                        href="/admin/rivales/nuevo"
                        className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-medium text-sm"
                    >
                        + Nuevo rival
                    </Link>
                </div>
            </header>

            {rivales.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center">
                    <p className="text-neutral-400">Aún no hay rivales registrados.</p>
                    <Link
                        href="/admin/rivales/nuevo"
                        className="mt-4 inline-block text-sm text-orange-400 hover:text-orange-300"
                    >
                        Cargar el primero →
                    </Link>
                </div>
            ) : torneoSeleccionado ? (
                <VistaPorLiga torneo={torneoSeleccionado} rivales={rivales} partidos={partidos} />
            ) : (
                <VistaPorTemporada rivales={rivales} torneos={torneos} />
            )}
        </div>
    );
}

function VistaPorTemporada({
    rivales,
    torneos,
}: {
    rivales: Rival[];
    torneos: Torneo[];
}) {
    // Agrupamos por temporada según en qué torneo(s) participa cada rival.
    // Un mismo rival puede aparecer en varias temporadas (vuelve al año siguiente)
    // o en ninguna todavía (recién cargado, sin asignar a un torneo).
    const porTemporada = new Map<string, { rival: Rival; torneos: Torneo[] }[]>();
    const sinTorneo: Rival[] = [];

    for (const r of rivales) {
        const torneosDelRival = torneos.filter((t) => t.participantes.includes(r.id));
        if (torneosDelRival.length === 0) {
            sinTorneo.push(r);
            continue;
        }
        const temporadas = new Set(torneosDelRival.map((t) => t.temporada));
        for (const temporada of temporadas) {
            const lista = porTemporada.get(temporada) ?? [];
            lista.push({
                rival: r,
                torneos: torneosDelRival.filter((t) => t.temporada === temporada),
            });
            porTemporada.set(temporada, lista);
        }
    }

    const temporadasOrdenadas = [...porTemporada.keys()].sort().reverse();

    return (
        <>
            {temporadasOrdenadas.map((temporada) => (
                <section key={temporada} className="space-y-3">
                    <h2 className="text-sm uppercase tracking-widest text-neutral-500">
                        Temporada {temporada}{" "}
                        <span className="text-neutral-700">
                            · {porTemporada.get(temporada)!.length}
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {porTemporada.get(temporada)!.map(({ rival: r, torneos: ts }) => (
                            <RivalCard key={r.id} rival={r} torneos={ts} />
                        ))}
                    </div>
                </section>
            ))}

            {sinTorneo.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-sm uppercase tracking-widest text-neutral-500">
                        Sin torneo asignado{" "}
                        <span className="text-neutral-700">· {sinTorneo.length}</span>
                    </h2>
                    <p className="text-xs text-neutral-600 -mt-2">
                        Todavía no forman parte de ningún torneo. Asignalos desde
                        &quot;Equipos participantes&quot; al crear o editar un torneo.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sinTorneo.map((r) => (
                            <RivalCard key={r.id} rival={r} torneos={[]} />
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}

function VistaPorLiga({
    torneo,
    rivales,
    partidos,
}: {
    torneo: Torneo;
    rivales: Rival[];
    partidos: Partido[];
}) {
    const partidosDelTorneo = partidos.filter((p) => p.torneoId === torneo.id);

    const filas = torneo.participantes
        .map((rivalId) => rivales.find((r) => r.id === rivalId))
        .filter((r): r is Rival => r !== undefined)
        .map((rival) => ({
            rival,
            stats: getStatsVsRival(rival.id, partidosDelTorneo),
        }))
        .sort((a, b) => a.rival.nombre.localeCompare(b.rival.nombre));

    const conPartidos = filas.filter((f) => f.stats.enfrentamientos > 0);
    const masGoleado = conPartidos.length
        ? conPartidos.reduce((max, f) => (f.stats.golesFavor > max.stats.golesFavor ? f : max))
        : null;
    const masDificil = conPartidos.length
        ? conPartidos.reduce((max, f) =>
              f.stats.golesContra > max.stats.golesContra ? f : max,
          )
        : null;

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-semibold">{torneo.nombre}</h2>
                <p className="text-sm text-neutral-400">
                    {torneo.temporada} · {torneo.categoria} · {filas.length} equipos
                </p>
            </div>

            {filas.length === 0 ? (
                <p className="text-sm text-neutral-500">
                    Esta liga todavía no tiene equipos participantes cargados. Agregalos
                    desde{" "}
                    <Link
                        href={`/admin/plantillas/${torneo.id}`}
                        className="text-orange-400 hover:text-orange-300 underline"
                    >
                        Plantillas
                    </Link>
                    .
                </p>
            ) : (
                <>
                    {(masGoleado || masDificil) && (
                        <div className="flex flex-wrap gap-3">
                            {masGoleado && masGoleado.stats.golesFavor > 0 && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-sm">
                                    <span>🔥</span>
                                    <span>
                                        Más goleado:{" "}
                                        <span className="font-medium">
                                            {masGoleado.rival.nombre}
                                        </span>{" "}
                                        ({masGoleado.stats.golesFavor} goles)
                                    </span>
                                </div>
                            )}
                            {masDificil && masDificil.stats.golesContra > 0 && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-sm">
                                    <span>😤</span>
                                    <span>
                                        Más difícil:{" "}
                                        <span className="font-medium">
                                            {masDificil.rival.nombre}
                                        </span>{" "}
                                        ({masDificil.stats.golesContra} goles en contra)
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="rounded-xl border border-neutral-800 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-900 text-neutral-400 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="text-left px-4 py-2">Rival</th>
                                    <th className="text-right px-3 py-2">PJ</th>
                                    <th className="text-right px-3 py-2">G</th>
                                    <th className="text-right px-3 py-2">E</th>
                                    <th className="text-right px-3 py-2">P</th>
                                    <th className="text-right px-3 py-2">GF</th>
                                    <th className="text-right px-3 py-2">GC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filas.map(({ rival, stats }) => (
                                    <tr
                                        key={rival.id}
                                        className="border-t border-neutral-800 hover:bg-neutral-900/50"
                                    >
                                        <td className="px-4 py-2">
                                            <Link
                                                href={`/admin/rivales/${rival.id}`}
                                                className="flex items-center gap-2 hover:text-orange-300"
                                            >
                                                {rival.escudo ? (
                                                    <Image
                                                        src={rival.escudo}
                                                        alt={rival.nombre}
                                                        width={24}
                                                        height={24}
                                                        className="rounded object-cover w-6 h-6"
                                                    />
                                                ) : (
                                                    <span className="w-6 h-6 rounded bg-neutral-800 inline-flex items-center justify-center text-[10px] text-neutral-500">
                                                        {rival.nombre.slice(0, 2).toUpperCase()}
                                                    </span>
                                                )}
                                                {rival.nombre}
                                            </Link>
                                        </td>
                                        <td className="text-right px-3 py-2 text-neutral-400">
                                            {stats.enfrentamientos}
                                        </td>
                                        <td className="text-right px-3 py-2 text-emerald-300">
                                            {stats.ganados}
                                        </td>
                                        <td className="text-right px-3 py-2 text-amber-300">
                                            {stats.empatados}
                                        </td>
                                        <td className="text-right px-3 py-2 text-red-300">
                                            {stats.perdidos}
                                        </td>
                                        <td className="text-right px-3 py-2">
                                            {stats.golesFavor}
                                        </td>
                                        <td className="text-right px-3 py-2">
                                            {stats.golesContra}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

function RivalCard({ rival: r, torneos: ts }: { rival: Rival; torneos: Torneo[] }) {
    return (
        <Link
            href={`/admin/rivales/${r.id}`}
            className="flex items-center gap-3 p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 hover:border-orange-500/30 transition"
        >
            {r.escudo ? (
                <Image
                    src={r.escudo}
                    alt={r.nombre}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover w-12 h-12"
                />
            ) : (
                <span className="w-12 h-12 rounded-lg bg-neutral-800 inline-flex items-center justify-center text-sm text-neutral-500 font-semibold">
                    {r.nombre.slice(0, 2).toUpperCase()}
                </span>
            )}
            <div className="min-w-0">
                <p className="font-medium truncate">{r.nombre}</p>
                {r.ciudad && (
                    <p className="text-xs text-neutral-500 truncate">{r.ciudad}</p>
                )}
                {ts.length > 0 && (
                    <p className="text-xs text-orange-300/80 truncate mt-0.5">
                        {ts.map((t) => t.nombre).join(" · ")}
                    </p>
                )}
            </div>
        </Link>
    );
}
