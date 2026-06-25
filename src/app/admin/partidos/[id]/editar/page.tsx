import Link from "next/link";
import { notFound } from "next/navigation";
import {
    getJugadores,
    getJugadoresRival,
    getPartido,
    getRivales,
    getTorneos,
} from "@/lib/data";
import { editarPartido, eliminarPartido } from "../../actions";
import { PartidoForm } from "../../_components/PartidoForm";

export default async function EditarPartidoPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ error?: string }>;
}) {
    const { id } = await params;
    const { error } = await searchParams;

    const [partido, torneos, rivales, jugadores, jugadoresRivales] =
        await Promise.all([
            getPartido(id),
            getTorneos(),
            getRivales(),
            getJugadores(),
            getJugadoresRival(),
        ]);

    if (!partido) notFound();

    const rival = rivales.find((r) => r.id === partido.rivalId);
    const torneo = torneos.find((t) => t.id === partido.torneoId);

    return (
        <div className="space-y-6 max-w-4xl">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Editar partido vs {rival?.nombre ?? "—"}
                    </h1>
                    <p className="text-sm text-neutral-400">
                        {torneo?.nombre ?? "Sin torneo"}
                        {partido.jornada && ` · Jornada ${partido.jornada}`}
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
                    Faltan campos obligatorios.
                </p>
            )}

            <PartidoForm
                action={editarPartido}
                torneos={torneos}
                rivales={rivales}
                jugadores={jugadores}
                jugadoresRivales={jugadoresRivales}
                partido={partido}
            />

            <section className="pt-8 border-t border-neutral-800">
                <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-3">
                    Zona peligrosa
                </h2>
                <form action={eliminarPartido}>
                    <input type="hidden" name="id" value={partido.id} />
                    <button
                        type="submit"
                        className="text-xs px-3 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30"
                    >
                        Eliminar partido permanentemente
                    </button>
                    <p className="text-xs text-neutral-500 mt-2">
                        Borra el partido y sus eventos. Las stats derivadas dejarán de
                        contarlo automáticamente.
                    </p>
                </form>
            </section>
        </div>
    );
}