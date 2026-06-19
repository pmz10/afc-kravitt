// =====================================================
// Tipos del dominio AFC Kravitt
// =====================================================

// -----------------------------------------------------
// Enumeraciones base
// -----------------------------------------------------
export type Posicion = "POR" | "DEF" | "MED" | "DEL";
export type PieDominante = "izq" | "der" | "ambos";

export type CategoriaTorneo = "Fut7" | "Fut6" | "Fut5" | "Otro";
export type TipoTorneo = "liga" | "copa" | "amistoso" | "interno";
export type EstadoTorneo = "proximo" | "en_curso" | "finalizado" | "cancelado";

export type ResultadoPartido =
  | "ganado"
  | "perdido"
  | "empatado"
  | "default-favor"
  | "default-contra"
  | "pendiente";

// Eventos del partido. Sufijo _rival = lo hizo el equipo contrario.
export type TipoEventoPropio =
  | "gol"
  | "asistencia"
  | "amarilla"
  | "roja"
  | "autogol"
  | "penal_anotado"
  | "penal_fallado";

export type TipoEventoRival =
  | "gol_rival"
  | "asistencia_rival"
  | "amarilla_rival"
  | "roja_rival"
  | "penal_anotado_rival"
  | "penal_fallado_rival";

export type TipoEvento = TipoEventoPropio | TipoEventoRival;

// -----------------------------------------------------
// Rival (entidad global en su propio JSON)
// -----------------------------------------------------
export interface JugadorRival {
  id: string;
  rivalId: string;
  dorsal?: number;
  nombre?: string;
  apodo?: string;
  posicion?: Posicion;
  notas?: string;
}

export interface Rival {
  id: string;
  nombre: string;
  nombreCorto?: string;
  escudo?: string;
  ciudad?: string;
  notas?: string;
}

// -----------------------------------------------------
// Torneo / Competición
// -----------------------------------------------------
export interface Torneo {
  id: string;
  nombre: string;
  temporada: string;
  categoria: CategoriaTorneo;
  tipo: TipoTorneo;
  estado: EstadoTorneo;
  fechaInicio?: string;
  fechaFin?: string;
  sede?: string;
  organizador?: string;
  participantes: string[];   // ids de Rival
  posicionFinal?: number;
  faseAlcanzada?: string;
  resumen?: string;
}

// -----------------------------------------------------
// Partido
// -----------------------------------------------------
// EventoPartido es discriminated union: según el tipo, TS exige jugadorId (nuestro)
// o jugadorRivalId (rival). Evita mezclar bandos por error.
export type EventoPartido =
  | {
    id: string;
    tipo: TipoEventoPropio;
    jugadorId: string;
    minuto?: number;
    notas?: string;
  }
  | {
    id: string;
    tipo: TipoEventoRival;
    jugadorRivalId: string;
    minuto?: number;
    notas?: string;
  };

export interface Partido {
  id: string;
  torneoId: string;
  rivalId: string;
  jornada?: number;
  fecha: string;
  sede?: string;
  esLocal: boolean;
  resultado: ResultadoPartido;
  golesFavor?: number;
  golesContra?: number;
  penales?: { favor: number; contra: number };
  convocados: string[];      // ids de nuestros jugadores
  eventos: EventoPartido[];
  notas?: string;
  mvpId?: string;
}

// -----------------------------------------------------
// Jugador
// -----------------------------------------------------
export interface PeriodoEnClub {
  id: string;
  desde: string;
  hasta?: string;
  motivoBaja?: string;
  notas?: string;
}

export interface StatsCarryOver {
  partidosJugados: number;
  goles: number;
  asistencias: number;
  amarillas: number;
  rojas: number;
}

// -----------------------------------------------------
// Hitos / logros del jugador
// -----------------------------------------------------
export type TipoHito =
  | "campeon"
  | "subcampeon"
  | "max_goleador_torneo"
  | "max_asistente_torneo"
  | "mvp_torneo"
  | "mvp_partido"
  | "hat_trick"
  | "milestone_partidos"
  | "milestone_goles"
  | "capitan_temporada"
  | "otro";

export interface Hito {
  id: string;
  tipo: TipoHito;
  titulo: string;
  fecha?: string;
  torneoId?: string;
  notas?: string;
}


export interface Jugador {
  id: string;
  nombre: string;
  apellido: string;
  apodo?: string;
  dorsal: number;
  posicion: Posicion;
  posicionesSecundarias?: Posicion[];
  pieDominante?: PieDominante;
  foto?: string;
  bio?: string;
  fechaNacimiento?: string;
  capitan?: boolean;
  historial: PeriodoEnClub[];
  activo: boolean;
  carryOver?: StatsCarryOver;
  esLeyenda?: boolean;
  email?: string;       // ← nuevo (para login futuro de votación)
  hitos?: Hito[];       // ← nuevo (gestionado desde la ficha)
}

// -----------------------------------------------------
// Stats agregadas (resultado de cálculo)
// -----------------------------------------------------
export interface StatsAgregadas {
  partidosJugados: number;
  goles: number;
  asistencias: number;
  amarillas: number;
  rojas: number;
  autogoles: number;
}

// -----------------------------------------------------
// Configuración del club
// -----------------------------------------------------
export interface ClubConfig {
  nombre: string;
  nombreCorto: string;
  frase: string;
  fundacion: number;
  escudoOriginal: string;
  escudoMoon: string;
  colores: { name: string; hex: string }[];
  redes: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
  };
  contacto: {
    email?: string;
    telefono?: string;
    ubicacion?: string;
  };
}