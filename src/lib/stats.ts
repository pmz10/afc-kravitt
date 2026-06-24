// =====================================================
// Stats derivadas — funciones puras que cruzan jugadores
// con partidos/eventos para calcular números reales.
// =====================================================

import type {
    Jugador,
    Partido,
    StatsAgregadas,
    StatsCarryOver,
    Torneo,
} from "@/types";
import { estaActivoEn } from "@/lib/utils";

const STATS_VACIAS: StatsAgregadas = {
    partidosJugados: 0,
    goles: 0,
    asistencias: 0,
    amarillas: 0,
    rojas: 0,
    autogoles: 0,
};

function aggDeCarry(carry: StatsCarryOver): StatsAgregadas {
    return {
        partidosJugados: carry.partidosJugados,
        goles: carry.goles,
        asistencias: carry.asistencias,
        amarillas: carry.amarillas,
        rojas: carry.rojas,
        autogoles: 0,
    };
}

function sumar(a: StatsAgregadas, b: StatsAgregadas): StatsAgregadas {
    return {
        partidosJugados: a.partidosJugados + b.partidosJugados,
        goles: a.goles + b.goles,
        asistencias: a.asistencias + b.asistencias,
        amarillas: a.amarillas + b.amarillas,
        rojas: a.rojas + b.rojas,
        autogoles: a.autogoles + b.autogoles,
    };
}

// Stats derivadas SOLO de partidos cargados (sin carry-over)
function statsDePartidos(
    jugadorId: string,
    partidos: Partido[],
): StatsAgregadas {
    let s: StatsAgregadas = { ...STATS_VACIAS };
    for (const p of partidos) {
        if (p.resultado === "pendiente") continue;
        if (p.convocados.includes(jugadorId)) s.partidosJugados += 1;
        for (const ev of p.eventos) {
            if (!("jugadorId" in ev) || ev.jugadorId !== jugadorId) continue;
            switch (ev.tipo) {
                case "gol":
                case "penal_anotado":
                    s.goles += 1;
                    break;
                case "asistencia":
                    s.asistencias += 1;
                    break;
                case "amarilla":
                    s.amarillas += 1;
                    break;
                case "roja":
                    s.rojas += 1;
                    break;
                case "autogol":
                    s.autogoles += 1;
                    break;
                // penal_fallado no afecta el conteo de goles
            }
        }
    }
    return s;
}

// Stats totales del jugador (todas las temporadas, todos los torneos)
export function getStatsJugador(
    jugador: Jugador,
    partidos: Partido[],
): StatsAgregadas {
    let total = statsDePartidos(jugador.id, partidos);

    if (jugador.carryOver) {
        total = sumar(total, aggDeCarry(jugador.carryOver));
    }
    if (jugador.carryOverPorTorneo) {
        for (const c of jugador.carryOverPorTorneo) {
            total = sumar(total, aggDeCarry(c));
        }
    }
    return total;
}

// Stats del jugador en un torneo específico
export function getStatsJugadorEnTorneo(
    jugador: Jugador,
    torneoId: string,
    partidos: Partido[],
): StatsAgregadas {
    const partidosTorneo = partidos.filter((p) => p.torneoId === torneoId);
    let total = statsDePartidos(jugador.id, partidosTorneo);

    const carry = jugador.carryOverPorTorneo?.find(
        (c) => c.torneoId === torneoId,
    );
    if (carry) total = sumar(total, aggDeCarry(carry));

    return total;
}

// Desglose por torneo: todos los torneos donde el jugador participó
// (sea por convocatoria en partido cargado o por carry-over)
export function getDesglosePorTorneo(
    jugador: Jugador,
    partidos: Partido[],
    torneos: Torneo[],
): { torneo: Torneo; stats: StatsAgregadas }[] {
    const torneoIds = new Set<string>();
    for (const p of partidos) {
        if (p.convocados.includes(jugador.id)) torneoIds.add(p.torneoId);
    }
    for (const c of jugador.carryOverPorTorneo ?? []) {
        torneoIds.add(c.torneoId);
    }

    return Array.from(torneoIds)
        .map((tid) => torneos.find((t) => t.id === tid))
        .filter((t): t is Torneo => !!t)
        .map((t) => ({
            torneo: t,
            stats: getStatsJugadorEnTorneo(jugador, t.id, partidos),
        }))
        .sort((a, b) => b.torneo.temporada.localeCompare(a.torneo.temporada));
}

// Cuenta de MVPs designados al jugador
export function getMVPCount(jugadorId: string, partidos: Partido[]): number {
    return partidos.filter((p) => p.mvpId === jugadorId).length;
}

// Cuenta de temporadas distintas en las que participó
export function getTemporadasParticipadas(
    jugador: Jugador,
    partidos: Partido[],
    torneos: Torneo[],
): Set<string> {
    const temporadas = new Set<string>();
    const desglose = getDesglosePorTorneo(jugador, partidos, torneos);
    for (const { torneo } of desglose) temporadas.add(torneo.temporada);
    return temporadas;
}

// Cuenta de torneos ganados por el club mientras el jugador estaba activo
export function getTorneosGanadosConJugador(
    jugador: Jugador,
    torneos: Torneo[],
): Torneo[] {
    return torneos.filter((t) => {
        if (t.posicionFinal !== 1 || t.estado !== "finalizado") return false;
        const fechaRef = t.fechaFin ?? t.fechaInicio;
        if (!fechaRef) return false;
        return estaActivoEn(jugador, fechaRef);
    });
}

// Cuenta de temporadas como capitán (proxy simple: si capitan=true al menos
// jugó una temporada como tal. UI más rica vendrá si separamos por temporada).
export function getTemporadasComoCapitan(jugador: Jugador): number {
    return jugador.capitan ? 1 : 0;
}

// -----------------------------------------------------
// Criterios de leyenda (umbrales amateur)
// -----------------------------------------------------
export interface CriterioLeyenda {
    clave: string;
    etiqueta: string;
    umbral: string;
    cumple: boolean;
    valorActual: string;
}

export function evaluarCriteriosLeyenda(
    jugador: Jugador,
    partidos: Partido[],
    torneos: Torneo[],
): CriterioLeyenda[] {
    const total = getStatsJugador(jugador, partidos);
    const temporadas = getTemporadasParticipadas(jugador, partidos, torneos).size;
    const titulos = getTorneosGanadosConJugador(jugador, torneos).length;
    const cap = getTemporadasComoCapitan(jugador);
    const mvps = getMVPCount(jugador.id, partidos);

    return [
        {
            clave: "partidos",
            etiqueta: "Partidos jugados",
            umbral: "≥ 100",
            cumple: total.partidosJugados >= 100,
            valorActual: String(total.partidosJugados),
        },
        {
            clave: "temporadas",
            etiqueta: "Temporadas en el club",
            umbral: "≥ 3",
            cumple: temporadas >= 3,
            valorActual: String(temporadas),
        },
        {
            clave: "titulos",
            etiqueta: "Títulos ganados",
            umbral: "≥ 1",
            cumple: titulos >= 1,
            valorActual: String(titulos),
        },
        {
            clave: "capitania",
            etiqueta: "Temporadas como capitán",
            umbral: "≥ 2",
            cumple: cap >= 2,
            valorActual: String(cap),
        },
        {
            clave: "mvp",
            etiqueta: "MVPs del partido recibidos",
            umbral: "≥ 1",
            cumple: mvps >= 1,
            valorActual: String(mvps),
        },
    ];
}