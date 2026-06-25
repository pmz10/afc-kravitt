import Link from "next/link";
import Image from "next/image";
import { getRivales } from "@/lib/data";

export default async function RivalesPage() {
    const rivales = await getRivales();

    return (
        <div className="space-y-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {rivales.map((r) => (
                        <Link
                            key={r.id}
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
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}