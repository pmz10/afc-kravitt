"use client";

import { useState } from "react";
import type { Jugador, Torneo } from "@/types";

const selectCls =
    "px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-orange-500 focus:outline-none text-sm";

export interface PlantillaTorneoProps {
    jugadores: Jugador[];
    torneosExistentes: Torneo[];
    seleccionInicial: string[];
}

export function PlantillaTorneo({
    jugadores,
    torneosExistentes,
    seleccionInicial,
}: PlantillaTorneoProps) {
    const [seleccionados, setSeleccionados] = useState<Set<string>>(
        () => new Set(seleccionInicial),
    );
    const [torneoFuente, setTorneoFuente] = useState("");

    const candidatos = torneosExistentes.filter((t) => t.jugadoresIds.length > 0);

    function toggle(id: string) {
        setSeleccionados((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function copiarPlantilla() {
        const fuente = candidatos.find((t) => t.id === torneoFuente);
        if (!fuente) return;
        setSeleccionados((prev) => new Set([...prev, ...fuente.jugadoresIds]));
    }

    const jugadoresOrdenados = [...jugadores].sort((a, b) => a.dorsal - b.dorsal);

    return (
        <div className="md:col-span-2 space-y-3">
            {candidatos.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={torneoFuente}
                        onChange={(e) => setTorneoFuente(e.target.value)}
                        className={selectCls}
                    >
                        <option value="">Copiar plantilla de un torneo existente...</option>
                        {candidatos.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.nombre} ({t.categoria}) · {t.jugadoresIds.length} jugadores
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={copiarPlantilla}
                        disabled={!torneoFuente}
                        className="text-xs px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Aplicar
                    </button>
                    <span className="text-xs text-neutral-500">
                        Suma esos jugadores a la selección actual, no la reemplaza.
                    </span>
                </div>
            )}

            {jugadoresOrdenados.length === 0 ? (
                <p className="text-sm text-neutral-500">
                    No hay jugadores activos para agregar a la plantilla.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto rounded-lg border border-neutral-800 p-3 bg-neutral-950">
                    {jugadoresOrdenados.map((j) => (
                        <label
                            key={j.id}
                            className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-md hover:bg-neutral-900"
                        >
                            <input
                                type="checkbox"
                                name="jugadoresIds"
                                value={j.id}
                                checked={seleccionados.has(j.id)}
                                onChange={() => toggle(j.id)}
                            />
                            <span className="font-mono text-xs text-neutral-500 w-6">
                                {j.dorsal}
                            </span>
                            <span className="truncate">
                                {j.nombre} {j.apellido}
                            </span>
                        </label>
                    ))}
                </div>
            )}
            <p className="text-xs text-neutral-500">
                {seleccionados.size} jugador(es) en la plantilla de este torneo.
            </p>
        </div>
    );
}
