import Link from "next/link";
import Image from "next/image";
import UniformeCard from "@/components/admin/UniformeCard";
import {
    getJugadores,
    getPartidos,
    getRivales,
    getTorneos,
} from "@/lib/data";
import { getStatsJugador } from "@/lib/stats";
import type { Partido, ResultadoPartido } from "@/types";

const RESULTADO_BREVE: Record<ResultadoPartido, string> = {
    ganado: "G",
    perdido: "P",
    empatado: "E",
    "default-favor": "G",
    "default-contra": "P",
    pendiente: "—",
};

const RESULTADO_COLOR: Record<ResultadoPartido, string> = {
    ganado: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    "default-favor":
        "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    empatado: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    perdido: "bg-red-500/15 text-red-300 border-red-500/30",
    "default-contra": "bg-red-500/15 text-red-300 border-red-500/30",
    pendiente: "bg-sky-500/15 text-sky-300 border-sky-500/30",
};

function clasificar(p: Partido): "G" | "E" | "P" | null {
    switch (p.resultado) {
        case "ganado":
        case "default-favor":
            return "G";

        case "empatado":
            return "E";

        case "perdido":
        case "default-contra":
            return "P";

        default:
            return null;
    }
}

export default async function DashboardPage() {
    const [jugadores, partidos, torneos, rivales] = await Promise.all([
        getJugadores(),
        getPartidos(),
        getTorneos(),
        getRivales(),
    ]);

    // KPIs
    const activos = jugadores.filter((j) => j.activo).length;
    const leyendas = jugadores.filter((j) => j.esLeyenda).length;

    const partidosJugados = partidos.filter(
        (p) => p.resultado !== "pendiente",
    );

    const partidosPendientes = partidos.filter(
        (p) => p.resultado === "pendiente",
    );

    const torneoEnCurso = torneos.find(
        (t) => t.estado === "en_curso",
    );

    // Récord W-D-L y goles
    let ganados = 0;
    let empatados = 0;
    let perdidos = 0;
    let golesFavor = 0;
    let golesContra = 0;

    for (const p of partidosJugados) {
        const c = clasificar(p);

        if (c === "G") {
            ganados++;
        } else if (c === "E") {
            empatados++;
        } else if (c === "P") {
            perdidos++;
        }

        if (p.golesFavor !== undefined) {
            golesFavor += p.golesFavor;
        }

        if (p.golesContra !== undefined) {
            golesContra += p.golesContra;
        }
    }

    // Próximo partido
    const ahora = Date.now();

    const proximoPartido = partidos
        .filter(
            (p) =>
                p.resultado === "pendiente" &&
                new Date(p.fecha).getTime() > ahora,
        )
        .sort(
            (a, b) =>
                new Date(a.fecha).getTime() -
                new Date(b.fecha).getTime(),
        )[0];

    // Últimos resultados
    const ultimosResultados = [...partidosJugados]
        .sort(
            (a, b) =>
                new Date(b.fecha).getTime() -
                new Date(a.fecha).getTime(),
        )
        .slice(0, 5);

    // Top goleadores
    const topGoleadores = jugadores
        .map((j) => ({
            jugador: j,
            stats: getStatsJugador(j, partidos),
        }))
        .filter((x) => x.stats.goles > 0)
        .sort((a, b) => b.stats.goles - a.stats.goles)
        .slice(0, 5);

    // Racha actual
    const racha = ultimosResultados
        .map((p) => clasificar(p))
        .filter((c): c is "G" | "E" | "P" => c !== null)
        .reverse();

    return (
        <div className="max-w-6xl space-y-8">
            <header>
                <h1 className="text-2xl font-semibold">
                    Dashboard
                </h1>

                <p className="text-sm text-neutral-400">
                    Resumen del club AFC Kravitt
                </p>
            </header>

            {/* KPIs principales */}
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <Kpi
                    label="Jugadores activos"
                    valor={activos}
                    sub={`${jugadores.length} totales · ${leyendas} leyendas`}
                    href="/admin/jugadores"
                />

                <Kpi
                    label="Torneos"
                    valor={torneos.length}
                    sub={
                        torneoEnCurso
                            ? `${torneoEnCurso.nombre} en curso`
                            : "ninguno en curso"
                    }
                    href="/admin/torneos"
                />

                <Kpi
                    label="Partidos jugados"
                    valor={partidosJugados.length}
                    sub={`${partidosPendientes.length} pendientes`}
                    href="/admin/partidos"
                />

                <Kpi
                    label="Ganados"
                    valor={ganados}
                    color="emerald"
                />

                <Kpi
                    label="Empatados"
                    valor={empatados}
                    color="amber"
                />

                <Kpi
                    label="Perdidos"
                    valor={perdidos}
                    color="red"
                />
            </section>

            {/* Goles + racha + uniforme */}
            <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_280px]">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                    <p className="text-xs uppercase tracking-wider text-neutral-500">
                        Goles
                    </p>

                    <div className="mt-2 flex flex-wrap items-baseline gap-3">
                        <span className="text-3xl font-semibold text-emerald-300">
                            {golesFavor}
                        </span>

                        <span className="text-neutral-500">
                            a favor
                        </span>

                        <span className="text-neutral-700">
                            ·
                        </span>

                        <span className="text-3xl font-semibold text-red-300">
                            {golesContra}
                        </span>

                        <span className="text-neutral-500">
                            en contra
                        </span>
                    </div>

                    <p className="mt-2 text-xs text-neutral-500">
                        Diferencia:{" "}
                        {golesFavor - golesContra >= 0 ? "+" : ""}
                        {golesFavor - golesContra}
                    </p>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                    <p className="text-xs uppercase tracking-wider text-neutral-500">
                        Últimos 5 resultados
                    </p>

                    <div className="mt-3 flex gap-1.5">
                        {racha.length === 0 ? (
                            <span className="text-sm text-neutral-500">
                                Sin datos aún
                            </span>
                        ) : (
                            racha.map((r, i) => (
                                <span
                                    key={`${r}-${i}`}
                                    className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm font-semibold ${
                                        r === "G"
                                            ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                                            : r === "E"
                                              ? "border-amber-500/30 bg-amber-500/15 text-amber-300"
                                              : "border-red-500/30 bg-red-500/15 text-red-300"
                                    }`}
                                >
                                    {r}
                                </span>
                            ))
                        )}
                    </div>

                    <p className="mt-3 text-xs text-neutral-500">
                        De izquierda, más antiguo, a derecha,
                        más reciente.
                    </p>
                </div>

                <div className="md:col-span-2 xl:col-span-1">
                    <UniformeCard />
                </div>
            </section>

            {/* Próximo partido */}
            {proximoPartido && (
                <section className="space-y-3">
                    <h2 className="text-sm uppercase tracking-widest text-neutral-500">
                        Próximo partido
                    </h2>

                    {(() => {
                        const rival = rivales.find(
                            (r) => r.id === proximoPartido.rivalId,
                        );

                        const torneo = torneos.find(
                            (t) => t.id === proximoPartido.torneoId,
                        );

                        const fecha = new Date(
                            proximoPartido.fecha,
                        ).toLocaleString("es-MX", {
                            dateStyle: "full",
                            timeStyle: "short",
                        });

                        return (
                            <Link
                                href={`/admin/partidos/${proximoPartido.id}/editar`}
                                className="block rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 transition hover:border-orange-500/30 hover:bg-neutral-900"
                            >
                                <div className="flex items-center gap-4">
                                    {rival?.escudo && (
                                        <Image
                                            src={rival.escudo}
                                            alt={rival.nombre}
                                            width={56}
                                            height={56}
                                            className="h-14 w-14 rounded-lg object-cover"
                                        />
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <p className="text-base">
                                            <span className="font-semibold">
                                                {proximoPartido.esLocal
                                                    ? "AFC Kravitt"
                                                    : rival?.nombre ?? "—"}
                                            </span>

                                            <span className="text-neutral-500">
                                                {" "}
                                                vs{" "}
                                            </span>

                                            <span className="font-semibold">
                                                {proximoPartido.esLocal
                                                    ? rival?.nombre ?? "—"
                                                    : "AFC Kravitt"}
                                            </span>
                                        </p>

                                        <p className="mt-1 text-xs text-neutral-500">
                                            {torneo?.nombre ??
                                                "Sin torneo"}

                                            {proximoPartido.jornada &&
                                                ` · Jornada ${proximoPartido.jornada}`}

                                            {proximoPartido.sede &&
                                                ` · ${proximoPartido.sede}`}
                                        </p>

                                        <p className="mt-1 text-sm text-orange-300">
                                            {fecha}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })()}
                </section>
            )}

            {/* Últimos resultados */}
            <section className="space-y-3">
                <h2 className="text-sm uppercase tracking-widest text-neutral-500">
                    Últimos resultados
                </h2>

                {ultimosResultados.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                        Aún no hay partidos con resultado.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {ultimosResultados.map((p) => {
                            const rival = rivales.find(
                                (r) => r.id === p.rivalId,
                            );

                            const torneo = torneos.find(
                                (t) => t.id === p.torneoId,
                            );

                            const fecha = new Date(
                                p.fecha,
                            ).toLocaleDateString("es-MX", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            });

                            const marcador =
                                p.golesFavor !== undefined &&
                                p.golesContra !== undefined
                                    ? p.esLocal
                                        ? `${p.golesFavor} - ${p.golesContra}`
                                        : `${p.golesContra} - ${p.golesFavor}`
                                    : null;

                            return (
                                <Link
                                    key={p.id}
                                    href={`/admin/partidos/${p.id}/editar`}
                                    className="flex items-center justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-900/50 p-3 transition hover:bg-neutral-900"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span
                                            className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-xs font-bold ${RESULTADO_COLOR[p.resultado]}`}
                                        >
                                            {
                                                RESULTADO_BREVE[
                                                    p.resultado
                                                ]
                                            }
                                        </span>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm">
                                                <span className="font-medium">
                                                    {p.esLocal
                                                        ? "AFC Kravitt"
                                                        : rival?.nombre ??
                                                          "—"}
                                                </span>

                                                <span className="text-neutral-500">
                                                    {" "}
                                                    vs{" "}
                                                </span>

                                                <span className="font-medium">
                                                    {p.esLocal
                                                        ? rival?.nombre ??
                                                          "—"
                                                        : "AFC Kravitt"}
                                                </span>

                                                {marcador && (
                                                    <span className="ml-2 text-neutral-300">
                                                        {marcador}
                                                    </span>
                                                )}
                                            </p>

                                            <p className="text-xs text-neutral-500">
                                                {torneo?.nombre ??
                                                    "Sin torneo"}{" "}
                                                · {fecha}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Top goleadores */}
            <section className="space-y-3">
                <h2 className="text-sm uppercase tracking-widest text-neutral-500">
                    Top goleadores
                </h2>

                {topGoleadores.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                        Aún no hay goles registrados.
                    </p>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-neutral-800">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-900 text-xs uppercase tracking-wider text-neutral-400">
                                <tr>
                                    <th className="w-12 px-4 py-2 text-left">
                                        #
                                    </th>

                                    <th className="px-4 py-2 text-left">
                                        Jugador
                                    </th>

                                    <th className="px-4 py-2 text-right">
                                        Goles
                                    </th>

                                    <th className="px-4 py-2 text-right">
                                        PJ
                                    </th>

                                    <th className="px-4 py-2 text-right">
                                        G/PJ
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {topGoleadores.map(
                                    ({ jugador, stats }, i) => (
                                        <tr
                                            key={jugador.id}
                                            className="border-t border-neutral-800 hover:bg-neutral-900/50"
                                        >
                                            <td className="px-4 py-2 text-neutral-500">
                                                {i + 1}
                                            </td>

                                            <td className="px-4 py-2">
                                                <Link
                                                    href={`/admin/jugadores/${jugador.id}`}
                                                    className="flex items-center gap-2 hover:text-orange-300"
                                                >
                                                    {jugador.foto ? (
                                                        <Image
                                                            src={
                                                                jugador.foto
                                                            }
                                                            alt={`${jugador.nombre} ${jugador.apellido}`}
                                                            width={28}
                                                            height={28}
                                                            className="h-7 w-7 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-[10px] text-neutral-500">
                                                            {jugador.nombre
                                                                .charAt(0)
                                                                .toUpperCase()}

                                                            {jugador.apellido
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                    )}

                                                    <span>
                                                        {jugador.nombre}{" "}
                                                        {jugador.apellido}
                                                    </span>
                                                </Link>
                                            </td>

                                            <td className="px-4 py-2 text-right font-semibold">
                                                {stats.goles}
                                            </td>

                                            <td className="px-4 py-2 text-right text-neutral-400">
                                                {
                                                    stats.partidosJugados
                                                }
                                            </td>

                                            <td className="px-4 py-2 text-right text-neutral-400">
                                                {stats.partidosJugados >
                                                0
                                                    ? (
                                                          stats.goles /
                                                          stats.partidosJugados
                                                      ).toFixed(2)
                                                    : "—"}
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Resumen por torneo */}
            <section className="space-y-3">
                <h2 className="text-sm uppercase tracking-widest text-neutral-500">
                    Resumen por torneo
                </h2>

                {torneos.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                        Aún no hay torneos cargados.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {torneos.map((t) => {
                            const partidosTorneo = partidosJugados.filter(
                                (p) => p.torneoId === t.id,
                            );

                            let g = 0;
                            let e = 0;
                            let pd = 0;
                            let gf = 0;
                            let gc = 0;

                            for (const p of partidosTorneo) {
                                const c = clasificar(p);
                                if (c === "G") g++;
                                else if (c === "E") e++;
                                else if (c === "P") pd++;
                                if (p.golesFavor !== undefined) gf += p.golesFavor;
                                if (p.golesContra !== undefined) gc += p.golesContra;
                            }

                            return (
                                <Link
                                    key={t.id}
                                    href={`/admin/torneos/${t.id}/editar`}
                                    className={`block rounded-xl border p-4 transition hover:bg-neutral-900 ${
                                        t.estado === "en_curso"
                                            ? "border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10"
                                            : "border-neutral-800 bg-neutral-900/50"
                                    }`}
                                >
                                    <p className="font-semibold truncate">
                                        {t.nombre}
                                    </p>

                                    <p className="mt-1 text-xs text-neutral-400">
                                        {t.temporada} · {t.categoria} ·{" "}
                                        {t.jugadoresIds.length} jugadores
                                    </p>

                                    {partidosTorneo.length === 0 ? (
                                        <p className="mt-3 text-xs text-neutral-600">
                                            Sin partidos jugados aún.
                                        </p>
                                    ) : (
                                        <div className="mt-3 flex items-center gap-3 text-sm">
                                            <span className="text-emerald-300">
                                                {g}G
                                            </span>
                                            <span className="text-amber-300">
                                                {e}E
                                            </span>
                                            <span className="text-red-300">
                                                {pd}P
                                            </span>
                                            <span className="text-neutral-700">
                                                ·
                                            </span>
                                            <span className="text-neutral-300">
                                                {gf}-{gc}
                                            </span>
                                        </div>
                                    )}

                                    {t.faseAlcanzada && (
                                        <p className="mt-2 text-xs text-orange-300">
                                            Fase actual: {t.faseAlcanzada}
                                        </p>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

function Kpi({
    label,
    valor,
    sub,
    color = "neutral",
    href,
}: {
    label: string;
    valor: number | string;
    sub?: string;
    color?: "neutral" | "emerald" | "amber" | "red";
    href?: string;
}) {
    const colorCls =
        color === "emerald"
            ? "text-emerald-300"
            : color === "amber"
              ? "text-amber-300"
              : color === "red"
                ? "text-red-300"
                : "text-neutral-100";

    const content = (
        <div className="h-full rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
            <p className="text-xs uppercase tracking-wider text-neutral-500">
                {label}
            </p>

            <p className={`mt-1 text-2xl font-semibold ${colorCls}`}>
                {valor}
            </p>

            {sub && (
                <p className="mt-1 truncate text-xs text-neutral-500">
                    {sub}
                </p>
            )}
        </div>
    );

    if (href) {
        return (
            <Link
                href={href}
                className="transition hover:opacity-90"
            >
                {content}
            </Link>
        );
    }

    return content;
}