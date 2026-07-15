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

// Zona horaria del club (Ciudad de México, UTC-6 fijo desde que el país
// eliminó el horario de verano en la mayoría del territorio en 2022).
// Los <input type="datetime-local"> no incluyen zona horaria — sin esto, el
// valor se guarda o se muestra asumiendo la zona del servidor (UTC en
// Vercel), lo que desfasa la hora guardada varias horas.
export const ZONA_CLUB = "America/Mexico_City";
const OFFSET_CLUB = "-06:00";

// Convierte el valor de un <input type="datetime-local"> (hora local del
// club, sin zona) a un ISO UTC inequívoco, listo para guardar.
export function localClubAIso(datetimeLocal: string): string {
    return new Date(`${datetimeLocal}:00${OFFSET_CLUB}`).toISOString();
}

// Convierte un ISO ya guardado (UTC) al formato que espera un
// <input type="datetime-local">, en hora del club.
export function isoALocalClub(iso: string): string {
    const d = new Date(iso);
    const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: ZONA_CLUB,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    });
    const partes = Object.fromEntries(
        fmt.formatToParts(d).map((p) => [p.type, p.value]),
    );
    return `${partes.year}-${partes.month}-${partes.day}T${partes.hour}:${partes.minute}`;
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