import Image from "next/image";
import Link from "next/link";
import { getClubConfig } from "@/lib/data";

export async function Footer() {
  const club = await getClubConfig();

  return (
    <footer className="relative mt-32 border-t border-kravitt-petrol bg-kravitt-deep">
      <div className="absolute top-0 left-0 right-0 h-px divider-orange opacity-60" />
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-16 grid gap-12 lg:grid-cols-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14">
              <Image
                src={club.escudoOriginal}
                alt={`Escudo ${club.nombre}`}
                fill
                className="object-contain drop-shadow-[0_2px_6px_rgba(237,123,44,0.35)]"
                sizes="56px"
              />
            </div>
            <div>
              <p className="text-display text-2xl text-kravitt-cream tracking-wider">
                {club.nombre}
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-kravitt-orange">
                Est. {club.fundacion}
              </p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-kravitt-cream/70">
            {club.frase} — Plataforma oficial del club. Estadísticas, plantel,
            partidos y comunidad alrededor del fútbol amateur.
          </p>
        </div>

        <div>
          <h4 className="text-display text-sm tracking-widest text-kravitt-orange mb-4">
            Navegación
          </h4>
          <ul className="space-y-2 text-sm text-kravitt-cream/70">
            <li><Link href="/equipo" className="hover:text-kravitt-orange transition">Equipo</Link></li>
            <li><Link href="/jugadores" className="hover:text-kravitt-orange transition">Jugadores</Link></li>
            <li><Link href="/partidos" className="hover:text-kravitt-orange transition">Partidos</Link></li>
            <li><Link href="/estadisticas" className="hover:text-kravitt-orange transition">Estadísticas</Link></li>
            <li><Link href="/galeria" className="hover:text-kravitt-orange transition">Galería</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-display text-sm tracking-widest text-kravitt-orange mb-4">
            Club
          </h4>
          <ul className="space-y-2 text-sm text-kravitt-cream/70">
            <li><Link href="/contacto" className="hover:text-kravitt-orange transition">Contacto</Link></li>
            <li><Link href="/sponsors" className="hover:text-kravitt-orange transition">Sponsors</Link></li>
            <li><Link href="/admin" className="hover:text-kravitt-orange transition">Admin</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-kravitt-petrol/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-kravitt-cream/50">
            © {new Date().getFullYear()} {club.nombre}. Todos los derechos
            reservados.
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-kravitt-orange/70">
            Pasión · Garra · Identidad
          </p>
        </div>
      </div>
    </footer>
  );
}
