import Link from "next/link";

import { getJugadores, getPartidos } from "@/lib/data";
import { getStatsJugador } from "@/lib/stats";
import { PlantelDestacadoScroll } from "@/components/landing/PlantelDestacadoScroll";

const POSICION_LABEL: Record<string, string> = {
  POR: "Portero",
  DEF: "Defensa",
  MED: "Mediocampista",
  DEL: "Delantero",
};

export async function PlantelDestacado() {
  const [all, partidos] = await Promise.all([
    getJugadores(),
    getPartidos(),
  ]);

  /*
   * Solo jugadores activos. Capitán primero, después por goles derivados,
   * y finalmente se toman ocho jugadores.
   */
  const destacados = all
    .filter((j) => j.activo)
    .map((j) => ({
      jugador: j,
      stats: getStatsJugador(j, partidos),
    }))
    .sort((a, b) => {
      if (a.jugador.capitan && !b.jugador.capitan) {
        return -1;
      }

      if (!a.jugador.capitan && b.jugador.capitan) {
        return 1;
      }

      return b.stats.goles - a.stats.goles;
    })
    .slice(0, 8);

  return (
    <PlantelDestacadoScroll className="bg-kravitt-deep/40">
      {/* Luces ambientales */}
      <div
        data-squad-glow
        className="pointer-events-none absolute -left-52 top-1/4 h-[38rem] w-[38rem] rounded-full bg-kravitt-orange/8 blur-[150px]"
        aria-hidden="true"
      />

      <div
        data-squad-glow
        className="pointer-events-none absolute -right-52 bottom-0 h-[40rem] w-[40rem] rounded-full bg-kravitt-petrol/30 blur-[150px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
        {/* Encabezado */}
        <div className="mb-5 flex flex-col justify-between gap-4 sm:mb-8 sm:gap-6 lg:mb-10 lg:flex-row lg:items-end">
          <div className="flex flex-col gap-2 sm:gap-3">
            <div
              data-squad-eyebrow
              className="flex items-center gap-3 will-change-[transform,opacity]"
            >
              <span
                data-squad-line
                className="h-px w-12 origin-left bg-kravitt-orange will-change-transform"
              />

              <span className="text-[10px] uppercase tracking-[0.4em] text-kravitt-orange sm:text-xs">
                El plantel
              </span>
            </div>

            <h2
              data-squad-heading
              className="text-display text-3xl leading-tight text-kravitt-cream will-change-[transform,opacity] sm:text-5xl lg:text-6xl"
            >
              Los protagonistas en cancha.
            </h2>
          </div>

          <Link
            data-squad-link
            href="/jugadores"
            className="inline-flex self-start items-center gap-2 text-xs uppercase tracking-widest text-kravitt-cream/70 transition hover:text-kravitt-orange sm:text-sm lg:self-auto"
          >
            Ver plantel completo

            <span aria-hidden="true">
              →
            </span>
          </Link>
        </div>

        {/* Tarjetas */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {destacados.map(({ jugador, stats }) => (
            <div
              key={jugador.id}
              data-player-card
              className="will-change-[transform,opacity]"
            >
              <article className="group relative overflow-hidden rounded-2xl border border-kravitt-petrol bg-gradient-to-b from-kravitt-petrol/40 to-kravitt-deep/60 transition-all duration-300 hover:-translate-y-1 hover:border-kravitt-orange/60 hover:shadow-[0_18px_45px_rgba(237,123,44,0.12)]">
                {/* Dorsal de fondo */}
                <div
                  data-player-number
                  className="pointer-events-none absolute right-1 top-1 select-none text-display text-5xl leading-none text-kravitt-orange/10 will-change-[transform,opacity] sm:right-2 sm:top-2 sm:text-7xl lg:text-8xl"
                >
                  {jugador.dorsal}
                </div>

                <div className="relative flex min-h-[132px] flex-col gap-2 p-3 sm:min-h-[180px] sm:gap-3 sm:p-5 lg:min-h-[220px] lg:p-6">
                  {/* Posición y capitán */}
                  <div
                    data-player-tags
                    className="flex flex-wrap items-center gap-1.5 will-change-[transform,opacity] sm:gap-2"
                  >
                    <span className="inline-flex h-5 items-center rounded-md bg-kravitt-orange/20 px-1.5 text-[8px] font-bold uppercase tracking-widest text-kravitt-orange ring-1 ring-kravitt-orange/30 sm:h-6 sm:px-2 sm:text-[10px]">
                      {POSICION_LABEL[jugador.posicion]}
                    </span>

                    {jugador.capitan && (
                      <span className="inline-flex h-5 items-center rounded-md bg-kravitt-cream/10 px-1.5 text-[8px] font-bold uppercase tracking-widest text-kravitt-cream ring-1 ring-kravitt-cream/30 sm:h-6 sm:px-2 sm:text-[10px]">
                        Capitán
                      </span>
                    )}
                  </div>

                  <div className="flex-1" />

                  {/* Nombre */}
                  <div
                    data-player-name
                    className="will-change-[transform,opacity]"
                  >
                    <p className="text-[8px] uppercase tracking-widest text-kravitt-cream/50 sm:text-xs">
                      Dorsal {jugador.dorsal}
                    </p>

                    <p className="text-display text-base leading-tight text-kravitt-cream sm:text-xl lg:text-2xl">
                      {jugador.nombre}
                      <br />

                      <span className="text-kravitt-orange">
                        {jugador.apellido}
                      </span>
                    </p>
                  </div>

                  {/* Estadísticas */}
                  <div
                    data-player-stats
                    className="flex items-center justify-between border-t border-kravitt-petrol/80 pt-2 will-change-[transform,opacity] sm:pt-3"
                  >
                    <span className="text-[8px] uppercase tracking-widest text-kravitt-cream/50 sm:text-[10px]">
                      Goles {stats.goles}
                      {" · "}
                      PJ {stats.partidosJugados}
                    </span>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </PlantelDestacadoScroll>
  );
}

