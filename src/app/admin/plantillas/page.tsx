import Link from "next/link";
import { getTorneos } from "@/lib/data";

export default async function PlantillasPage() {
    const torneos = await getTorneos();

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">Plantillas</h1>
                <p className="text-sm text-neutral-400">
                    Jugadores y equipos rivales de cada torneo, con dorsal específico si
                    aplica.
                </p>
            </header>

            {torneos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center">
                    <p className="text-neutral-400">Todavía no hay torneos cargados.</p>
                    <Link
                        href="/admin/torneos/nuevo"
                        className="mt-4 inline-block text-sm text-orange-400 hover:text-orange-300"
                    >
                        Crear el primero →
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {torneos.map((t) => (
                        <Link
                            key={t.id}
                            href={`/admin/plantillas/${t.id}`}
                            className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 hover:border-orange-500/30 transition"
                        >
                            <p className="font-medium truncate">{t.nombre}</p>
                            <p className="text-xs text-neutral-500 mt-1">
                                {t.temporada} · {t.categoria}
                            </p>
                            <p className="text-xs text-neutral-400 mt-2">
                                {t.jugadoresIds.length} jugadores ·{" "}
                                {t.participantes.length} rivales
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
