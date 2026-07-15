import Link from "next/link";
import { solicitarRecuperacionAction } from "./actions";

export default async function RecuperarPage({
    searchParams,
}: {
    searchParams: Promise<{ enviado?: string; error?: string }>;
}) {
    const { enviado, error } = await searchParams;

    return (
        <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4">
            <div className="w-full max-w-sm space-y-4 p-8 rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm shadow-2xl shadow-black/40">
                <h1 className="text-xl font-semibold">Recuperar contraseña</h1>
                <p className="text-sm text-neutral-400">
                    Ingresá tu correo y, si tiene acceso al panel, te mandamos un enlace
                    para elegir una contraseña nueva.
                </p>

                {enviado === "1" ? (
                    <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                        Si el correo tiene acceso, te llegará un enlace en unos minutos.
                        Revisá también la carpeta de spam.
                    </p>
                ) : (
                    <form action={solicitarRecuperacionAction} className="space-y-4">
                        <input
                            type="email"
                            name="email"
                            required
                            autoComplete="username"
                            placeholder="Correo"
                            className="w-full px-3 py-2.5 rounded-lg bg-neutral-800/80 border border-neutral-700 focus:border-orange-500 outline-none text-sm transition"
                        />
                        {error === "1" && (
                            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                                Ingresá un correo válido.
                            </p>
                        )}
                        <button
                            type="submit"
                            className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-medium transition"
                        >
                            Enviar enlace
                        </button>
                    </form>
                )}

                <Link
                    href="/login"
                    className="inline-block text-sm text-neutral-500 hover:text-neutral-300 transition"
                >
                    ← Volver a iniciar sesión
                </Link>
            </div>
        </main>
    );
}
