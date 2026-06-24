import Link from "next/link";
import {
    getJugadores,
    getJugadoresRival,
    getRivales,
    getTorneos,
} from "@/lib/data";
import { crearPartido } from "../actions";
import { PartidoForm } from "../_components/PartidoForm";

export default async function NuevoPartidoPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;
    const [torneos, rivales, jugadores, jugadoresRivales] = await Promise.all([
        getTorneos(),
        getRivales(),
        getJugadores(),
        getJugadoresRival(),
    ]);

    const faltaCargar =
        torneos.length === 0 || rivales.length === 0 || jugadores.length === 0;

    return (
        <div className="space-y-6 max-w-4xl">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Nuevo partido</h1>
                    <p className="text-sm text-neutral-400">
                        Datos básicos, resultado, convocatoria y eventos.
                    </p>
                </div>
                <Link
                    href="/admin/partidos"
                    className="text-sm text-neutral-400 hover:text-neutral-100"
                >
                    ← Volver
                </Link>
            </header>

            {error === "campos" && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                    Faltan campos obligatorios (torneo, rival y fecha).
                </p>
            )}

            {faltaCargar && (
                <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 space-y-1">
                    <p>Antes de cargar un partido, asegurate de tener:</p>
                    <ul className="list-disc list-inside ml-2">
                        {torneos.length === 0 && (
                            <li>
                                Al menos un{" "}
                                <Link href="/admin/torneos/nuevo" className="underline">
                                    torneo
                                </Link>
                                .
                            </li>
                        )}
                        {rivales.length === 0 && (
                            <li>
                                Al menos un{" "}
                                <Link href="/admin/rivales/nuevo" className="underline">
                                    rival
                                </Link>
                                .
                            </li>
                        )}
                        {jugadores.length === 0 && (
                            <li>
                                Al menos un{" "}
                                <Link href="/admin/jugadores/nuevo" className="underline">
                                    jugador
                                </Link>
                                .
                            </li>
                        )}
                    </ul>
                </div>
            )}

            <PartidoForm
                action={crearPartido}
                torneos={torneos}
                rivales={rivales}
                jugadores={jugadores}
                jugadoresRivales={jugadoresRivales}
            />
        </div>
    );
}