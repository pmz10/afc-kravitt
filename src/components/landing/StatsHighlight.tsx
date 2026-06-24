import Link from "next/link";

import { getJugadores, getPartidos, getTorneos } from "@/lib/data";
import { getStatsJugador } from "@/lib/stats";
import { StatsHighlightScroll } from "@/components/landing/StatsHighlightScroll";

export async function StatsHighlight() {
  const [jugadores, partidos, torneos] = await Promise.all([
    getJugadores(),
    getPartidos(),
    getTorneos(),
  ]);

  // Torneo "actual": en_curso si hay, sino el finalizado más reciente
  const torneoActual =
    torneos.find((t) => t.estado === "en_curso") ??
    torneos
      .filter((t) => t.estado === "finalizado")
      .sort((a, b) => b.temporada.localeCompare(a.temporada))[0];

  // Stats agregadas del equipo en ese torneo
  let stats: {
    temporada: string;
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
  } | null = null;

  if (torneoActual) {
    const partidosTorneo = partidos.filter(
      (p) => p.torneoId === torneoActual.id && p.resultado !== "pendiente",
    );
    let v = 0;
    let e = 0;
    let d = 0;
    let gf = 0;
    let gc = 0;
    for (const p of partidosTorneo) {
      if (p.resultado === "ganado" || p.resultado === "default-favor") v++;
      else if (p.resultado === "empatado") e++;
      else if (p.resultado === "perdido" || p.resultado === "default-contra")
        d++;
      if (p.golesFavor !== undefined) gf += p.golesFavor;
      if (p.golesContra !== undefined) gc += p.golesContra;
    }
    stats = {
      temporada: torneoActual.temporada,
      partidosJugados: partidosTorneo.length,
      victorias: v,
      empates: e,
      derrotas: d,
      golesFavor: gf,
      golesContra: gc,
      diferenciaGoles: gf - gc,
      posicionFinal: torneoActual.posicionFinal,
      faseAlcanzada: torneoActual.faseAlcanzada,
      resumen: torneoActual.resumen,
    };
  }

  // Top 3 goleadores
  const goleadores = jugadores
    .map((j) => ({
      ...j,
      goles: getStatsJugador(j, partidos).goles,
    }))
    .filter((g) => g.goles > 0)
    .sort((a, b) => b.goles - a.goles)
    .slice(0, 3);

  return (
    <StatsHighlightScroll>
      {/* Fondo mesh original */}
      <div
        data-stats-mesh
        className="absolute inset-0 -z-20 bg-mesh-kravitt"
        aria-hidden="true"
      />

      {/* Luces ambientales */}
      <div
        data-stats-glow
        className="pointer-events-none absolute -left-52 top-1/4 -z-10 h-[38rem] w-[38rem] rounded-full bg-kravitt-orange/10 blur-[150px]"
        aria-hidden="true"
      />

      <div
        data-stats-glow
        className="pointer-events-none absolute -right-56 bottom-0 -z-10 h-[42rem] w-[42rem] rounded-full bg-kravitt-petrol/35 blur-[160px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
        {/* Encabezado */}
        <div className="mb-8 flex flex-col items-start gap-3 lg:mb-10">
          <div
            data-stats-eyebrow
            className="flex items-center gap-3 will-change-[transform,opacity]"
          >
            <span
              data-stats-line
              className="h-px w-12 origin-left bg-kravitt-orange will-change-transform"
            />

            <span className="text-[10px] uppercase tracking-[0.4em] text-kravitt-orange sm:text-xs">
              Temporada {stats?.temporada ?? "—"}
            </span>
          </div>

          <h2
            data-stats-heading
            className="text-display text-3xl leading-tight text-kravitt-cream will-change-[transform,opacity] sm:text-5xl lg:text-6xl"
          >
            Los números cuentan la historia.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-5 lg:gap-8">
          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:col-span-3">
            <StatCard
              label="Posición final"
              value={stats?.posicionFinal ?? "—"}
              sufijo="°"
            />

            <StatCard
              label="Victorias"
              value={stats?.victorias ?? 0}
              accent
            />

            <StatCard label="Empates" value={stats?.empates ?? 0} />

            <StatCard label="Derrotas" value={stats?.derrotas ?? 0} />

            <StatCard
              label="Goles a favor"
              value={stats?.golesFavor ?? 0}
              accent
            />

            <StatCard
              label="Goles en contra"
              value={stats?.golesContra ?? 0}
            />

            <StatCard
              label="Diferencia"
              value={
                stats
                  ? `${stats.diferenciaGoles > 0 ? "+" : ""}${stats.diferenciaGoles}`
                  : 0
              }
              accent={(stats?.diferenciaGoles ?? 0) >= 0}
            />

            <StatCard
              label="Partidos"
              value={stats?.partidosJugados ?? 0}
            />

            <StatCard
              label="Fase final"
              value={stats?.faseAlcanzada ?? "—"}
              small
            />
          </div>

          {/* Top goleadores */}
          <div
            data-scorers-card
            className="flex flex-col gap-4 rounded-3xl border border-kravitt-petrol bg-kravitt-petrol/30 p-5 backdrop-blur-sm will-change-[transform,opacity] sm:p-8 lg:col-span-2"
          >
            <div
              data-scorers-header
              className="flex items-center justify-between gap-4 will-change-[transform,opacity]"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-kravitt-orange sm:text-xs">
                Top goleadores
              </span>

              <Link
                href="/estadisticas"
                className="text-[10px] text-kravitt-cream/60 transition hover:text-kravitt-orange sm:text-xs"
              >
                Ver tabla completa →
              </Link>
            </div>

            <ol className="flex flex-col gap-3">
              {goleadores.length === 0 ? (
                <li
                  data-scorer-item
                  className="py-4 text-center text-sm text-kravitt-cream/50 will-change-[transform,opacity]"
                >
                  Sin datos de goleadores aún.
                </li>
              ) : (
                goleadores.map((jugador, index) => (
                  <li
                    key={jugador.id}
                    data-scorer-item
                    className="flex items-center gap-3 rounded-2xl bg-kravitt-deep/70 px-3 py-3 will-change-[transform,opacity] sm:gap-4 sm:px-4"
                  >
                    <span
                      data-scorer-rank
                      className="w-7 shrink-0 text-center text-display text-2xl text-kravitt-orange will-change-[transform,opacity] sm:w-8 sm:text-3xl"
                    >
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-kravitt-cream sm:text-base">
                        {jugador.nombre} {jugador.apellido}
                      </p>

                      <p className="text-[9px] uppercase tracking-widest text-kravitt-cream/40 sm:text-[10px]">
                        #{jugador.dorsal}
                        {" · "}
                        {jugador.posicion}
                      </p>
                    </div>

                    <div
                      data-scorer-goals
                      className="flex shrink-0 flex-col items-end leading-tight will-change-[transform,opacity]"
                    >
                      <span className="text-display text-xl text-kravitt-cream sm:text-2xl">
                        {jugador.goles}
                      </span>

                      <span className="text-[9px] uppercase tracking-widest text-kravitt-cream/40 sm:text-[10px]">
                        Goles
                      </span>
                    </div>
                  </li>
                ))
              )}
            </ol>
          </div>
        </div>

        {stats?.resumen && (
          <p
            data-stats-summary
            className="mt-7 max-w-3xl text-sm leading-relaxed text-kravitt-cream/65 will-change-[transform,opacity] sm:mt-10 sm:text-base"
          >
            {stats.resumen}
          </p>
        )}
      </div>
    </StatsHighlightScroll>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  sufijo?: string;
  accent?: boolean;
  small?: boolean;
}

function StatCard({
  label,
  value,
  sufijo,
  accent = false,
  small = false,
}: StatCardProps) {
  return (
    <div
      data-stat-card
      className={`flex min-h-[96px] flex-col justify-between rounded-2xl border p-4 will-change-[transform,opacity] sm:min-h-[120px] sm:p-6 ${
        accent
          ? "border-kravitt-orange/40 bg-kravitt-orange/10"
          : "border-kravitt-petrol bg-kravitt-petrol/40"
      }`}
    >
      <p
        data-stat-label
        className="text-[9px] uppercase tracking-widest text-kravitt-cream/60 will-change-[transform,opacity] sm:text-xs"
      >
        {label}
      </p>

      <p
        data-stat-value
        className={`text-display leading-none will-change-[transform,opacity] ${
          small ? "text-base sm:text-xl" : "text-3xl sm:text-5xl"
        } ${accent ? "text-kravitt-orange" : "text-kravitt-cream"}`}
      >
        {value}
        {sufijo}
      </p>
    </div>
  );
}
