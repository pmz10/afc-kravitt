import Image from "next/image";
import Link from "next/link";
import { getClubConfig } from "@/lib/data";
import { loginAction } from "./actions";
import { PasswordField } from "./_components/PasswordField";

export default function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ from?: string; error?: string; reset?: string }>;
}) {
    return <LoginForm searchParams={searchParams} />;
}

async function LoginForm({
    searchParams,
}: {
    searchParams: Promise<{ from?: string; error?: string; reset?: string }>;
}) {
    const params = await searchParams;
    const club = await getClubConfig().catch(() => null);

    return (
        <main className="min-h-screen relative flex items-center justify-center bg-neutral-950 text-neutral-100 overflow-hidden px-4">
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(circle at 50% 0%, rgba(249,115,22,0.14), transparent 55%)",
                }}
            />
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />

            <Link
                href="/"
                className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-100 transition z-10"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Volver al sitio
            </Link>

            <form
                action={loginAction}
                className="relative z-10 w-full max-w-sm space-y-5 p-8 rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm shadow-2xl shadow-black/40"
            >
                <div className="flex flex-col items-center gap-3 text-center">
                    {club?.escudoOriginal ? (
                        <Image
                            src={club.escudoOriginal}
                            alt={club.nombre}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-contain"
                        />
                    ) : (
                        <span className="w-16 h-16 rounded-xl bg-neutral-800 inline-flex items-center justify-center text-lg text-neutral-500 font-semibold">
                            AK
                        </span>
                    )}
                    <div>
                        <h1 className="text-xl font-semibold">Panel admin</h1>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            {club?.nombreCorto ?? "AFC Kravitt"}
                        </p>
                    </div>
                </div>

                <input type="hidden" name="from" value={params.from ?? "/admin"} />

                <div className="space-y-3">
                    <input
                        type="email"
                        name="email"
                        required
                        autoComplete="username"
                        placeholder="Correo"
                        className="w-full px-3 py-2.5 rounded-lg bg-neutral-800/80 border border-neutral-700 focus:border-orange-500 outline-none text-sm transition"
                    />
                    <PasswordField
                        name="password"
                        placeholder="Contraseña"
                        autoComplete="current-password"
                    />
                </div>

                <div className="flex justify-end -mt-2">
                    <Link
                        href="/login/recuperar"
                        className="text-xs text-neutral-500 hover:text-orange-300 transition"
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>

                {params.error && (
                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                        Credenciales inválidas.
                    </p>
                )}
                {params.reset === "1" && (
                    <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                        Contraseña actualizada. Iniciá sesión con tu nueva contraseña.
                    </p>
                )}

                <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-medium transition"
                >
                    Entrar
                </button>
            </form>
        </main>
    );
}
