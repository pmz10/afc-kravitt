import Link from "next/link";
import Image from "next/image";
import { getRivales, getTorneos } from "@/lib/data";
import type { Rival, Torneo } from "@/types";

export default async function RivalesPage() {
    const [rivales, torneos] = await Promise.all([getRivales(), getTorneos()]);

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
        <div className="space-y-8">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Rivales</h1>
                    <p className="text-sm text-neutral-400">
                        {rivales.length} equipos enfrentados o por enfrentar
                    </p>
                </div>
                <Link
                    href="/admin/rivales/nuevo"
                    className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-medium text-sm"
                >
                    + Nuevo rival
                </Link>
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
            ) : (
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
