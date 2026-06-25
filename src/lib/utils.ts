// =====================================================
// Utilidades compartidas del proyecto
// =====================================================

import type { Jugador, PeriodoEnClub } from "@/types";

// -----------------------------------------------------
// IDs
// -----------------------------------------------------
// Genera ids cortos legibles tipo "lp9k8m3a7q5".
// Suficiente para nuestra escala (centenas de entidades).
// Si en el futuro escala mucho, migrar a crypto.randomUUID().
export function generateId(prefix?: string): string {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 8);
    const raw = `${ts}${rand}`;
    return prefix ? `${prefix}_${raw}` : raw;
}

// -----------------------------------------------------
// Fechas
// -----------------------------------------------------
// Convención del proyecto: todas las fechas se guardan como string ISO 8601
// ("2026-06-18" o "2026-06-18T14:30:00.000Z"). Nunca Date object ni timestamp.

export function nowISO(): string {
    return new Date().toISOString();
}

// Normaliza input de form a ISO completo.
export function toISO(input: string): string {
    return new Date(input).toISOString();
}

// Recorta a solo fecha sin hora: "2026-06-18".
export function toISODate(input: string | Date): string {
    const d = typeof input === "string" ? new Date(input) : input;
    return d.toISOString().slice(0, 10);
}

// ¿La fecha ISO está en el rango [desde, hasta]? Inclusive en ambos extremos.
// Si desde/hasta son undefined, no se aplica esa frontera.
export function dentroDeRango(
    fechaISO: string,
    desde?: string,
    hasta?: string
): boolean {
    const t = new Date(fechaISO).getTime();
    if (desde && t < new Date(desde).getTime()) return false;
    if (hasta && t > new Date(hasta).getTime()) return false;
    return true;
}

// -----------------------------------------------------
// Membresía del jugador (derivado del historial)
// -----------------------------------------------------
// ¿El jugador estaba activo en el club en esa fecha?
// Sirve para que las stats por torneo solo cuenten partidos donde efectivamente
// el jugador estaba en el club.
export function estaActivoEn(jugador: Jugador, fechaISO: string): boolean {
    const t = new Date(fechaISO).getTime();
    return jugador.historial.some((p) => {
        const desde = new Date(p.desde).getTime();
        const hasta = p.hasta ? new Date(p.hasta).getTime() : Infinity;
        return t >= desde && t <= hasta;
    });
}

// ¿Activo hoy? Útil para refrescar el flag cacheado Jugador.activo.
export function estaActivoHoy(jugador: Jugador): boolean {
    return estaActivoEn(jugador, nowISO());
}

// Periodo vigente del jugador, o null si está dado de baja.
export function periodoVigente(jugador: Jugador): PeriodoEnClub | null {
    return (
        jugador.historial.find(
            (p) => !p.hasta || new Date(p.hasta).getTime() >= Date.now()
        ) ?? null
    );
}