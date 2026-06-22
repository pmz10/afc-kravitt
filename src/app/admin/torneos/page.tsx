import Link from "next/link";
import { getTorneos } from "@/lib/data";
import type { EstadoTorneo, TipoTorneo } from "@/types";

const ESTADO_LABEL: Record<EstadoTorneo, string> = {
    proximo: "Próximo",
    en_curso: "En curso",
    finalizado: "Finalizado",
    cancelado: "Cancelado",
};

const ESTADO_COLOR: Record<EstadoTorneo, string> = {
    proximo: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    en_curso: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    finalizado: "bg-neutral-500/10 text-neutral-400 border-neutral-500/30",
    cancelado: "bg-red-500/10 text-red-400 border-red-500/30",
};

const TIPO_LABEL: Record<TipoTorneo, string> = {
    liga: "Liga",
    copa: "Copa",
    amistoso: "Amistoso",
    interno: "Interno",
};

export default async function TorneosPage() {
    const torneos = await getTorneos();

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Torneos</h1>
                    <p className="text-sm text-neutral-400">
                        {torneos.length} competiciones registradas
                    </p>
                </div>
                <Link
                    href="/admin/torneos/nuevo"
                    className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-medium text-sm"
                >
                    + Nuevo torneo
                </Link>
            </header>

            {torneos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center">
                    <p className="text-neutral-400">
                        Aún no hay torneos. Cargá la liga, copa o cuadrangular que estás
                        jugando.
                    </p>
                    <Link
                        href="/admin/torneos/nuevo"
                        className="mt-4 inline-block text-sm text-orange-400 hover:text-orange-300"
                    >
                        Crear el primero →
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {torneos.map((t) => (
                        <Link
                            key={t.id}
                            href={`/admin/torneos/${t.id}/editar`}
                            className="block p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 hover:border-orange-500/30 transition"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <h2 className="font-medium truncate">{t.nombre}</h2>
                                    <p className="text-xs text-neutral-500 mt-0.5">
                                        {t.temporada} · {TIPO_LABEL[t.tipo]} · {t.categoria}
                                        {t.organizador && ` · ${t.organizador}`}
                                    </p>
                                </div>
                                <span
                                    className={`shrink-0 inline-block px-2 py-0.5 rounded-md text-xs border ${ESTADO_COLOR[t.estado]}`}
                                >
                                    {ESTADO_LABEL[t.estado]}
                                </span>
                            </div>
                            {(t.posicionFinal || t.faseAlcanzada) && (
                                <p className="text-xs text-neutral-400 mt-2">
                                    {t.posicionFinal === 1 && "🏆 "}
                                    {t.posicionFinal && `Posición ${t.posicionFinal}`}
                                    {t.posicionFinal && t.faseAlcanzada && " · "}
                                    {t.faseAlcanzada}
                                </p>
                            )}
                            <p className="text-xs text-neutral-500 mt-1">
                                {t.participantes.length} equipos participantes
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}