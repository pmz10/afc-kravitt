import Link from "next/link";
import { getPartidos, getRivales, getTorneos } from "@/lib/data";
import { ZONA_CLUB } from "@/lib/utils";
import type { ResultadoPartido } from "@/types";

const RESULTADO_LABEL: Record<ResultadoPartido, string> = {
    ganado: "Ganado",
    perdido: "Perdido",
    empatado: "Empatado",
    "default-favor": "Default favor",
    "default-contra": "Default contra",
    pendiente: "Pendiente",
};

const RESULTADO_COLOR: Record<ResultadoPartido, string> = {
    ganado: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    perdido: "bg-red-500/10 text-red-400 border-red-500/30",
    empatado: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    "default-favor": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    "default-contra": "bg-red-500/10 text-red-400 border-red-500/30",
    pendiente: "bg-sky-500/10 text-sky-400 border-sky-500/30",
};

type Filtro = "pendientes" | "jugados" | "todos";

export default async function PartidosPage({
    searchParams,
}: {
    searchParams: Promise<{ filtro?: string }>;
}) {
    const { filtro: filtroRaw } = await searchParams;
    const filtro: Filtro =
        filtroRaw === "jugados" || filtroRaw === "todos" ? filtroRaw : "pendientes";

    const [partidos, rivales, torneos] = await Promise.all([
        getPartidos(),
        getRivales(),
        getTorneos(),
    ]);

    const lista =
        filtro === "pendientes"
            ? partidos.filter((p) => p.resultado === "pendiente")
            : filtro === "jugados"
                ? partidos.filter((p) => p.resultado !== "pendiente")
                : partidos;

    const contadores = {
        pendientes: partidos.filter((p) => p.resultado === "pendiente").length,
        jugados: partidos.filter((p) => p.resultado !== "pendiente").length,
        todos: partidos.length,
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Partidos</h1>
                    <p className="text-sm text-neutral-400">
                        {contadores.todos} en total
                    </p>
                </div>
                <Link
                    href="/admin/partidos/nuevo"
                    className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-medium text-sm"
                >
                    + Nuevo partido
                </Link>
            </header>

            <nav className="flex gap-1 border-b border-neutral-800">
                <Tab activo={filtro === "pendientes"} href="/admin/partidos?filtro=pendientes">
                    Pendientes ({contadores.pendientes})
                </Tab>
                <Tab activo={filtro === "jugados"} href="/admin/partidos?filtro=jugados">
                    Jugados ({contadores.jugados})
                </Tab>
                <Tab activo={filtro === "todos"} href="/admin/partidos?filtro=todos">
                    Todos
                </Tab>
            </nav>

            {lista.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center">
                    <p className="text-neutral-400">
                        {filtro === "pendientes" && "Sin partidos pendientes."}
                        {filtro === "jugados" && "Aún no hay partidos con resultado."}
                        {filtro === "todos" && "Sin partidos cargados."}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {lista.map((p) => {
                        const rival = rivales.find((r) => r.id === p.rivalId);
                        const torneo = torneos.find((t) => t.id === p.torneoId);
                        const fechaCorta = new Date(p.fecha).toLocaleString("es-MX", {
                            dateStyle: "medium",
                            timeStyle: "short",
                            timeZone: ZONA_CLUB,
                        });
                        return (
                            <Link
                                key={p.id}
                                href={`/admin/partidos/${p.id}/editar`}
                                className="block p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 hover:border-orange-500/30 transition"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium">
                                                {p.esLocal ? "AFC Kravitt" : rival?.nombre ?? "—"}
                                            </span>
                                            <span className="text-neutral-500 text-sm">vs</span>
                                            <span className="font-medium">
                                                {p.esLocal ? rival?.nombre ?? "—" : "AFC Kravitt"}
                                            </span>
                                            {p.resultado !== "pendiente" &&
                                                p.golesFavor !== undefined &&
                                                p.golesContra !== undefined && (
                                                    <span className="text-sm text-neutral-300 ml-2">
                                                        {p.esLocal
                                                            ? `${p.golesFavor} - ${p.golesContra}`
                                                            : `${p.golesContra} - ${p.golesFavor}`}
                                                    </span>
                                                )}
                                        </div>
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                            {torneo?.nombre ?? "Sin torneo"}
                                            {p.jornada && ` · Jornada ${p.jornada}`} · {fechaCorta}
                                        </p>
                                    </div>
                                    <span
                                        className={`shrink-0 inline-block px-2 py-0.5 rounded-md text-xs border ${RESULTADO_COLOR[p.resultado]}`}
                                    >
                                        {RESULTADO_LABEL[p.resultado]}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function Tab({
    activo,
    href,
    children,
}: {
    activo: boolean;
    href: string;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition ${activo
                    ? "border-orange-500 text-neutral-100"
                    : "border-transparent text-neutral-500 hover:text-neutral-300"
                }`}
        >
            {children}
        </Link>
    );
}