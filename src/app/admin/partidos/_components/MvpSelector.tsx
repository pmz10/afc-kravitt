"use client";

import type { Jugador, Torneo } from "@/types";
import { useTorneoSeleccionado } from "./TorneoContext";

const inputCls =
    "w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-orange-500 focus:outline-none text-sm";

export function MvpSelector({
    jugadores,
    torneos,
    defaultMvpId,
}: {
    jugadores: Jugador[];
    torneos: Torneo[];
    defaultMvpId: string;
}) {
    const { torneoId } = useTorneoSeleccionado();
    const torneo = torneos.find((t) => t.id === torneoId);
    const plantillaIds = new Set(torneo?.jugadoresIds ?? []);
    const hayPlantilla = plantillaIds.size > 0;

    const candidatos = jugadores
        .filter((j) => !hayPlantilla || plantillaIds.has(j.id) || j.id === defaultMvpId)
        .sort((a, b) => a.dorsal - b.dorsal);

    return (
        <select name="mvpId" defaultValue={defaultMvpId} className={inputCls}>
            <option value="">— sin elegir —</option>
            {candidatos.map((j) => (
                <option key={j.id} value={j.id}>
                    #{j.dorsal} {j.nombre} {j.apellido}
                </option>
            ))}
        </select>
    );
}
