import Link from "next/link";
import { getJugadores } from "@/lib/data";
import type { Posicion } from "@/types";

// Etiquetas legibles por posición
const POSICION_LABEL: Record<Posicion, string> = {
    POR: "Portero",
    DEF: "Defensa",
    MED: "Medio",
    DEL: "Delantero",
};

// Color de chip por posición (estética del club)
const POSICION_COLOR: Record<Posicion, string> = {
    POR: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    DEF: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    MED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    DEL: "bg-orange-500/10 text-orange-400 border-orange-500/30",
};

export default async function JugadoresPage() {
    const jugadores = await getJugadores();
    const activos = jugadores.filter((j) => j.activo).length;

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Jugadores</h1>
                    <p className="text-sm text-neutral-400">
                        {jugadores.length} en total · {activos} activos
                    </p>
                </div>
                <Link
                    href="/admin/jugadores/nuevo"
                    className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-medium text-sm"
                >
                    + Nuevo jugador
                </Link>
            </header>

            {/* Estado vacío */}
            {jugadores.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center">
                    <p className="text-neutral-400">
                        Aún no hay jugadores en el plantel.
                    </p>
                    <Link
                        href="/admin/jugadores/nuevo"
                        className="mt-4 inline-block text-sm text-orange-400 hover:text-orange-300"
                    >
                        Dar de alta al primero →
                    </Link>
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
                                <th className="text-right px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {jugadores.map((j) => (
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
                                        <div className="flex items-center gap-2">
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
                                        </div>
                                        {j.apodo && (
                                            <p className="text-xs text-neutral-500">"{j.apodo}"</p>
                                        )}
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
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={`/admin/jugadores/${j.id}`}
                                            className="text-orange-400 hover:text-orange-300 text-sm"
                                        >
                                            Ver
                                        </Link>
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