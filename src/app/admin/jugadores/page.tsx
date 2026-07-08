import Link from "next/link";
import Image from "next/image";
import { getJugadores, getTorneos } from "@/lib/data";
import type { Jugador, Posicion } from "@/types";

const POSICION_LABEL: Record<Posicion, string> = {
    POR: "Portero",
    DEF: "Defensa",
    MED: "Medio",
    DEL: "Delantero",
};

const POSICION_COLOR: Record<Posicion, string> = {
    POR: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    DEF: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    MED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    DEL: "bg-orange-500/10 text-orange-400 border-orange-500/30",
};

type Filtro = "activos" | "pasaron" | "leyendas" | "todos" | "multitorneo";

function aplicarFiltro(
    lista: Jugador[],
    filtro: Filtro,
    torneosPorJugador: Map<string, string[]>,
): Jugador[] {
    switch (filtro) {
        case "activos":
            return lista.filter((j) => j.activo);
        case "pasaron":
            return lista.filter((j) => !j.activo && !j.esLeyenda);
        case "leyendas":
            return lista.filter((j) => j.esLeyenda);
        case "multitorneo":
            return lista.filter((j) => (torneosPorJugador.get(j.id)?.length ?? 0) >= 2);
        default:
            return lista;
    }
}

export default async function JugadoresPage({
    searchParams,
}: {
    searchParams: Promise<{ filtro?: string; q?: string }>;
}) {
    const { filtro: filtroRaw, q: qRaw } = await searchParams;
    const filtro: Filtro =
        filtroRaw === "pasaron" ||
            filtroRaw === "leyendas" ||
            filtroRaw === "todos" ||
            filtroRaw === "multitorneo"
            ? filtroRaw
            : "activos";
    const q = (qRaw ?? "").trim().toLowerCase();

    const [todos, torneos] = await Promise.all([getJugadores(), getTorneos()]);

    const torneosPorJugador = new Map<string, string[]>();
    for (const t of torneos) {
        for (const jid of t.jugadoresIds) {
            const lista = torneosPorJugador.get(jid) ?? [];
            lista.push(t.nombre);
            torneosPorJugador.set(jid, lista);
        }
    }

    const porFiltro = aplicarFiltro(todos, filtro, torneosPorJugador);
    const lista = q
        ? porFiltro.filter((j) =>
              `${j.nombre} ${j.apellido} ${j.apodo ?? ""} ${j.dorsal}`
                  .toLowerCase()
                  .includes(q),
          )
        : porFiltro;

    const contadores = {
        activos: todos.filter((j) => j.activo).length,
        pasaron: todos.filter((j) => !j.activo && !j.esLeyenda).length,
        leyendas: todos.filter((j) => j.esLeyenda).length,
        todos: todos.length,
        multitorneo: todos.filter((j) => (torneosPorJugador.get(j.id)?.length ?? 0) >= 2)
            .length,
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Jugadores</h1>
                    <p className="text-sm text-neutral-400">
                        {contadores.todos} en total
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/admin/jugadores/enlaces"
                        className="px-4 py-2 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-sm"
                    >
                        Enlaces
                    </Link>
                    <Link
                        href="/admin/jugadores/nuevo"
                        className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-medium text-sm"
                    >
                        + Nuevo jugador
                    </Link>
                </div>
            </header>

            <div className="flex items-center justify-between gap-4 flex-wrap">
                <nav className="flex gap-1 border-b border-neutral-800">
                    <Tab activo={filtro === "activos"} href={`/admin/jugadores?filtro=activos${q ? `&q=${q}` : ""}`}>
                        Activos ({contadores.activos})
                    </Tab>
                    <Tab activo={filtro === "pasaron"} href={`/admin/jugadores?filtro=pasaron${q ? `&q=${q}` : ""}`}>
                        Pasaron por aquí ({contadores.pasaron})
                    </Tab>
                    <Tab activo={filtro === "leyendas"} href={`/admin/jugadores?filtro=leyendas${q ? `&q=${q}` : ""}`}>
                        Leyendas ({contadores.leyendas})
                    </Tab>
                    <Tab activo={filtro === "multitorneo"} href={`/admin/jugadores?filtro=multitorneo${q ? `&q=${q}` : ""}`}>
                        En varios torneos ({contadores.multitorneo})
                    </Tab>
                    <Tab activo={filtro === "todos"} href={`/admin/jugadores?filtro=todos${q ? `&q=${q}` : ""}`}>
                        Todos
                    </Tab>
                </nav>

                <form action="/admin/jugadores" method="get" className="flex items-center gap-2">
                    <input type="hidden" name="filtro" value={filtro} />
                    <input
                        type="search"
                        name="q"
                        defaultValue={q}
                        placeholder="Buscar por nombre o dorsal..."
                        className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-orange-500 focus:outline-none text-sm w-64"
                    />
                </form>
            </div>

            {lista.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center">
                    <p className="text-neutral-400">
                        {q
                            ? "Ningún jugador coincide con la búsqueda."
                            : filtro === "activos"
                                ? "No hay jugadores activos."
                                : filtro === "pasaron"
                                    ? "Aún no hay ex-jugadores."
                                    : filtro === "leyendas"
                                        ? "Todavía no hay leyendas marcadas."
                                        : filtro === "multitorneo"
                                            ? "Nadie está en 2 o más torneos todavía."
                                            : "El plantel está vacío."}
                    </p>
                    {filtro === "activos" && (
                        <Link
                            href="/admin/jugadores/nuevo"
                            className="mt-4 inline-block text-sm text-orange-400 hover:text-orange-300"
                        >
                            Dar de alta al primero →
                        </Link>
                    )}
                </div>
            ) : (
                <div className="rounded-2xl border border-neutral-800 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-neutral-900 text-neutral-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="text-left px-4 py-3 w-16">#</th>
                                <th className="text-left px-4 py-3">Jugador</th>
                                <th className="text-left px-4 py-3">Posición</th>
                                <th className="text-left px-4 py-3">Estado</th>
                                <th className="text-left px-4 py-3">Torneos</th>
                                <th className="text-right px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lista.map((j) => (
                                <tr
                                    key={j.id}
                                    className="border-t border-neutral-800 hover:bg-neutral-900/50 transition"
                                >
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-neutral-800 font-semibold">
                                            {j.dorsal}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {j.foto ? (
                                                <Image
                                                    src={j.foto}
                                                    alt={`${j.nombre} ${j.apellido}`}
                                                    width={36}
                                                    height={36}
                                                    className="rounded-full object-cover w-9 h-9"
                                                />
                                            ) : (
                                                <span className="w-9 h-9 rounded-full bg-neutral-800 inline-flex items-center justify-center text-xs text-neutral-500">
                                                    {j.nombre[0]}
                                                    {j.apellido[0]}
                                                </span>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium">
                                                        {j.nombre} {j.apellido}
                                                    </span>
                                                    {j.capitan && (
                                                        <span
                                                            title="Capitán"
                                                            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-neutral-950 text-[10px] font-bold"
                                                        >
                                                            C
                                                        </span>
                                                    )}
                                                    {j.esLeyenda && (
                                                        <span
                                                            title="Leyenda del club"
                                                            className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 text-[10px] uppercase tracking-wider"
                                                        >
                                                            Leyenda
                                                        </span>
                                                    )}
                                                </div>
                                                {j.apodo && (
                                                    <p className="text-xs text-neutral-500">
                                                        &quot;{j.apodo}&quot;
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded-md text-xs border ${POSICION_COLOR[j.posicion]}`}
                                        >
                                            {POSICION_LABEL[j.posicion]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {j.activo ? (
                                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                Activo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                                                Inactivo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {(() => {
                                            const nombresTorneos = torneosPorJugador.get(j.id) ?? [];
                                            if (nombresTorneos.length === 0) {
                                                return <span className="text-xs text-neutral-600">—</span>;
                                            }
                                            return (
                                                <span
                                                    title={nombresTorneos.join(", ")}
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs border ${nombresTorneos.length >= 2
                                                        ? "bg-orange-500/10 text-orange-300 border-orange-500/30"
                                                        : "bg-neutral-800/50 text-neutral-400 border-neutral-800"
                                                        }`}
                                                >
                                                    {nombresTorneos.length}{" "}
                                                    {nombresTorneos.length === 1 ? "torneo" : "torneos"}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-3">
                                            <Link
                                                href={`/admin/jugadores/${j.id}`}
                                                className="text-neutral-400 hover:text-neutral-100 text-sm"
                                            >
                                                Ver
                                            </Link>
                                            <Link
                                                href={`/admin/jugadores/${j.id}/editar`}
                                                className="text-orange-400 hover:text-orange-300 text-sm"
                                            >
                                                Editar
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
