// =====================================================
// Data layer — capa de acceso a datos.
// Hoy lee/escribe JSON locales. El día que migremos a Supabase
// se reemplaza la implementación interna sin tocar componentes.
// =====================================================

import { promises as fs } from "fs";
import path from "path";
import type {
  ClubConfig,
  Jugador,
  JugadorRival,
  Partido,
  Rival,
  Torneo,
} from "@/types";

const DATA_DIR = path.join(process.cwd(), "src", "data");

async function readJSON<T>(file: string): Promise<T> {
  const raw = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJSON<T>(file: string, data: T): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(path.join(DATA_DIR, file), json + "\n", "utf-8");
}

// -----------------------------------------------------
// Club
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
export async function saveJugadores(list: Jugador[]): Promise<void> {
  await writeJSON("jugadores.json", list);
}
export async function upsertJugador(j: Jugador): Promise<Jugador> {
  const list = await getJugadores();
  const idx = list.findIndex((x) => x.id === j.id);
  if (idx >= 0) list[idx] = j;
  else list.push(j);
  await saveJugadores(list);
  return j;
}
export async function deleteJugador(id: string): Promise<void> {
  const list = await getJugadores();
  await saveJugadores(list.filter((j) => j.id !== id));
}

// -----------------------------------------------------
// Rivales
// -----------------------------------------------------
export async function getRivales(): Promise<Rival[]> {
  const list = await readJSON<Rival[]>("rivales.json");
  return list.sort((a, b) => a.nombre.localeCompare(b.nombre));
}
export async function getRival(id: string): Promise<Rival | null> {
  const list = await getRivales();
  return list.find((r) => r.id === id) ?? null;
}
export async function saveRivales(list: Rival[]): Promise<void> {
  await writeJSON("rivales.json", list);
}
export async function upsertRival(r: Rival): Promise<Rival> {
  const list = await getRivales();
  const idx = list.findIndex((x) => x.id === r.id);
  if (idx >= 0) list[idx] = r;
  else list.push(r);
  await saveRivales(list);
  return r;
}
export async function deleteRival(id: string): Promise<void> {
  const list = await getRivales();
  await saveRivales(list.filter((r) => r.id !== id));
}

// -----------------------------------------------------
// Jugadores del rival (scouting)
// -----------------------------------------------------
export async function getJugadoresRival(): Promise<JugadorRival[]> {
  return readJSON<JugadorRival[]>("jugadores-rivales.json");
}
export async function getJugadoresPorRival(rivalId: string): Promise<JugadorRival[]> {
  const list = await getJugadoresRival();
  return list.filter((jr) => jr.rivalId === rivalId);
}
export async function saveJugadoresRival(list: JugadorRival[]): Promise<void> {
  await writeJSON("jugadores-rivales.json", list);
}
export async function upsertJugadorRival(jr: JugadorRival): Promise<JugadorRival> {
  const list = await getJugadoresRival();
  const idx = list.findIndex((x) => x.id === jr.id);
  if (idx >= 0) list[idx] = jr;
  else list.push(jr);
  await saveJugadoresRival(list);
  return jr;
}
export async function deleteJugadorRival(id: string): Promise<void> {
  const list = await getJugadoresRival();
  await saveJugadoresRival(list.filter((jr) => jr.id !== id));
}

// -----------------------------------------------------
// Torneos
// -----------------------------------------------------
export async function getTorneos(): Promise<Torneo[]> {
  const list = await readJSON<Torneo[]>("torneos.json");
  return list.sort((a, b) => b.temporada.localeCompare(a.temporada));
}
export async function getTorneo(id: string): Promise<Torneo | null> {
  const list = await getTorneos();
  return list.find((t) => t.id === id) ?? null;
}
export async function saveTorneos(list: Torneo[]): Promise<void> {
  await writeJSON("torneos.json", list);
}
export async function upsertTorneo(t: Torneo): Promise<Torneo> {
  const list = await getTorneos();
  const idx = list.findIndex((x) => x.id === t.id);
  if (idx >= 0) list[idx] = t;
  else list.push(t);
  await saveTorneos(list);
  return t;
}
export async function deleteTorneo(id: string): Promise<void> {
  const list = await getTorneos();
  await saveTorneos(list.filter((t) => t.id !== id));
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
export async function getPartido(id: string): Promise<Partido | null> {
  const list = await getPartidos();
  return list.find((p) => p.id === id) ?? null;
}
export async function getPartidosPorTorneo(torneoId: string): Promise<Partido[]> {
  const list = await getPartidos();
  return list.filter((p) => p.torneoId === torneoId);
}
export async function getPartidosPorRival(rivalId: string): Promise<Partido[]> {
  const list = await getPartidos();
  return list.filter((p) => p.rivalId === rivalId);
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
export async function savePartidos(list: Partido[]): Promise<void> {
  await writeJSON("partidos.json", list);
}
export async function upsertPartido(p: Partido): Promise<Partido> {
  const list = await getPartidos();
  const idx = list.findIndex((x) => x.id === p.id);
  if (idx >= 0) list[idx] = p;
  else list.push(p);
  await savePartidos(list);
  return p;
}
export async function deletePartido(id: string): Promise<void> {
  const list = await getPartidos();
  await savePartidos(list.filter((p) => p.id !== id));
}