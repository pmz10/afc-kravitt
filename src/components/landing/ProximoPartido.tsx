
import Link from "next/link";

import {
  getProximoPartido,
  getRivales,
  getTorneos,
  getUltimosResultados,
} from "@/lib/data";

import { ProximoPartidoScroll } from "@/components/landing/ProximoPartidoScroll";

function formatFecha(iso: string) {
  const date = new Date(iso);

  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatHora(iso: string) {
  const date = new Date(iso);

  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const RESULTADO_LABEL: Record<
  string,
  {
    label: string;
    color: string;
  }
> = {
  ganado: {
    label: "G",
    color:
      "bg-emerald-500/20 text-emerald-300 ring-emerald-500/40",
  },

  perdido: {
    label: "P",
    color:
      "bg-red-500/20 text-red-300 ring-red-500/40",
  },

  empatado: {
    label: "E",
    color:
      "bg-amber-500/20 text-amber-300 ring-amber-500/40",
  },

  "default-favor": {
    label: "G*",
    color:
      "bg-emerald-500/20 text-emerald-300 ring-emerald-500/40",
  },

  "default-contra": {
    label: "P*",
    color:
      "bg-red-500/20 text-red-300 ring-red-500/40",
  },
};

export async function ProximoPartido() {
  const [proximo, ultimos, rivales, torneos] = await Promise.all([
    getProximoPartido(),
    getUltimosResultados(5),
    getRivales(),
    getTorneos(),
  ]);

  const nombreRival = (rivalId: string) =>
    rivales.find((r) => r.id === rivalId)?.nombre ?? "—";

  const categoriaTorneo = (torneoId: string) =>
    torneos.find((t) => t.id === torneoId)?.categoria ?? "—";

  return (
    <ProximoPartidoScroll className="bg-kravitt-deep/40">
      {/* Resplandores ambientales */}
      <div
        data-match-glow
        className="pointer-events-none absolute -left-56 top-1/4 h-[38rem] w-[38rem] rounded-full bg-kravitt-orange/8 blur-[150px]"
        aria-hidden="true"
      />

      <div
        data-match-glow
        className="pointer-events-none absolute -right-56 bottom-0 h-[40rem] w-[40rem] rounded-full bg-kravitt-petrol/30 blur-[150px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
        {/* Encabezado */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center sm:mb-10 lg:mb-12">
          <div
            data-match-eyebrow
            className="flex items-center gap-3 will-change-[transform,opacity]"
          >
            <span
              data-match-eyebrow-line
              className="h-px w-12 origin-right bg-kravitt-orange will-change-transform"
            />

            <span className="text-xs uppercase tracking-[0.4em] text-kravitt-orange">
              Calendario
            </span>

            <span
              data-match-eyebrow-line
              className="h-px w-12 origin-left bg-kravitt-orange will-change-transform"
            />
          </div>

          <h2
            data-match-heading
            className="text-display text-3xl text-kravitt-cream will-change-[transform,opacity] sm:text-5xl lg:text-6xl"
          >
            Próximo partido & resultados
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3 lg:gap-8">
          {/* Próximo partido */}
          <div
            data-match-card
            className="flex flex-col gap-5 rounded-3xl border border-kravitt-orange/30 bg-gradient-to-br from-kravitt-petrol to-kravitt-deep p-5 shadow-kravitt-deep will-change-[transform,opacity] sm:gap-6 sm:p-8 lg:col-span-2"
          >
            <div
              data-match-header
              className="flex items-center justify-between will-change-[transform,opacity]"
            >
              <span className="text-xs uppercase tracking-[0.3em] text-kravitt-orange">
                Próximo partido
              </span>

              <span className="text-xs uppercase tracking-widest text-kravitt-cream/50">
<<<<<<< HEAD
                {proximo
                  ? proximo.categoria
                  : "—"}
=======
                {proximo ? categoriaTorneo(proximo.torneoId) : "—"}
>>>>>>> origin/main
              </span>
            </div>

            {proximo ? (
              <>
                <div className="grid grid-cols-3 items-center gap-3 sm:gap-8">
                  {/* AFC Kravitt */}
                  <div
                    data-match-local
                    className="flex flex-col items-center gap-2 will-change-[transform,opacity]"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-kravitt-orange/15 text-display text-xl text-kravitt-orange ring-1 ring-kravitt-orange/40 sm:h-24 sm:w-24 sm:text-4xl lg:h-28 lg:w-28">
                      AFC
                    </div>

                    <p className="text-display text-base text-kravitt-cream sm:text-xl">
                      Kravitt
                    </p>
                  </div>

                  {/* VS */}
                  <div
                    data-match-versus
                    className="flex flex-col items-center gap-1 text-center will-change-[transform,opacity]"
                  >
                    <p className="text-display text-3xl text-kravitt-cream sm:text-5xl">
                      VS
                    </p>

                    <p className="text-[10px] uppercase tracking-widest text-kravitt-cream/60 sm:text-xs">
<<<<<<< HEAD
                      {proximo.esLocal
                        ? "Local"
                        : "Visitante"}
=======
                      {proximo.esLocal ? "Local" : "Visitante"}
>>>>>>> origin/main
                    </p>
                  </div>

                  {/* Rival */}
                  <div
                    data-match-rival
                    className="flex flex-col items-center gap-2 will-change-[transform,opacity]"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-kravitt-petrol-2/60 text-display text-lg text-kravitt-cream ring-1 ring-kravitt-cream/10 sm:h-24 sm:w-24 sm:text-3xl lg:h-28 lg:w-28">
<<<<<<< HEAD
                      {proximo.rival
                        .slice(0, 3)
                        .toUpperCase()}
                    </div>

                    <p className="text-center text-display text-sm text-kravitt-cream sm:text-xl">
                      {proximo.rival}
=======
                      {nombreRival(proximo.rivalId).slice(0, 3).toUpperCase()}
                    </div>

                    <p className="text-center text-display text-sm text-kravitt-cream sm:text-xl">
                      {nombreRival(proximo.rivalId)}
>>>>>>> origin/main
                    </p>
                  </div>
                </div>

                {/* Información del partido */}
                <div
                  data-match-details
                  className="mt-2 grid grid-cols-2 gap-4 border-t border-kravitt-petrol pt-5 will-change-[transform,opacity] sm:mt-4 sm:grid-cols-3 sm:pt-6"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-kravitt-cream/50 sm:text-xs">
                      Fecha
                    </p>

                    <p className="text-sm capitalize text-kravitt-cream sm:text-base">
<<<<<<< HEAD
                      {formatFecha(
                        proximo.fecha,
                      )}
=======
                      {formatFecha(proximo.fecha)}
>>>>>>> origin/main
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-kravitt-cream/50 sm:text-xs">
                      Hora
                    </p>

                    <p className="text-sm text-kravitt-cream sm:text-base">
<<<<<<< HEAD
                      {formatHora(
                        proximo.fecha,
                      )}
=======
                      {formatHora(proximo.fecha)}
>>>>>>> origin/main
                    </p>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[10px] uppercase tracking-widest text-kravitt-cream/50 sm:text-xs">
                      Jornada
                    </p>

                    <p className="text-sm text-kravitt-cream sm:text-base">
<<<<<<< HEAD
                      #
                      {proximo.jornada ??
                        "—"}
=======
                      #{proximo.jornada ?? "—"}
>>>>>>> origin/main
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div
                data-match-empty
                className="py-8 text-center will-change-[transform,opacity] sm:py-12"
              >
                <p className="mb-2 text-display text-2xl text-kravitt-cream/70">
                  Sin partidos próximos
                </p>

                <p className="mb-6 text-sm text-kravitt-cream/50">
<<<<<<< HEAD
                  La temporada 24-25 ha
                  concluido. Próximamente
                  arranque de la nueva
                  temporada.
=======
                  La temporada anterior ha concluido. Próximamente arranque de
                  la nueva temporada.
>>>>>>> origin/main
                </p>

                <Link
                  href="/admin/partidos"
                  className="text-xs uppercase tracking-widest text-kravitt-orange transition hover:text-kravitt-orange-2"
                >
                  Programar partido →
                </Link>
              </div>
            )}
          </div>

          {/* Últimos resultados */}
          <div
            data-results-card
            className="flex flex-col gap-4 rounded-3xl border border-kravitt-petrol bg-kravitt-petrol/30 p-5 will-change-[transform,opacity] sm:p-7 lg:p-8"
          >
            <div
              data-results-header
              className="mb-2 flex items-center justify-between will-change-[transform,opacity]"
            >
              <span className="text-xs uppercase tracking-[0.3em] text-kravitt-orange">
                Últimos resultados
              </span>

              <Link
                href="/partidos"
                className="text-xs text-kravitt-cream/60 transition hover:text-kravitt-orange"
              >
                Ver todo →
              </Link>
            </div>

            <ul className="flex flex-col gap-2">
              {ultimos.map((partido) => {
                const resultado =
<<<<<<< HEAD
                  RESULTADO_LABEL[
                    partido.resultado
                  ] ??
=======
                  RESULTADO_LABEL[partido.resultado] ??
>>>>>>> origin/main
                  RESULTADO_LABEL.perdido;

                return (
                  <li
                    key={partido.id}
                    data-result-item
                    className="flex items-center gap-3 rounded-xl bg-kravitt-deep/60 px-3 py-2 will-change-[transform,opacity]"
                  >
                    <span
                      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ring-1 ${resultado.color}`}
                    >
                      {resultado.label}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-kravitt-cream">
<<<<<<< HEAD
                        {partido.rival}
=======
                        {nombreRival(partido.rivalId)}
>>>>>>> origin/main
                      </p>

                      <p className="text-[10px] uppercase tracking-widest text-kravitt-cream/40">
                        J{partido.jornada}
                        {" · "}
<<<<<<< HEAD
                        {partido.esLocal
                          ? "Local"
                          : "Visita"}
=======
                        {partido.esLocal ? "Local" : "Visita"}
>>>>>>> origin/main
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </ProximoPartidoScroll>
  );
}

