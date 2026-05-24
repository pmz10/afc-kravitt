import Link from "next/link";
import { getEstadisticasTemporadaActual, getTopGoleadores } from "@/lib/data";

export async function StatsHighlight() {
  const stats = await getEstadisticasTemporadaActual();
  const goleadores = await getTopGoleadores(3);

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-30 bg-mesh-kravitt" />
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col gap-3 items-start mb-12 lg:mb-16">
          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-kravitt-orange" />
            <span className="text-xs uppercase tracking-[0.4em] text-kravitt-orange">
              Temporada {stats?.temporada ?? "—"}
            </span>
          </div>
          <h2 className="text-display text-4xl sm:text-5xl lg:text-6xl text-kravitt-cream leading-tight">
            Los números cuentan la historia.
          </h2>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Cards de stats */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard label="Posición final" value={stats?.posicionFinal ?? "—"} sufijo="°" />
            <StatCard label="Victorias" value={stats?.victorias ?? 0} accent />
            <StatCard label="Empates" value={stats?.empates ?? 0} />
            <StatCard label="Derrotas" value={stats?.derrotas ?? 0} />
            <StatCard label="Goles a favor" value={stats?.golesFavor ?? 0} accent />
            <StatCard label="Goles en contra" value={stats?.golesContra ?? 0} />
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
          <div className="lg:col-span-2 rounded-3xl bg-kravitt-petrol/30 border border-kravitt-petrol p-6 sm:p-8 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-kravitt-orange">
                Top goleadores
              </span>
              <Link
                href="/estadisticas"
                className="text-xs text-kravitt-cream/60 hover:text-kravitt-orange"
              >
                Ver tabla completa →
              </Link>
            </div>
            <ol className="flex flex-col gap-3">
              {goleadores.length === 0 ? (
                <li className="text-sm text-kravitt-cream/50 py-4 text-center">
                  Sin datos de goleadores aún.
                </li>
              ) : (
                goleadores.map((j, i) => (
                  <li
                    key={j.id}
                    className="flex items-center gap-4 rounded-2xl bg-kravitt-deep/70 px-4 py-3"
                  >
                    <span className="text-display text-3xl text-kravitt-orange w-8 text-center">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-base text-kravitt-cream truncate">
                        {j.nombre} {j.apellido}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-kravitt-cream/40">
                        #{j.dorsal} · {j.posicion}
                      </p>
                    </div>
                    <div className="flex flex-col items-end leading-tight">
                      <span className="text-display text-2xl text-kravitt-cream">
                        {j.goles}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-kravitt-cream/40">
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
          <p className="mt-10 max-w-3xl text-kravitt-cream/65 leading-relaxed">
            {stats.resumen}
          </p>
        )}
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  sufijo,
  accent,
  small,
}: {
  label: string;
  value: number | string;
  sufijo?: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 flex flex-col justify-between min-h-[120px] ${
        accent
          ? "bg-kravitt-orange/10 border-kravitt-orange/40"
          : "bg-kravitt-petrol/40 border-kravitt-petrol"
      }`}
    >
      <p className="text-xs uppercase tracking-widest text-kravitt-cream/60">
        {label}
      </p>
      <p
        className={`text-display ${
          small ? "text-xl" : "text-4xl sm:text-5xl"
        } ${accent ? "text-kravitt-orange" : "text-kravitt-cream"}`}
      >
        {value}
        {sufijo}
      </p>
    </div>
  );
}
