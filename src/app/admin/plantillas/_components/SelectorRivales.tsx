"use client";

import { useState } from "react";
import type { Rival, Torneo } from "@/types";

const selectCls =
    "px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-orange-500 focus:outline-none text-sm";

export interface SelectorRivalesProps {
    rivales: Rival[];
    torneosExistentes: Torneo[];
    seleccionInicial: string[];
}

export function SelectorRivales({
    rivales,
    torneosExistentes,
    seleccionInicial,
}: SelectorRivalesProps) {
    const [seleccionados, setSeleccionados] = useState<Set<string>>(
        () => new Set(seleccionInicial),
    );
    const [torneoFuente, setTorneoFuente] = useState("");

    const candidatos = torneosExistentes.filter((t) => t.participantes.length > 0);

    function toggle(id: string) {
        setSeleccionados((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function copiar() {
        const fuente = candidatos.find((t) => t.id === torneoFuente);
        if (!fuente) return;
        setSeleccionados((prev) => new Set([...prev, ...fuente.participantes]));
    }

    return (
        <div className="md:col-span-2 space-y-3">
            {candidatos.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={torneoFuente}
                        onChange={(e) => setTorneoFuente(e.target.value)}
                        className={selectCls}
                    >
                        <option value="">Copiar equipos de un torneo existente...</option>
                        {candidatos.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.nombre} ({t.categoria}) · {t.participantes.length} equipos
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={copiar}
                        disabled={!torneoFuente}
                        className="text-xs px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Aplicar
                    </button>
                    <span className="text-xs text-neutral-500">
                        Suma a la selección actual, no la reemplaza.
                    </span>
                </div>
            )}

            {rivales.length === 0 ? (
                <p className="text-sm text-neutral-500">No hay rivales para agregar.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto rounded-lg border border-neutral-800 p-3 bg-neutral-950">
                    {rivales.map((r) => (
                        <label
                            key={r.id}
                            className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-md hover:bg-neutral-900"
                        >
                            <input
                                type="checkbox"
                                name="participantes"
                                value={r.id}
                                checked={seleccionados.has(r.id)}
                                onChange={() => toggle(r.id)}
                            />
                            <span className="truncate">{r.nombre}</span>
                        </label>
                    ))}
                </div>
            )}
            <p className="text-xs text-neutral-500">
                {seleccionados.size} equipo(s) participante(s).
            </p>
        </div>
    );
}
