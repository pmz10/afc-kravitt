import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { actualizarContrasenaAction } from "./actions";
import { PasswordField } from "../_components/PasswordField";

export default async function RestablecerPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const sesionValida = Boolean(data?.claims?.sub);

    return (
        <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4">
            <div className="w-full max-w-sm space-y-4 p-8 rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm shadow-2xl shadow-black/40">
                <h1 className="text-xl font-semibold">Nueva contraseña</h1>

                {!sesionValida ? (
                    <>
                        <p className="text-sm text-neutral-400">
                            El enlace no es válido o ya expiró.
                        </p>
                        <Link
                            href="/login/recuperar"
                            className="inline-block text-sm text-orange-400 hover:text-orange-300"
                        >
                            Pedir un enlace nuevo →
                        </Link>
                    </>
                ) : (
                    <form action={actualizarContrasenaAction} className="space-y-4">
                        <p className="text-sm text-neutral-400">
                            Elegí una contraseña nueva para tu cuenta de admin (mínimo 8
                            caracteres).
                        </p>
                        <PasswordField
                            name="password"
                            placeholder="Nueva contraseña"
                            autoComplete="new-password"
                            minLength={8}
                        />
                        <PasswordField
                            name="confirmar"
                            placeholder="Confirmar contraseña"
                            autoComplete="new-password"
                            minLength={8}
                        />
                        {error === "corta" && (
                            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                                La contraseña debe tener al menos 8 caracteres.
                            </p>
                        )}
                        {error === "coincide" && (
                            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                                Las contraseñas no coinciden.
                            </p>
                        )}
                        {error === "fallo" && (
                            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                                No se pudo actualizar. Probá pedir un enlace nuevo.
                            </p>
                        )}
                        <button
                            type="submit"
                            className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-medium transition"
                        >
                            Guardar contraseña
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
}
