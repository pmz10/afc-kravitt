
import { getClubConfig } from "@/lib/data";
import { EscudoVariant } from "@/components/ui/EscudoVariant";
import { AboutClubScroll } from "@/components/landing/AboutClubScroll";

export async function AboutClub() {
  const club = await getClubConfig();

  return (
    <AboutClubScroll>
      {/*
       * Luces ambientales.
       *
       * No se agrega un color sólido de fondo,
       * por lo que se mantiene el fondo original
       * de tu página y se conecta con el Hero.
       */}
      <div
        data-about-glow
        className="pointer-events-none absolute -left-40 top-1/4 h-[34rem] w-[34rem] rounded-full bg-kravitt-orange/10 blur-[130px]"
        aria-hidden="true"
      />

      <div
        data-about-glow
        className="pointer-events-none absolute -right-52 bottom-0 h-[38rem] w-[38rem] rounded-full bg-kravitt-petrol/30 blur-[140px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-5 px-4 sm:gap-8 sm:px-8 lg:grid-cols-2 lg:gap-20">
        {/* Columna del escudo */}
        <div
          data-about-shield
          className="relative mx-auto w-full max-w-[180px] will-change-[transform,opacity] sm:max-w-[260px] lg:max-w-md"
        >
          <EscudoVariant
            variant="gold"
            className="mx-auto aspect-square w-full"
          />

          <div
            data-about-foundation
            className="absolute -bottom-2 -left-2 hidden h-20 w-20 items-center justify-center rounded-2xl bg-kravitt-orange text-kravitt-deep shadow-kravitt-orange will-change-[transform,opacity] sm:-bottom-6 sm:-left-6 sm:flex sm:h-24 sm:w-24"
          >
            <span className="text-display text-2xl sm:text-3xl">
              {club.fundacion}
            </span>
          </div>
        </div>

        {/* Columna de información */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <div
            data-about-eyebrow
            className="flex items-center gap-3 will-change-[transform,opacity]"
          >
            <span
              data-about-eyebrow-line
              className="h-px w-12 origin-left bg-kravitt-orange will-change-transform"
            />

            <span className="text-xs uppercase tracking-[0.4em] text-kravitt-orange">
              El club
            </span>
          </div>

          <h2
            data-about-heading
            className="text-display text-4xl leading-tight text-kravitt-cream will-change-[transform,opacity] sm:text-5xl lg:text-6xl"
          >
            Más que un equipo,
            <br />

            <span className="text-kravitt-orange">
              una identidad.
            </span>
          </h2>

          <p
            data-about-description
            className="max-w-xl text-sm leading-relaxed text-kravitt-cream/75 will-change-[transform,opacity] sm:text-lg"
          >
            AFC Kravitt nace con la idea de transformar el fútbol
            amateur en un espacio donde la pasión por el deporte se
            mezcla con identidad, comunidad y crecimiento. Desde
            nuestra fundación, hemos forjado un club construido
            alrededor de los jugadores, los seguidores y la historia
            que escribimos cada temporada.
          </p>

          <ul className="mt-1 grid grid-cols-2 gap-3 sm:mt-4 sm:gap-4">
            <li
              data-about-card
              className="rounded-2xl border border-kravitt-petrol bg-kravitt-petrol/40 p-3 backdrop-blur-sm will-change-[transform,opacity] sm:p-4"
            >
              <p className="text-display text-2xl text-kravitt-orange sm:text-3xl">
                25
              </p>

              <p className="mt-1 text-[10px] uppercase tracking-wider text-kravitt-cream/70 sm:text-xs">
                Partidos jugados 24-25
              </p>
            </li>

            <li
              data-about-card
              className="rounded-2xl border border-kravitt-petrol bg-kravitt-petrol/40 p-3 backdrop-blur-sm will-change-[transform,opacity] sm:p-4"
            >
              <p className="text-display text-2xl text-kravitt-orange sm:text-3xl">
                132
              </p>

              <p className="mt-1 text-[10px] uppercase tracking-wider text-kravitt-cream/70 sm:text-xs">
                Goles generados
              </p>
            </li>

            <li
              data-about-card
              className="rounded-2xl border border-kravitt-petrol bg-kravitt-petrol/40 p-3 backdrop-blur-sm will-change-[transform,opacity] sm:p-4"
            >
              <p className="text-display text-2xl text-kravitt-orange sm:text-3xl">
                12
              </p>

              <p className="mt-1 text-[10px] uppercase tracking-wider text-kravitt-cream/70 sm:text-xs">
                Jugadores en plantel
              </p>
            </li>

            <li
              data-about-card
              className="rounded-2xl border border-kravitt-petrol bg-kravitt-petrol/40 p-3 backdrop-blur-sm will-change-[transform,opacity] sm:p-4"
            >
              <p className="text-display text-2xl text-kravitt-orange sm:text-3xl">
                8°
              </p>

              <p className="mt-1 text-[10px] uppercase tracking-wider text-kravitt-cream/70 sm:text-xs">
                Fase: Octavos
              </p>
            </li>
          </ul>
        </div>
      </div>
    </AboutClubScroll>
  );
}

