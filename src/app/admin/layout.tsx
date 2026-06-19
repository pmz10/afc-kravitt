import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { logoutAction } from "./logout/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    await requireAuth();

    return (
        <div className="min-h-screen grid grid-cols-[240px_1fr] bg-neutral-950 text-neutral-100">
            <aside className="border-r border-neutral-800 p-6 space-y-6">
                <div>
                    <p className="text-xs uppercase tracking-widest text-neutral-500">
                        AFC Kravitt
                    </p>
                    <h2 className="text-lg font-semibold">Panel admin</h2>
                </div>
                <nav className="flex flex-col gap-1 text-sm">
                    <Link href="/admin" className="px-3 py-2 rounded-lg hover:bg-neutral-900">
                        Dashboard
                    </Link>
                    <Link href="/admin/jugadores" className="px-3 py-2 rounded-lg hover:bg-neutral-900">
                        Jugadores
                    </Link>
                    {/* Partidos, estadísticas, club… más adelante */}
                </nav>
                <form action={logoutAction} className="mt-auto">
                    <button className="w-full text-left text-sm text-neutral-400 hover:text-neutral-100">
                        Cerrar sesión
                    </button>
                </form>
            </aside>
            <main className="p-8">{children}</main>
        </div>
    );
}