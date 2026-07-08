"use client";

import type { Rival, Torneo } from "@/types";
import { useTorneoSeleccionado } from "./TorneoContext";

const inputCls =
    "w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-orange-500 focus:outline-none text-sm";

export interface TorneoRivalSelectProps {
    torneos: Torneo[];
    rivales: Rival[];
    defaultRivalId: string;
}

export function TorneoRivalSelect({
    torneos,
    rivales,
    defaultRivalId,
}: TorneoRivalSelectProps) {
    const { torneoId, setTorneoId } = useTorneoSeleccionado();

    const torneo = torneos.find((t) => t.id === torneoId);
    const idsDelTorneo = new Set(torneo?.participantes ?? []);
    const rivalesDelTorneo = rivales.filter((r) => idsDelTorneo.has(r.id));
    const hayGrupo = rivalesDelTorneo.length > 0;
    const resto = hayGrupo ? rivales.filter((r) => !idsDelTorneo.has(r.id)) : rivales;

    return (
        <>
            <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-wider text-neutral-400">
                    Torneo *
                </span>
                <select
                    name="torneoId"
                    required
                    value={torneoId}
                    onChange={(e) => setTorneoId(e.target.value)}
                    className={inputCls}
                >
                    <option value="" disabled>
                        Elegí torneo
                    </option>
                    {torneos.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.nombre} ({t.temporada})
                        </option>
                    ))}
                </select>
            </label>

            <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-wider text-neutral-400">
                    Rival *
                </span>
                <select
                    name="rivalId"
                    required
                    defaultValue={defaultRivalId}
                    className={inputCls}
                >
                    <option value="" disabled>
                        Elegí rival
                    </option>
                    {hayGrupo && (
                        <optgroup label="Rivales de este torneo">
                            {rivalesDelTorneo.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.nombre}
                                </option>
                            ))}
                        </optgroup>
                    )}
                    <optgroup label={hayGrupo ? "Otros rivales" : "Todos los rivales"}>
                        {resto.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.nombre}
                            </option>
                        ))}
                    </optgroup>
                </select>
            </label>
        </>
    );
}
