// =====================================================
// Tipos del dominio AFC Kravitt
// =====================================================

export type Posicion = "POR" | "DEF" | "MED" | "DEL";

export type CategoriaTorneo = "Fut7" | "Fut6" | "Fut5" | "Otro";

export type ResultadoPartido =
  | "ganado"
  | "perdido"
  | "empatado"
  | "default-favor"
  | "default-contra"
  | "pendiente";

// -----------------------------------------------------
// Jugador
// -----------------------------------------------------
export interface Jugador {
  id: string;
  nombre: string;
  apellido: string;
  dorsal: number;
  posicion: Posicion;
  foto?: string; // ruta relativa en /public/jugadores/
  bio?: string;
  fechaNacimiento?: string; // ISO
  capitan?: boolean;
  activo: boolean;
  stats: {
    partidosJugados: number;
    goles: number;
    asistencias: number;
    amarillas: number;
    rojas: number;
  };
}

// -----------------------------------------------------
// Partido
// -----------------------------------------------------
export interface Partido {
  id: string;
  jornada?: number;
  fecha: string; // ISO datetime
  rival: string;
  sede?: string;
  categoria: CategoriaTorneo;
  esLocal: boolean;
  resultado: ResultadoPartido;
  golesFavor?: number;
  golesContra?: number;
  goleadores?: { jugadorId: string; cantidad: number }[];
  notas?: string;
}

// -----------------------------------------------------
// Estadísticas globales por temporada
// -----------------------------------------------------
export interface EstadisticasTemporada {
  id: string;
  temporada: string; // "2024-2025"
  categoria: CategoriaTorneo;
  partidosJugados: number;
  victorias: number;
  empates: number;
  derrotas: number;
  golesFavor: number;
  golesContra: number;
  diferenciaGoles: number;
  posicionFinal?: number;
  faseAlcanzada?: string;
  resumen?: string;
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
