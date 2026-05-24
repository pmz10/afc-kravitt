// =====================================================
// Data layer — capa de acceso a datos del proyecto.
//
// Hoy lee/escribe archivos JSON locales en src/data/.
// Mañana, cuando migremos a Supabase, sólo se reemplaza
// la implementación interna SIN tocar componentes ni rutas.
// =====================================================

import { promises as fs } from "fs";
import path from "path";
import type {
  ClubConfig,
  EstadisticasTemporada,
  Jugador,
  Partido,
} from "@/types";

const DATA_DIR = path.join(process.cwd(), "src", "data");

async function readJSON<T>(file: string): Promise<T> {
  const fullPath = path.join(DATA_DIR, file);
  const raw = await fs.readFile(fullPath, "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJSON<T>(file: string, data: T): Promise<void> {
  const fullPath = path.join(DATA_DIR, file);
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(fullPath, json + "\n", "utf-8");
}

// -----------------------------------------------------
// Configuración del club
// -----------------------------------------------------
export async function getClubConfig(): Promise<ClubConfig> {
  return readJSON<ClubConfig>("club.json");
}

export async function saveClubConfig(config: ClubConfig): Promise<void> {
  await writeJSON("club.json", config);
}

// -----------------------------------------------------
// Jugadores
// -----------------------------------------------------
export async function getJugadores(): Promise<Jugador[]> {
  const list = await readJSON<Jugador[]>("jugadores.json");
  return list.sort((a, b) => a.dorsal - b.dorsal);
}

export async function getJugador(id: string): Promise<Jugador | null> {
  const list = await getJugadores();
  return list.find((j) => j.id === id) ?? null;
}

export async function saveJugadores(jugadores: Jugador[]): Promise<void> {
  await writeJSON("jugadores.json", jugadores);
}

export async function upsertJugador(jugador: Jugador): Promise<Jugador> {
  const list = await getJugadores();
  const idx = list.findIndex((j) => j.id === jugador.id);
  if (idx >= 0) list[idx] = jugador;
  else list.push(jugador);
  await saveJugadores(list);
  return jugador;
}

export async function deleteJugador(id: string): Promise<void> {
  const list = await getJugadores();
  await saveJugadores(list.filter((j) => j.id !== id));
}

// -----------------------------------------------------
// Partidos
// -----------------------------------------------------
export async function getPartidos(): Promise<Partido[]> {
  const list = await readJSON<Partido[]>("partidos.json");
  return list.sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );
}

export async function getProximoPartido(): Promise<Partido | null> {
  const list = await getPartidos();
  const now = Date.now();
  return (
    list.find(
      (p) => new Date(p.fecha).getTime() > now && p.resultado === "pendiente"
    ) ?? null
  );
}

export async function getUltimosResultados(n = 5): Promise<Partido[]> {
  const list = await getPartidos();
  return list
    .filter((p) => p.resultado !== "pendiente")
    .reverse()
    .slice(0, n);
}

export async function savePartidos(partidos: Partido[]): Promise<void> {
  await writeJSON("partidos.json", partidos);
}

export async function upsertPartido(partido: Partido): Promise<Partido> {
  const list = await getPartidos();
  const idx = list.findIndex((p) => p.id === partido.id);
  if (idx >= 0) list[idx] = partido;
  else list.push(partido);
  await savePartidos(list);
  return partido;
}

export async function deletePartido(id: string): Promise<void> {
  const list = await getPartidos();
  await savePartidos(list.filter((p) => p.id !== id));
}

// -----------------------------------------------------
// Estadísticas
// -----------------------------------------------------
export async function getEstadisticas(): Promise<EstadisticasTemporada[]> {
  return readJSON<EstadisticasTemporada[]>("estadisticas.json");
}

export async function getEstadisticasTemporadaActual(): Promise<EstadisticasTemporada | null> {
  const list = await getEstadisticas();
  if (list.length === 0) return null;
  // La temporada más reciente por nombre lexicográfico ("2024-2025" > "2023-2024")
  return list.slice().sort((a, b) => b.temporada.localeCompare(a.temporada))[0];
}

export async function saveEstadisticas(
  stats: EstadisticasTemporada[]
): Promise<void> {
  await writeJSON("estadisticas.json", stats);
}

export async function upsertEstadisticas(
  stats: EstadisticasTemporada
): Promise<EstadisticasTemporada> {
  const list = await getEstadisticas();
  const idx = list.findIndex((s) => s.id === stats.id);
  if (idx >= 0) list[idx] = stats;
  else list.push(stats);
  await saveEstadisticas(list);
  return stats;
}

export async function deleteEstadisticas(id: string): Promise<void> {
  const list = await getEstadisticas();
  await saveEstadisticas(list.filter((s) => s.id !== id));
}

// -----------------------------------------------------
// Derivados / agregaciones útiles
// -----------------------------------------------------
export async function getTopGoleadores(
  n = 5
): Promise<Array<Jugador & { goles: number }>> {
  const list = await getJugadores();
  return list
    .filter((j) => j.activo)
    .sort((a, b) => b.stats.goles - a.stats.goles)
    .slice(0, n)
    .map((j) => ({ ...j, goles: j.stats.goles }));
}
