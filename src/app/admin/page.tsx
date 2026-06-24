import Link from "next/link";
import Image from "next/image";
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
    "default-favor": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
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
    const partidosJugados = partidos.filter((p) => p.resultado !== "pendiente");
    const partidosPendientes = partidos.filter((p) => p.resultado === "pendiente");
    const torneoEnCurso = torneos.find((t) => t.estado === "en_curso");

    // Récord W-D-L y goles
    let ganados = 0;
    let empatados = 0;
    let perdidos = 0;
    let golesFavor = 0;
    let golesContra = 0;
    for (const p of partidosJugados) {
        const c = clasificar(p);
        if (c === "G") ganados++;
        else if (c === "E") empatados++;
        else if (c === "P") perdidos++;
        if (p.golesFavor !== undefined) golesFavor += p.golesFavor;
        if (p.golesContra !== undefined) golesContra += p.golesContra;
    }

    // Próximo partido
    const ahora = Date.now();
    const proximoPartido = partidos
        .filter(
            (p) =>
                p.resultado === "pendiente" && new Date(p.fecha).getTime() > ahora,
        )
        .sort(
            (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
        )[0];

    // Últimos resultados (los 5 más recientes con resultado)
    const ultimosResultados = [...partidosJugados]
        .sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
        )
        .slice(0, 5);

    // Top goleadores (top 5 por goles totales)
    const topGoleadores = jugadores
        .map((j) => ({
            jugador: j,
            stats: getStatsJugador(j, partidos),
        }))
        .filter((x) => x.stats.goles > 0)
        .sort((a, b) => b.stats.goles - a.stats.goles)
        .slice(0, 5);

    // Racha actual (últimos 5 partidos: GGEPP, etc.)
    const racha = ultimosResultados
        .map((p) => clasificar(p))
        .filter((c): c is "G" | "E" | "P" => c !== null)
        .reverse(); // de izquierda (más viejo) a derecha (más reciente)

    return (
        <div className="space-y-8 max-w-6xl">
            <header>
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="text-sm text-neutral-400">Resumen del club AFC Kravitt</p>
            </header>

            {/* KPIs principales */}
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
                <Kpi label="Ganados" valor={ganados} color="emerald" />
                <Kpi label="Empatados" valor={empatados} color="amber" />
                <Kpi label="Perdidos" valor={perdidos} color="red" />
            </section>

            {/* Goles + racha */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                    <p className="text-xs uppercase tracking-wider text-neutral-500">
                        Goles
                    </p>
                    <div className="flex items-baseline gap-3 mt-2">
                        <span className="text-3xl font-semibold text-emerald-300">
                            {golesFavor}
                        </span>
                        <span className="text-neutral-500">a favor</span>
                        <span className="text-neutral-700">·</span>
                        <span className="text-3xl font-semibold text-red-300">
                            {golesContra}
                        </span>
                        <span className="text-neutral-500">en contra</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                        Diferencia: {golesFavor - golesContra >= 0 ? "+" : ""}
                        {golesFavor - golesContra}
                    </p>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                    <p className="text-xs uppercase tracking-wider text-neutral-500">
                        Últimos 5 resultados
                    </p>
                    <div className="flex gap-1.5 mt-3">
                        {racha.length === 0 ? (
                            <span className="text-sm text-neutral-500">Sin datos aún</span>
                        ) : (
                            racha.map((r, i) => (
                                <span
                                    key={i}
                                    className={`inline-flex items-center justify-center w-8 h-8 rounded-md border text-sm font-semibold ${r === "G"
                                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                            : r === "E"
                                                ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                                : "bg-red-500/15 text-red-300 border-red-500/30"
                                        }`}
                                >
                                    {r}
                                </span>
                            ))
                        )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-3">
                        De izquierda (más antiguo) a derecha (más reciente).
                    </p>
                </div>
            </section>

            {/* Próximo partido */}
            {proximoPartido && (
                <section className="space-y-3">
                    <h2 className="text-sm uppercase tracking-widest text-neutral-500">
                        Próximo partido
                    </h2>
                    {(() => {
                        const rival = rivales.find((r) => r.id === proximoPartido.rivalId);
                        const torneo = torneos.find(
                            (t) => t.id === proximoPartido.torneoId,
                        );
                        const fecha = new Date(proximoPartido.fecha).toLocaleString(
                            "es-MX",
                            { dateStyle: "full", timeStyle: "short" },
                        );
                        return (
                            <Link
                                href={`/admin/partidos/${proximoPartido.id}/editar`}
                                className="block p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 hover:border-orange-500/30 transition"
                            >
                                <div className="flex items-center gap-4">
                                    {rival?.escudo && (
                                        <Image
                                            src={rival.escudo}
                                            alt={rival.nombre}
                                            width={56}
                                            height={56}
                                            className="rounded-lg object-cover w-14 h-14"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base">
                                            <span className="font-semibold">
                                                {proximoPartido.esLocal
                                                    ? "AFC Kravitt"
                                                    : rival?.nombre ?? "—"}
                                            </span>
                                            <span className="text-neutral-500"> vs </span>
                                            <span className="font-semibold">
                                                {proximoPartido.esLocal
                                                    ? rival?.nombre ?? "—"
                                                    : "AFC Kravitt"}
                                            </span>
                                        </p>
                                        <p className="text-xs text-neutral-500 mt-1">
                                            {torneo?.nombre ?? "Sin torneo"}
                                            {proximoPartido.jornada &&
                                                ` · Jornada ${proximoPartido.jornada}`}
                                            {proximoPartido.sede && ` · ${proximoPartido.sede}`}
                                        </p>
                                        <p className="text-sm text-orange-300 mt-1">{fecha}</p>
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
                            const rival = rivales.find((r) => r.id === p.rivalId);
                            const torneo = torneos.find((t) => t.id === p.torneoId);
                            const fecha = new Date(p.fecha).toLocaleDateString("es-MX", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            });
                            const marcador =
                                p.golesFavor !== undefined && p.golesContra !== undefined
                                    ? p.esLocal
                                        ? `${p.golesFavor} - ${p.golesContra}`
                                        : `${p.golesContra} - ${p.golesFavor}`
                                    : null;
                            return (
                                <Link
                                    key={p.id}
                                    href={`/admin/partidos/${p.id}/editar`}
                                    className="flex items-center justify-between gap-4 p-3 rounded-lg border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 transition"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span
                                            className={`inline-flex items-center justify-center w-8 h-8 rounded-md border text-xs font-bold ${RESULTADO_COLOR[p.resultado]}`}
                                        >
                                            {RESULTADO_BREVE[p.resultado]}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-sm truncate">
                                                <span className="font-medium">
                                                    {p.esLocal ? "AFC Kravitt" : rival?.nombre ?? "—"}
                                                </span>
                                                <span className="text-neutral-500"> vs </span>
                                                <span className="font-medium">
                                                    {p.esLocal ? rival?.nombre ?? "—" : "AFC Kravitt"}
                                                </span>
                                                {marcador && (
                                                    <span className="ml-2 text-neutral-300">
                                                        {marcador}
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                {torneo?.nombre} · {fecha}
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
                    <div className="rounded-xl border border-neutral-800 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-900 text-neutral-400 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="text-left px-4 py-2 w-12">#</th>
                                    <th className="text-left px-4 py-2">Jugador</th>
                                    <th className="text-right px-4 py-2">Goles</th>
                                    <th className="text-right px-4 py-2">PJ</th>
                                    <th className="text-right px-4 py-2">G/PJ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topGoleadores.map(({ jugador, stats }, i) => (
                                    <tr
                                        key={jugador.id}
                                        className="border-t border-neutral-800 hover:bg-neutral-900/50"
                                    >
                                        <td className="px-4 py-2 text-neutral-500">{i + 1}</td>
                                        <td className="px-4 py-2">
                                            <Link
                                                href={`/admin/jugadores/${jugador.id}`}
                                                className="flex items-center gap-2 hover:text-orange-300"
                                            >
                                                {jugador.foto ? (
                                                    <Image
                                                        src={jugador.foto}
                                                        alt={jugador.nombre}
                                                        width={28}
                                                        height={28}
                                                        className="rounded-full object-cover w-7 h-7"
                                                    />
                                                ) : (
                                                    <span className="w-7 h-7 rounded-full bg-neutral-800 inline-flex items-center justify-center text-[10px] text-neutral-500">
                                                        {jugador.nombre[0]}
                                                        {jugador.apellido[0]}
                                                    </span>
                                                )}
                                                <span>
                                                    {jugador.nombre} {jugador.apellido}
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-2 text-right font-semibold">
                                            {stats.goles}
                                        </td>
                                        <td className="px-4 py-2 text-right text-neutral-400">
                                            {stats.partidosJugados}
                                        </td>
                                        <td className="px-4 py-2 text-right text-neutral-400">
                                            {stats.partidosJugados > 0
                                                ? (stats.goles / stats.partidosJugados).toFixed(2)
                                                : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Torneo en curso (si hay) */}
            {torneoEnCurso && (
                <section className="space-y-3">
                    <h2 className="text-sm uppercase tracking-widest text-neutral-500">
                        Torneo en curso
                    </h2>
                    <Link
                        href={`/admin/torneos/${torneoEnCurso.id}/editar`}
                        className="block p-5 rounded-xl border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 transition"
                    >
                        <p className="font-semibold">{torneoEnCurso.nombre}</p>
                        <p className="text-xs text-neutral-400 mt-1">
                            {torneoEnCurso.temporada} · {torneoEnCurso.categoria} ·{" "}
                            {torneoEnCurso.participantes.length} equipos
                        </p>
                        {torneoEnCurso.faseAlcanzada && (
                            <p className="text-xs text-orange-300 mt-2">
                                Fase actual: {torneoEnCurso.faseAlcanzada}
                            </p>
                        )}
                    </Link>
                </section>
            )}
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
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 h-full">
            <p className="text-xs uppercase tracking-wider text-neutral-500">
                {label}
            </p>
            <p className={`text-2xl font-semibold mt-1 ${colorCls}`}>{valor}</p>
            {sub && <p className="text-xs text-neutral-500 mt-1 truncate">{sub}</p>}
        </div>
    );
    if (href) {
        return (
            <Link href={href} className="hover:opacity-90 transition">
                {content}
            </Link>
        );
    }
    return content;
}