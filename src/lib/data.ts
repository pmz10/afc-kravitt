import { createClient } from "@/lib/supabase/server";
import type {
  CarryOverPorTorneo,
  ClubConfig,
  EventoPartido,
  Hito,
  Jugador,
  JugadorRival,
  Partido,
  PeriodoEnClub,
  Rival,
  StatsCarryOver,
  TipoEventoPropio,
  TipoEventoRival,
  Torneo,
} from "@/types";

type DbError = { message: string };

type ClubRow = {
  id: string;
  nombre: string;
  nombre_corto: string;
  frase: string;
  fundacion: number;
  escudo_original: string;
  escudo_moon: string;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  tiktok: string | null;
  twitter: string | null;
  contacto_email: string | null;
  contacto_telefono: string | null;
  contacto_ubicacion: string | null;
  club_colores?: {
    nombre: string;
    hex: string;
    orden: number;
  }[];
};

type JugadorRow = {
  id: string;
  nombre: string;
  apellido: string;
  apodo: string | null;
  dorsal: number;
  posicion: Jugador["posicion"];
  posiciones_secundarias: Jugador["posicionesSecundarias"] | null;
  pie_dominante: Jugador["pieDominante"] | null;
  foto: string | null;
  bio: string | null;
  fecha_nacimiento: string | null;
  capitan: boolean;
  activo: boolean;
  carry_partidos_jugados: number;
  carry_goles: number;
  carry_asistencias: number;
  carry_amarillas: number;
  carry_rojas: number;
  es_leyenda: boolean;
  email: string | null;
  jugador_historial?: {
    id: string;
    desde: string;
    hasta: string | null;
    motivo_baja: string | null;
    notas: string | null;
  }[];
  jugador_carry_over_torneos?: {
    torneo_id: string;
    partidos_jugados: number;
    goles: number;
    asistencias: number;
    amarillas: number;
    rojas: number;
  }[];
  jugador_hitos?: {
    id: string;
    tipo: Hito["tipo"];
    titulo: string;
    fecha: string | null;
    torneo_id: string | null;
    notas: string | null;
  }[];
};

type RivalRow = {
  id: string;
  nombre: string;
  nombre_corto: string | null;
  escudo: string | null;
  ciudad: string | null;
  notas: string | null;
};

type JugadorRivalRow = {
  id: string;
  rival_id: string;
  dorsal: number | null;
  nombre: string | null;
  apodo: string | null;
  posicion: JugadorRival["posicion"] | null;
  notas: string | null;
};

type TorneoRow = {
  id: string;
  nombre: string;
  temporada: string;
  categoria: Torneo["categoria"];
  tipo: Torneo["tipo"];
  estado: Torneo["estado"];
  fecha_inicio: string | null;
  fecha_fin: string | null;
  sede: string | null;
  organizador: string | null;
  posicion_final: number | null;
  fase_alcanzada: string | null;
  resumen: string | null;
  torneo_participantes?: { rival_id: string }[];
  torneo_jugadores?: { jugador_id: string; dorsal: number | null }[];
};

type PartidoRow = {
  id: string;
  torneo_id: string;
  rival_id: string;
  jornada: number | null;
  fecha: string;
  sede: string | null;
  es_local: boolean;
  resultado: Partido["resultado"];
  goles_favor: number | null;
  goles_contra: number | null;
  penales_favor: number | null;
  penales_contra: number | null;
  notas: string | null;
  mvp_id: string | null;
  partido_convocados?: { jugador_id: string; titular: boolean | null }[];
  partido_eventos?: {
    id: string;
    tipo: EventoPartido["tipo"];
    jugador_id: string | null;
    jugador_rival_id: string | null;
    minuto: number | null;
    notas: string | null;
  }[];
};

function fail(operation: string, error: DbError): never {
  throw new Error(`Supabase (${operation}): ${error.message}`);
}

function optional<T>(value: T | null): T | undefined {
  return value ?? undefined;
}

function jugadorFromRow(row: JugadorRow): Jugador {
  const carryOver: StatsCarryOver = {
    partidosJugados: row.carry_partidos_jugados,
    goles: row.carry_goles,
    asistencias: row.carry_asistencias,
    amarillas: row.carry_amarillas,
    rojas: row.carry_rojas,
  };
  const tieneCarry = Object.values(carryOver).some((value) => value > 0);

  const historial: PeriodoEnClub[] = (row.jugador_historial ?? [])
    .map((periodo) => ({
      id: periodo.id,
      desde: periodo.desde,
      hasta: optional(periodo.hasta),
      motivoBaja: optional(periodo.motivo_baja),
      notas: optional(periodo.notas),
    }))
    .sort((a, b) => a.desde.localeCompare(b.desde));

  const carryOverPorTorneo: CarryOverPorTorneo[] = (
    row.jugador_carry_over_torneos ?? []
  ).map((carry) => ({
    torneoId: carry.torneo_id,
    partidosJugados: carry.partidos_jugados,
    goles: carry.goles,
    asistencias: carry.asistencias,
    amarillas: carry.amarillas,
    rojas: carry.rojas,
  }));

  const hitos: Hito[] = (row.jugador_hitos ?? []).map((hito) => ({
    id: hito.id,
    tipo: hito.tipo,
    titulo: hito.titulo,
    fecha: optional(hito.fecha),
    torneoId: optional(hito.torneo_id),
    notas: optional(hito.notas),
  }));

  return {
    id: row.id,
    nombre: row.nombre,
    apellido: row.apellido,
    apodo: optional(row.apodo),
    dorsal: row.dorsal,
    posicion: row.posicion,
    posicionesSecundarias: row.posiciones_secundarias?.length
      ? row.posiciones_secundarias
      : undefined,
    pieDominante: optional(row.pie_dominante),
    foto: optional(row.foto),
    bio: optional(row.bio),
    fechaNacimiento: optional(row.fecha_nacimiento),
    capitan: row.capitan || undefined,
    historial,
    activo: row.activo,
    carryOver: tieneCarry ? carryOver : undefined,
    carryOverPorTorneo: carryOverPorTorneo.length
      ? carryOverPorTorneo
      : undefined,
    esLeyenda: row.es_leyenda || undefined,
    email: optional(row.email),
    hitos: hitos.length ? hitos : undefined,
  };
}

async function replaceRelated(
  table: string,
  foreignKey: string,
  ownerId: string,
  rows: Record<string, unknown>[],
): Promise<void> {
  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from(table)
    .delete()
    .eq(foreignKey, ownerId);
  if (deleteError) fail(`vaciar ${table}`, deleteError);
  if (!rows.length) return;

  const { error } = await supabase.from(table).insert(rows);
  if (error) fail(`guardar ${table}`, error);
}

export async function getClubConfig(): Promise<ClubConfig> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("club_config")
    .select("*, club_colores(nombre, hex, orden)")
    .eq("id", "main")
    .single();
  if (error) fail("leer club_config", error);

  const row = data as ClubRow;
  return {
    nombre: row.nombre,
    nombreCorto: row.nombre_corto,
    frase: row.frase,
    fundacion: row.fundacion,
    escudoOriginal: row.escudo_original,
    escudoMoon: row.escudo_moon,
    colores: (row.club_colores ?? [])
      .sort((a, b) => a.orden - b.orden)
      .map((color) => ({ name: color.nombre, hex: color.hex })),
    redes: {
      instagram: optional(row.instagram),
      facebook: optional(row.facebook),
      youtube: optional(row.youtube),
      tiktok: optional(row.tiktok),
      twitter: optional(row.twitter),
    },
    contacto: {
      email: optional(row.contacto_email),
      telefono: optional(row.contacto_telefono),
      ubicacion: optional(row.contacto_ubicacion),
    },
  };
}

export async function saveClubConfig(config: ClubConfig): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("club_config").upsert({
    id: "main",
    nombre: config.nombre,
    nombre_corto: config.nombreCorto,
    frase: config.frase,
    fundacion: config.fundacion,
    escudo_original: config.escudoOriginal,
    escudo_moon: config.escudoMoon,
    instagram: config.redes.instagram ?? null,
    facebook: config.redes.facebook ?? null,
    youtube: config.redes.youtube ?? null,
    tiktok: config.redes.tiktok ?? null,
    twitter: config.redes.twitter ?? null,
    contacto_email: config.contacto.email ?? null,
    contacto_telefono: config.contacto.telefono ?? null,
    contacto_ubicacion: config.contacto.ubicacion ?? null,
  });
  if (error) fail("guardar club_config", error);

  await replaceRelated(
    "club_colores",
    "club_id",
    "main",
    config.colores.map((color, orden) => ({
      club_id: "main",
      nombre: color.name,
      hex: color.hex,
      orden,
    })),
  );
}

export async function getJugadores(): Promise<Jugador[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jugadores")
    .select(
      "*, jugador_historial(*), jugador_carry_over_torneos(*), jugador_hitos(*)",
    )
    .order("dorsal");
  if (error) fail("leer jugadores", error);
  return (data as JugadorRow[]).map(jugadorFromRow);
}

export async function getJugador(id: string): Promise<Jugador | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jugadores")
    .select(
      "*, jugador_historial(*), jugador_carry_over_torneos(*), jugador_hitos(*)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) fail("leer jugador", error);
  return data ? jugadorFromRow(data as JugadorRow) : null;
}

export async function saveJugadores(list: Jugador[]): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("jugadores").delete().not("id", "is", null);
  if (error) fail("vaciar jugadores", error);
  for (const jugador of list) await upsertJugador(jugador);
}

export async function upsertJugador(jugador: Jugador): Promise<Jugador> {
  const carry = jugador.carryOver;
  const supabase = await createClient();
  const { error } = await supabase.from("jugadores").upsert({
    id: jugador.id,
    nombre: jugador.nombre,
    apellido: jugador.apellido,
    apodo: jugador.apodo ?? null,
    dorsal: jugador.dorsal,
    posicion: jugador.posicion,
    posiciones_secundarias: jugador.posicionesSecundarias ?? [],
    pie_dominante: jugador.pieDominante ?? null,
    foto: jugador.foto ?? null,
    bio: jugador.bio ?? null,
    fecha_nacimiento: jugador.fechaNacimiento ?? null,
    capitan: jugador.capitan ?? false,
    activo: jugador.activo,
    carry_partidos_jugados: carry?.partidosJugados ?? 0,
    carry_goles: carry?.goles ?? 0,
    carry_asistencias: carry?.asistencias ?? 0,
    carry_amarillas: carry?.amarillas ?? 0,
    carry_rojas: carry?.rojas ?? 0,
    es_leyenda: jugador.esLeyenda ?? false,
    email: jugador.email ?? null,
  });
  if (error) fail("guardar jugador", error);

  await replaceRelated(
    "jugador_historial",
    "jugador_id",
    jugador.id,
    jugador.historial.map((periodo) => ({
      id: periodo.id,
      jugador_id: jugador.id,
      desde: periodo.desde,
      hasta: periodo.hasta ?? null,
      motivo_baja: periodo.motivoBaja ?? null,
      notas: periodo.notas ?? null,
    })),
  );
  await replaceRelated(
    "jugador_carry_over_torneos",
    "jugador_id",
    jugador.id,
    (jugador.carryOverPorTorneo ?? []).map((item) => ({
      jugador_id: jugador.id,
      torneo_id: item.torneoId,
      partidos_jugados: item.partidosJugados,
      goles: item.goles,
      asistencias: item.asistencias,
      amarillas: item.amarillas,
      rojas: item.rojas,
    })),
  );
  await replaceRelated(
    "jugador_hitos",
    "jugador_id",
    jugador.id,
    (jugador.hitos ?? []).map((hito) => ({
      id: hito.id,
      jugador_id: jugador.id,
      tipo: hito.tipo,
      titulo: hito.titulo,
      fecha: hito.fecha ?? null,
      torneo_id: hito.torneoId ?? null,
      notas: hito.notas ?? null,
    })),
  );

  return jugador;
}

export async function deleteJugador(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("jugadores").delete().eq("id", id);
  if (error) fail("eliminar jugador", error);
}

function rivalFromRow(row: RivalRow): Rival {
  return {
    id: row.id,
    nombre: row.nombre,
    nombreCorto: optional(row.nombre_corto),
    escudo: optional(row.escudo),
    ciudad: optional(row.ciudad),
    notas: optional(row.notas),
  };
}

export async function getRivales(): Promise<Rival[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rivales")
    .select("*")
    .order("nombre");
  if (error) fail("leer rivales", error);
  return (data as RivalRow[]).map(rivalFromRow);
}

export async function getRival(id: string): Promise<Rival | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rivales")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) fail("leer rival", error);
  return data ? rivalFromRow(data as RivalRow) : null;
}

export async function saveRivales(list: Rival[]): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("rivales").delete().not("id", "is", null);
  if (error) fail("vaciar rivales", error);
  for (const rival of list) await upsertRival(rival);
}

export async function upsertRival(rival: Rival): Promise<Rival> {
  const supabase = await createClient();
  const { error } = await supabase.from("rivales").upsert({
    id: rival.id,
    nombre: rival.nombre,
    nombre_corto: rival.nombreCorto ?? null,
    escudo: rival.escudo ?? null,
    ciudad: rival.ciudad ?? null,
    notas: rival.notas ?? null,
  });
  if (error) fail("guardar rival", error);
  return rival;
}

export async function deleteRival(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("rivales").delete().eq("id", id);
  if (error) fail("eliminar rival", error);
}

function jugadorRivalFromRow(row: JugadorRivalRow): JugadorRival {
  return {
    id: row.id,
    rivalId: row.rival_id,
    dorsal: optional(row.dorsal),
    nombre: optional(row.nombre),
    apodo: optional(row.apodo),
    posicion: optional(row.posicion),
    notas: optional(row.notas),
  };
}

export async function getJugadoresRival(): Promise<JugadorRival[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("jugadores_rivales").select("*");
  if (error) fail("leer jugadores rivales", error);
  return (data as JugadorRivalRow[]).map(jugadorRivalFromRow);
}

export async function getJugadoresPorRival(rivalId: string): Promise<JugadorRival[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jugadores_rivales")
    .select("*")
    .eq("rival_id", rivalId);
  if (error) fail("leer jugadores del rival", error);
  return (data as JugadorRivalRow[]).map(jugadorRivalFromRow);
}

export async function saveJugadoresRival(list: JugadorRival[]): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("jugadores_rivales")
    .delete()
    .not("id", "is", null);
  if (error) fail("vaciar jugadores rivales", error);
  for (const jugador of list) await upsertJugadorRival(jugador);
}

export async function upsertJugadorRival(
  jugador: JugadorRival,
): Promise<JugadorRival> {
  const supabase = await createClient();
  const { error } = await supabase.from("jugadores_rivales").upsert({
    id: jugador.id,
    rival_id: jugador.rivalId,
    dorsal: jugador.dorsal ?? null,
    nombre: jugador.nombre ?? null,
    apodo: jugador.apodo ?? null,
    posicion: jugador.posicion ?? null,
    notas: jugador.notas ?? null,
  });
  if (error) fail("guardar jugador rival", error);
  return jugador;
}

export async function deleteJugadorRival(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("jugadores_rivales").delete().eq("id", id);
  if (error) fail("eliminar jugador rival", error);
}

function torneoFromRow(row: TorneoRow): Torneo {
  return {
    id: row.id,
    nombre: row.nombre,
    temporada: row.temporada,
    categoria: row.categoria,
    tipo: row.tipo,
    estado: row.estado,
    fechaInicio: optional(row.fecha_inicio),
    fechaFin: optional(row.fecha_fin),
    sede: optional(row.sede),
    organizador: optional(row.organizador),
    participantes: (row.torneo_participantes ?? []).map((item) => item.rival_id),
    jugadoresIds: (row.torneo_jugadores ?? []).map((item) => item.jugador_id),
    dorsalesPorJugador: Object.fromEntries(
      (row.torneo_jugadores ?? [])
        .filter((item) => item.dorsal !== null)
        .map((item) => [item.jugador_id, item.dorsal as number]),
    ),
    posicionFinal: optional(row.posicion_final),
    faseAlcanzada: optional(row.fase_alcanzada),
    resumen: optional(row.resumen),
  };
}

export async function getTorneos(): Promise<Torneo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("torneos")
    .select("*, torneo_participantes(rival_id), torneo_jugadores(jugador_id, dorsal)")
    .order("temporada", { ascending: false });
  if (error) fail("leer torneos", error);
  return (data as TorneoRow[]).map(torneoFromRow);
}

export async function getTorneo(id: string): Promise<Torneo | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("torneos")
    .select("*, torneo_participantes(rival_id), torneo_jugadores(jugador_id, dorsal)")
    .eq("id", id)
    .maybeSingle();
  if (error) fail("leer torneo", error);
  return data ? torneoFromRow(data as TorneoRow) : null;
}

export async function saveTorneos(list: Torneo[]): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("torneos").delete().not("id", "is", null);
  if (error) fail("vaciar torneos", error);
  for (const torneo of list) await upsertTorneo(torneo);
}

export async function upsertTorneo(torneo: Torneo): Promise<Torneo> {
  const supabase = await createClient();
  const { error } = await supabase.from("torneos").upsert({
    id: torneo.id,
    nombre: torneo.nombre,
    temporada: torneo.temporada,
    categoria: torneo.categoria,
    tipo: torneo.tipo,
    estado: torneo.estado,
    fecha_inicio: torneo.fechaInicio ?? null,
    fecha_fin: torneo.fechaFin ?? null,
    sede: torneo.sede ?? null,
    organizador: torneo.organizador ?? null,
    posicion_final: torneo.posicionFinal ?? null,
    fase_alcanzada: torneo.faseAlcanzada ?? null,
    resumen: torneo.resumen ?? null,
  });
  if (error) fail("guardar torneo", error);

  await replaceRelated(
    "torneo_participantes",
    "torneo_id",
    torneo.id,
    torneo.participantes.map((rivalId) => ({
      torneo_id: torneo.id,
      rival_id: rivalId,
    })),
  );
  await replaceRelated(
    "torneo_jugadores",
    "torneo_id",
    torneo.id,
    torneo.jugadoresIds.map((jugadorId) => ({
      torneo_id: torneo.id,
      jugador_id: jugadorId,
      dorsal: torneo.dorsalesPorJugador[jugadorId] ?? null,
    })),
  );
  return torneo;
}

export async function deleteTorneo(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("torneos").delete().eq("id", id);
  if (error) fail("eliminar torneo", error);
}

function eventoFromRow(
  row: NonNullable<PartidoRow["partido_eventos"]>[number],
): EventoPartido {
  const base = {
    id: row.id,
    minuto: optional(row.minuto),
    notas: optional(row.notas),
  };

  if (row.jugador_id) {
    return {
      ...base,
      tipo: row.tipo as TipoEventoPropio,
      jugadorId: row.jugador_id,
    };
  }

  return {
    ...base,
    tipo: row.tipo as TipoEventoRival,
    ...(row.jugador_rival_id ? { jugadorRivalId: row.jugador_rival_id } : {}),
  };
}

function partidoFromRow(row: PartidoRow): Partido {
  const tienePenales =
    row.penales_favor !== null && row.penales_contra !== null;

  return {
    id: row.id,
    torneoId: row.torneo_id,
    rivalId: row.rival_id,
    jornada: optional(row.jornada),
    fecha: row.fecha,
    sede: optional(row.sede),
    esLocal: row.es_local,
    resultado: row.resultado,
    golesFavor: optional(row.goles_favor),
    golesContra: optional(row.goles_contra),
    penales: tienePenales
      ? { favor: row.penales_favor!, contra: row.penales_contra! }
      : undefined,
    convocados: (row.partido_convocados ?? []).map((item) => item.jugador_id),
    titulares: (row.partido_convocados ?? [])
      .filter((item) => item.titular)
      .map((item) => item.jugador_id),
    eventos: (row.partido_eventos ?? []).map(eventoFromRow),
    notas: optional(row.notas),
    mvpId: optional(row.mvp_id),
  };
}

const PARTIDO_SELECT =
  "*, partido_convocados(jugador_id, titular), partido_eventos(id, tipo, jugador_id, jugador_rival_id, minuto, notas)";

export async function getPartidos(): Promise<Partido[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partidos")
    .select(PARTIDO_SELECT)
    .order("fecha");
  if (error) fail("leer partidos", error);
  return (data as PartidoRow[]).map(partidoFromRow);
}

export async function getPartido(id: string): Promise<Partido | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partidos")
    .select(PARTIDO_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) fail("leer partido", error);
  return data ? partidoFromRow(data as PartidoRow) : null;
}

export async function getPartidosPorTorneo(torneoId: string): Promise<Partido[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partidos")
    .select(PARTIDO_SELECT)
    .eq("torneo_id", torneoId)
    .order("fecha");
  if (error) fail("leer partidos del torneo", error);
  return (data as PartidoRow[]).map(partidoFromRow);
}

export async function getPartidosPorRival(rivalId: string): Promise<Partido[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partidos")
    .select(PARTIDO_SELECT)
    .eq("rival_id", rivalId)
    .order("fecha");
  if (error) fail("leer partidos del rival", error);
  return (data as PartidoRow[]).map(partidoFromRow);
}

export async function getProximoPartido(): Promise<Partido | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partidos")
    .select(PARTIDO_SELECT)
    .eq("resultado", "pendiente")
    .gt("fecha", new Date().toISOString())
    .order("fecha")
    .limit(1)
    .maybeSingle();
  if (error) fail("leer próximo partido", error);
  return data ? partidoFromRow(data as PartidoRow) : null;
}

export async function getUltimosResultados(n = 5): Promise<Partido[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partidos")
    .select(PARTIDO_SELECT)
    .neq("resultado", "pendiente")
    .order("fecha", { ascending: false })
    .limit(n);
  if (error) fail("leer últimos resultados", error);
  return (data as PartidoRow[]).map(partidoFromRow);
}

export async function savePartidos(list: Partido[]): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("partidos").delete().not("id", "is", null);
  if (error) fail("vaciar partidos", error);
  for (const partido of list) await upsertPartido(partido);
}

export async function upsertPartido(partido: Partido): Promise<Partido> {
  const supabase = await createClient();
  const { error } = await supabase.from("partidos").upsert({
    id: partido.id,
    torneo_id: partido.torneoId,
    rival_id: partido.rivalId,
    jornada: partido.jornada ?? null,
    fecha: partido.fecha,
    sede: partido.sede ?? null,
    es_local: partido.esLocal,
    resultado: partido.resultado,
    goles_favor: partido.golesFavor ?? null,
    goles_contra: partido.golesContra ?? null,
    penales_favor: partido.penales?.favor ?? null,
    penales_contra: partido.penales?.contra ?? null,
    notas: partido.notas ?? null,
    mvp_id: partido.mvpId ?? null,
  });
  if (error) fail("guardar partido", error);

  await replaceRelated(
    "partido_convocados",
    "partido_id",
    partido.id,
    partido.convocados.map((jugadorId) => ({
      partido_id: partido.id,
      jugador_id: jugadorId,
      titular: partido.titulares.includes(jugadorId),
    })),
  );
  await replaceRelated(
    "partido_eventos",
    "partido_id",
    partido.id,
    partido.eventos.map((evento) => ({
      id: evento.id,
      partido_id: partido.id,
      tipo: evento.tipo,
      jugador_id: "jugadorId" in evento ? evento.jugadorId : null,
      jugador_rival_id:
        "jugadorRivalId" in evento ? (evento.jugadorRivalId ?? null) : null,
      minuto: evento.minuto ?? null,
      notas: evento.notas ?? null,
    })),
  );

  return partido;
}

export async function deletePartido(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("partidos").delete().eq("id", id);
  if (error) fail("eliminar partido", error);
}
