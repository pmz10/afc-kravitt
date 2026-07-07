"use client";

import { useState } from "react";
import type { Torneo } from "@/types";

export function CargarPlantillaBoton({ torneos }: { torneos: Torneo[] }) {
    const [mensaje, setMensaje] = useState<string | null>(null);

    function cargar(e: React.MouseEvent<HTMLButtonElement>) {
        const form = e.currentTarget.closest("form");
        if (!form) return;

        const selectTorneo = form.elements.namedItem(
            "torneoId",
        ) as HTMLSelectElement | null;
        const torneo = torneos.find((t) => t.id === selectTorneo?.value);

        if (!torneo) {
            setMensaje("Elegí un torneo arriba primero.");
            return;
        }
        if (torneo.jugadoresIds.length === 0) {
            setMensaje(`${torneo.nombre} no tiene plantilla cargada todavía.`);
            return;
        }

        const checkboxes = form.querySelectorAll<HTMLInputElement>(
            'input[name="convocados"]',
        );
        let marcados = 0;
        checkboxes.forEach((cb) => {
            if (torneo.jugadoresIds.includes(cb.value) && !cb.checked) {
                cb.checked = true;
                marcados++;
            }
        });

        setMensaje(
            marcados > 0
                ? `Se marcaron ${marcados} jugador(es) de la plantilla de ${torneo.nombre}.`
                : "Ya estaban todos marcados.",
        );
    }

    return (
        <div className="md:col-span-2 flex flex-wrap items-center gap-2 -mt-2">
            <button
                type="button"
                onClick={cargar}
                className="text-xs px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-orange-500"
            >
                Cargar plantilla del torneo elegido
            </button>
            {mensaje && <span className="text-xs text-neutral-500">{mensaje}</span>}
        </div>
    );
}
