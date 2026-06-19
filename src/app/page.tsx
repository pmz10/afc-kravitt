import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { AboutClub } from "@/components/landing/AboutClub";
import { CTASection } from "@/components/landing/CTASection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <AboutClub />

        {/* Cartel temporal mientras armamos el admin */}
        <section className="bg-neutral-950 text-neutral-100 py-16 px-6 border-y border-neutral-800">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <p className="text-xs uppercase tracking-widest text-orange-500">
              En construcción
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold">
              Estamos preparando el plantel, los resultados y las estadísticas
            </h2>
            <p className="text-neutral-400">
              Próximamente: convocados, próximo partido, top goleadores y récord
              de la temporada. Volvé pronto.
            </p>
            <Link
              href="/admin"
              className="inline-block mt-4 px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-medium"
            >
              Panel admin
            </Link>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </>
  );
}