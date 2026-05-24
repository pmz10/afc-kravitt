import Link from "next/link";
import { getProximoPartido, getUltimosResultados } from "@/lib/data";

function formatFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatHora(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

const RESULTADO_LABEL: Record<string, { label: string; color: string }> = {
  ganado: { label: "G", color: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/40" },
  perdido: { label: "P", color: "bg-red-500/20 text-red-300 ring-red-500/40" },
  empatado: { label: "E", color: "bg-amber-500/20 text-amber-300 ring-amber-500/40" },
  "default-favor": { label: "G*", color: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/40" },
  "default-contra": { label: "P*", color: "bg-red-500/20 text-red-300 ring-red-500/40" },
};

export async function ProximoPartido() {
  const proximo = await getProximoPartido();
  const ultimos = await getUltimosResultados(5);

  return (
    <section className="relative py-24 sm:py-32 bg-kravitt-deep/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col gap-3 items-center text-center mb-12 lg:mb-16">
          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-kravitt-orange" />
            <span className="text-xs uppercase tracking-[0.4em] text-kravitt-orange">
              Calendario
            </span>
            <span className="h-px w-12 bg-kravitt-orange" />
          </div>
          <h2 className="text-display text-4xl sm:text-5xl lg:text-6xl text-kravitt-cream">
            Próximo partido & resultados
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Próximo partido (destacado) */}
          <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-kravitt-petrol to-kravitt-deep border border-kravitt-orange/30 p-6 sm:p-10 flex flex-col gap-6 shadow-kravitt-deep">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-kravitt-orange">
                Próximo partido
              </span>
              <span className="text-xs uppercase tracking-widest text-kravitt-cream/50">
                {proximo ? proximo.categoria : "—"}
              </span>
            </div>

            {proximo ? (
              <>
                <div className="grid grid-cols-3 items-center gap-4 sm:gap-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-20 w-20 sm:h-28 sm:w-28 rounded-2xl bg-kravitt-orange/15 ring-1 ring-kravitt-orange/40 flex items-center justify-center text-display text-2xl sm:text-4xl text-kravitt-orange">
                      AFC
                    </div>
                    <p className="text-display text-lg sm:text-xl text-kravitt-cream">
                      Kravitt
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <p className="text-display text-3xl sm:text-5xl text-kravitt-cream">
                      VS
                    </p>
                    <p className="text-xs uppercase tracking-widest text-kravitt-cream/60">
                      {proximo.esLocal ? "Local" : "Visitante"}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-20 w-20 sm:h-28 sm:w-28 rounded-2xl bg-kravitt-petrol-2/60 ring-1 ring-kravitt-cream/10 flex items-center justify-center text-display text-2xl sm:text-3xl text-kravitt-cream">
                      {proximo.rival.slice(0, 3).toUpperCase()}
                    </div>
                    <p className="text-display text-lg sm:text-xl text-kravitt-cream text-center">
                      {proximo.rival}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 pt-6 border-t border-kravitt-petrol">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-kravitt-cream/50">
                      Fecha
                    </p>
                    <p className="text-base text-kravitt-cream capitalize">
                      {formatFecha(proximo.fecha)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-kravitt-cream/50">
                      Hora
                    </p>
                    <p className="text-base text-kravitt-cream">
                      {formatHora(proximo.fecha)}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-xs uppercase tracking-widest text-kravitt-cream/50">
                      Jornada
                    </p>
                    <p className="text-base text-kravitt-cream">
                      #{proximo.jornada ?? "—"}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <p className="text-display text-2xl text-kravitt-cream/70 mb-2">
                  Sin partidos próximos
                </p>
                <p className="text-sm text-kravitt-cream/50 mb-6">
                  La temporada 24-25 ha concluido. Próximamente arranque de la
                  nueva temporada.
                </p>
                <Link
                  href="/admin/partidos"
                  className="text-xs uppercase tracking-widest text-kravitt-orange hover:text-kravitt-orange-2"
                >
                  Programar partido →
                </Link>
              </div>
            )}
          </div>

          {/* Últimos 5 resultados */}
          <div className="rounded-3xl bg-kravitt-petrol/30 border border-kravitt-petrol p-6 sm:p-8 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-[0.3em] text-kravitt-orange">
                Últimos resultados
              </span>
              <Link
                href="/partidos"
                className="text-xs text-kravitt-cream/60 hover:text-kravitt-orange"
              >
                Ver todo →
              </Link>
            </div>
            <ul className="flex flex-col gap-2">
              {ultimos.map((p) => {
                const res = RESULTADO_LABEL[p.resultado] ?? RESULTADO_LABEL["perdido"];
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl bg-kravitt-deep/60 px-3 py-2"
                  >
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-md ring-1 text-xs font-bold ${res.color}`}
                    >
                      {res.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-kravitt-cream truncate">
                        {p.rival}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-kravitt-cream/40">
                        J{p.jornada} · {p.esLocal ? "Local" : "Visita"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
