import Link from "next/link";
import { getJugadores } from "@/lib/data";

const POSICION_LABEL: Record<string, string> = {
  POR: "Portero",
  DEF: "Defensa",
  MED: "Mediocampista",
  DEL: "Delantero",
};

export async function PlantelDestacado() {
  const all = await getJugadores();
  // Mostrar 8 destacados: capitán primero, después por goles, después orden natural
  const destacados = [...all]
    .sort((a, b) => {
      if (a.capitan && !b.capitan) return -1;
      if (!a.capitan && b.capitan) return 1;
      return b.stats.goles - a.stats.goles;
    })
    .slice(0, 8);

  return (
    <section className="relative py-24 sm:py-32 bg-kravitt-deep/40 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 lg:mb-16">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="h-px w-12 bg-kravitt-orange" />
              <span className="text-xs uppercase tracking-[0.4em] text-kravitt-orange">
                El plantel
              </span>
            </div>
            <h2 className="text-display text-4xl sm:text-5xl lg:text-6xl text-kravitt-cream">
              Los protagonistas en cancha.
            </h2>
          </div>
          <Link
            href="/jugadores"
            className="self-start lg:self-auto inline-flex items-center gap-2 text-sm uppercase tracking-widest text-kravitt-cream/70 hover:text-kravitt-orange transition"
          >
            Ver plantel completo
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {destacados.map((j) => (
            <article
              key={j.id}
              className="group relative rounded-2xl border border-kravitt-petrol bg-gradient-to-b from-kravitt-petrol/40 to-kravitt-deep/60 overflow-hidden hover:border-kravitt-orange/60 transition-all hover:-translate-y-1"
            >
              {/* Fondo: dorsal grandote */}
              <div className="absolute right-2 top-2 text-display text-7xl sm:text-8xl text-kravitt-orange/10 leading-none select-none pointer-events-none">
                {j.dorsal}
              </div>

              <div className="relative p-5 sm:p-6 flex flex-col gap-3 min-h-[200px] sm:min-h-[220px]">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 items-center rounded-md bg-kravitt-orange/20 px-2 text-[10px] font-bold uppercase tracking-widest text-kravitt-orange ring-1 ring-kravitt-orange/30">
                    {POSICION_LABEL[j.posicion]}
                  </span>
                  {j.capitan && (
                    <span className="inline-flex h-6 items-center rounded-md bg-kravitt-cream/10 px-2 text-[10px] font-bold uppercase tracking-widest text-kravitt-cream ring-1 ring-kravitt-cream/30">
                      Capitán
                    </span>
                  )}
                </div>

                <div className="flex-1" />

                <div>
                  <p className="text-xs uppercase tracking-widest text-kravitt-cream/50">
                    Dorsal {j.dorsal}
                  </p>
                  <p className="text-display text-xl sm:text-2xl text-kravitt-cream leading-tight">
                    {j.nombre}
                    <br />
                    <span className="text-kravitt-orange">{j.apellido}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-kravitt-petrol/80">
                  <span className="text-[10px] uppercase tracking-widest text-kravitt-cream/50">
                    Goles {j.stats.goles} · PJ {j.stats.partidosJugados}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
