"use client";

import type { Jugador, Torneo } from "@/types";
import { useTorneoSeleccionado } from "./TorneoContext";

export interface ConvocatoriaSelectorProps {
    jugadores: Jugador[];
    torneos: Torneo[];
    convocadosIniciales: string[];
    titularesIniciales: string[];
}

export function ConvocatoriaSelector({
    jugadores,
    torneos,
    convocadosIniciales,
    titularesIniciales,
}: ConvocatoriaSelectorProps) {
    const { torneoId } = useTorneoSeleccionado();

    if (!torneoId) {
        return (
            <p className="md:col-span-2 text-sm text-neutral-500">
                Elegí un torneo arriba para ver su plantilla.
            </p>
        );
    }

    const torneo = torneos.find((t) => t.id === torneoId);
    const plantillaIds = new Set(torneo?.jugadoresIds ?? []);
    const usaPlantilla = plantillaIds.size > 0;

    const candidatos = jugadores
        .filter(
            (j) => !usaPlantilla || plantillaIds.has(j.id) || convocadosIniciales.includes(j.id),
        )
        .sort((a, b) => a.dorsal - b.dorsal);

    return (
        <div className="md:col-span-2 space-y-2">
            {!usaPlantilla && (
                <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                    Este torneo todavía no tiene plantilla cargada — mostrando todos los
                    jugadores activos. Cargala en Plantillas para filtrar automáticamente
                    la próxima vez.
                </p>
            )}
            {candidatos.length === 0 ? (
                <p className="text-sm text-neutral-500">
                    No hay jugadores en la plantilla de este torneo todavía.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto rounded-lg border border-neutral-800 p-3 bg-neutral-950">
                    {candidatos.map((j) => {
                        const dorsal = torneo?.dorsalesPorJugador[j.id] ?? j.dorsal;
                        return (
                            <div
                                key={j.id}
                                className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-md hover:bg-neutral-900"
                            >
                                <label className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="convocados"
                                        value={j.id}
                                        defaultChecked={convocadosIniciales.includes(j.id)}
                                    />
                                    <span className="font-mono text-xs text-neutral-500 w-6">
                                        {dorsal}
                                    </span>
                                    <span className="truncate">
                                        {j.nombre} {j.apellido}
                                    </span>
                                </label>
                                <label className="flex items-center gap-1 text-xs text-neutral-500 shrink-0 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="titulares"
                                        value={j.id}
                                        defaultChecked={titularesIniciales.includes(j.id)}
                                    />
                                    Titular
                                </label>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
