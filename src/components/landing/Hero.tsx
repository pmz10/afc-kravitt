import Image from "next/image";
import Link from "next/link";
import { getClubConfig } from "@/lib/data";

export async function Hero() {
  const club = await getClubConfig();

  return (
    <section className="relative isolate min-h-[100svh] flex items-center overflow-hidden pt-20 lg:pt-24">
      {/* Fondo: gradiente + mesh */}
      <div className="absolute inset-0 -z-10 bg-mesh-kravitt" />
      <div
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 70% 30%, rgba(237,123,44,0.18), transparent 50%), radial-gradient(circle at 20% 80%, rgba(15,52,56,0.6), transparent 60%)",
        }}
      />
      {/* Placeholder donde irá el video HyperFrames + clip real */}
      <div
        className="absolute inset-0 -z-20 opacity-20 mix-blend-screen"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-b from-kravitt-deep via-transparent to-kravitt-deep" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12 px-4 sm:px-8 py-20">
        {/* Texto */}
        <div className="lg:col-span-7 flex flex-col gap-6 lg:gap-8 animate-fade-up">
          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-kravitt-orange" />
            <span className="text-xs uppercase tracking-[0.4em] text-kravitt-orange font-medium">
              Fundado en {club.fundacion}
            </span>
          </div>

          <h1 className="text-display text-5xl sm:text-7xl lg:text-8xl xl:text-9xl leading-[0.9] text-kravitt-cream">
            <span className="block">AFC</span>
            <span className="block text-shine">Kravitt</span>
          </h1>

          <p className="text-display text-2xl sm:text-3xl lg:text-4xl text-kravitt-cream/90 max-w-2xl">
            {club.frase}
          </p>

          <p className="text-base sm:text-lg text-kravitt-cream/70 max-w-xl leading-relaxed">
            La plataforma oficial del club. Plantel, estadísticas, partidos y
            comunidad — todo lo que rodea a nuestro fútbol, en un solo lugar.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/equipo"
              className="group inline-flex items-center gap-2 rounded-full bg-kravitt-orange px-6 sm:px-8 py-3 sm:py-4 text-sm font-bold uppercase tracking-widest text-kravitt-deep hover:bg-kravitt-orange-2 transition shadow-kravitt-orange"
            >
              Conoce al equipo
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
              </svg>
            </Link>
            <Link
              href="/partidos"
              className="inline-flex items-center gap-2 rounded-full border border-kravitt-cream/30 px-6 sm:px-8 py-3 sm:py-4 text-sm font-bold uppercase tracking-widest text-kravitt-cream hover:border-kravitt-orange hover:text-kravitt-orange transition"
            >
              Ver partidos
            </Link>
          </div>
        </div>

        {/* Escudo gigante flotando con glow naranja */}
        <div className="lg:col-span-5 relative flex justify-center lg:justify-end animate-fade-up [animation-delay:200ms]">
          <div className="relative aspect-square w-[280px] sm:w-[380px] lg:w-[480px] xl:w-[560px]">
            {/* Capas de glow detrás del escudo */}
            <div className="absolute inset-0 rounded-full bg-kravitt-orange/25 blur-[100px] scale-90" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-kravitt-orange/20 to-kravitt-petrol/30 blur-3xl" />
            <div className="absolute inset-[15%] rounded-full bg-kravitt-orange/15 blur-2xl" />
            {/* Escudo PNG transparente - flota libre */}
            <Image
              src={club.escudoOriginal}
              alt={`Escudo ${club.nombre}`}
              fill
              className="object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.45)]"
              sizes="(min-width: 1280px) 560px, (min-width: 1024px) 480px, (min-width: 640px) 380px, 280px"
              priority
            />
          </div>
        </div>
      </div>

      {/* Indicador scroll */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-kravitt-cream/40 animate-fade-up [animation-delay:600ms]">
        <span className="text-[10px] uppercase tracking-[0.4em]">Scroll</span>
        <div className="h-10 w-px bg-gradient-to-b from-kravitt-orange to-transparent" />
      </div>
    </section>
  );
}
