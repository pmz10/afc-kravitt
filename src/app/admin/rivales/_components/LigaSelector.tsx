"use client";

import { useRouter } from "next/navigation";
import type { Torneo } from "@/types";

export function LigaSelector({
    torneos,
    valorActual,
}: {
    torneos: Torneo[];
    valorActual: string;
}) {
    const router = useRouter();

    return (
        <select
            defaultValue={valorActual}
            onChange={(e) => {
                const id = e.target.value;
                router.push(id ? `/admin/rivales?torneo=${id}` : "/admin/rivales");
            }}
            className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-orange-500 focus:outline-none text-sm"
        >
            <option value="">Todas las ligas (agrupado por temporada)</option>
            {torneos.map((t) => (
                <option key={t.id} value={t.id}>
                    {t.nombre} ({t.temporada})
                </option>
            ))}
        </select>
    );
}
