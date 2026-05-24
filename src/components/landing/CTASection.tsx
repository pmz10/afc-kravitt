import Link from "next/link";

export function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-kravitt-orange/15 via-transparent to-kravitt-petrol/40" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 50%, rgba(237,123,44,0.25), transparent 50%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-8 text-center flex flex-col items-center gap-8">
        <div className="flex items-center gap-3">
          <span className="h-px w-12 bg-kravitt-orange" />
          <span className="text-xs uppercase tracking-[0.4em] text-kravitt-orange">
            Súmate
          </span>
          <span className="h-px w-12 bg-kravitt-orange" />
        </div>

        <h2 className="text-display text-4xl sm:text-6xl lg:text-7xl text-kravitt-cream leading-[0.95]">
          La historia de Kravitt
          <br />
          <span className="text-shine">la escribimos juntos.</span>
        </h2>

        <p className="max-w-2xl text-base sm:text-lg text-kravitt-cream/70 leading-relaxed">
          Síguenos en redes sociales, conoce a nuestros jugadores y vive cada
          partido al lado del club. Pasión, garra e identidad — todos los días.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 rounded-full bg-kravitt-orange px-8 py-4 text-sm font-bold uppercase tracking-widest text-kravitt-deep hover:bg-kravitt-orange-2 transition shadow-kravitt-orange"
          >
            Contáctanos
          </Link>
          <Link
            href="/equipo"
            className="inline-flex items-center gap-2 rounded-full border border-kravitt-cream/30 px-8 py-4 text-sm font-bold uppercase tracking-widest text-kravitt-cream hover:border-kravitt-orange hover:text-kravitt-orange transition"
          >
            Conoce el club
          </Link>
        </div>
      </div>
    </section>
  );
}
