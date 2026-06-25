import { loginAction } from "./actions";

export default function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ from?: string; error?: string }>;
}) {
    return <LoginForm searchParams={searchParams} />;
}

async function LoginForm({
    searchParams,
}: {
    searchParams: Promise<{ from?: string; error?: string }>;
}) {
    const params = await searchParams;
    return (
        <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
            <form
                action={loginAction}
                className="w-full max-w-sm space-y-4 p-8 rounded-2xl border border-neutral-800 bg-neutral-900"
            >
                <h1 className="text-xl font-semibold">Acceso admin</h1>
                <input type="hidden" name="from" value={params.from ?? "/admin"} />
                <input
                    type="email"
                    name="email"
                    required
                    autoComplete="username"
                    placeholder="Correo"
                    className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-orange-500 outline-none"
                />
                <input
                    type="password"
                    name="password"
                    required
                    autoComplete="current-password"
                    placeholder="Contraseña"
                    className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-orange-500 outline-none"
                />
                {params.error && (
                    <p className="text-sm text-red-400">Credenciales inválidas</p>
                )}
                <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-medium"
                >
                    Entrar
                </button>
            </form>
        </main>
    );
}
