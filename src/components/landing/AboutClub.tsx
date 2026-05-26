import { getClubConfig } from "@/lib/data";
import { EscudoVariant } from "@/components/ui/EscudoVariant";

export async function AboutClub() {
  const club = await getClubConfig();

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="relative">
          {/* Versión DORADA del escudo — sensación premium, "primordial" */}
          <EscudoVariant
            variant="gold"
            className="aspect-square max-w-md mx-auto"
          />
          <div className="absolute -bottom-2 -left-2 sm:-bottom-6 sm:-left-6 hidden sm:flex h-24 w-24 items-center justify-center rounded-2xl bg-kravitt-orange text-kravitt-deep shadow-kravitt-orange">
            <span className="text-display text-3xl">{club.fundacion}</span>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-kravitt-orange" />
            <span className="text-xs uppercase tracking-[0.4em] text-kravitt-orange">
              El club
            </span>
          </div>
          <h2 className="text-display text-4xl sm:text-5xl lg:text-6xl text-kravitt-cream leading-tight">
            Más que un equipo,
            <br />
            <span className="text-kravitt-orange">una identidad.</span>
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-kravitt-cream/75 max-w-xl">
            AFC Kravitt nace con la idea de transformar el fútbol amateur en un
            espacio donde la pasión por el deporte se mezcla con identidad,
            comunidad y crecimiento. Desde nuestra fundación, hemos forjado un
            club construido alrededor de los jugadores, los seguidores y la
            historia que escribimos cada temporada.
          </p>

          <ul className="grid grid-cols-2 gap-4 mt-4">
            <li className="rounded-2xl bg-kravitt-petrol/40 border border-kravitt-petrol p-4">
              <p className="text-display text-3xl text-kravitt-orange">25</p>
              <p className="text-xs uppercase tracking-wider text-kravitt-cream/70 mt-1">
                Partidos jugados 24-25
              </p>
            </li>
            <li className="rounded-2xl bg-kravitt-petrol/40 border border-kravitt-petrol p-4">
              <p className="text-display text-3xl text-kravitt-orange">132</p>
              <p className="text-xs uppercase tracking-wider text-kravitt-cream/70 mt-1">
                Goles generados
              </p>
            </li>
            <li className="rounded-2xl bg-kravitt-petrol/40 border border-kravitt-petrol p-4">
              <p className="text-display text-3xl text-kravitt-orange">12</p>
              <p className="text-xs uppercase tracking-wider text-kravitt-cream/70 mt-1">
                Jugadores en plantel
              </p>
            </li>
            <li className="rounded-2xl bg-kravitt-petrol/40 border border-kravitt-petrol p-4">
              <p className="text-display text-3xl text-kravitt-orange">8°</p>
              <p className="text-xs uppercase tracking-wider text-kravitt-cream/70 mt-1">
                Fase: Octavos
              </p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
