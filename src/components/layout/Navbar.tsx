import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/equipo", label: "Equipo" },
  { href: "/jugadores", label: "Jugadores" },
  { href: "/partidos", label: "Partidos" },
  { href: "/estadisticas", label: "Estadísticas" },
  { href: "/galeria", label: "Galería" },
  { href: "/contacto", label: "Contacto" },
];

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full backdrop-blur-md bg-kravitt-night/80 border-b border-kravitt-petrol">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-8 h-16 lg:h-20">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="AFC Kravitt - Inicio"
        >
          <div className="relative h-10 w-10 lg:h-12 lg:w-12 overflow-hidden rounded-lg ring-1 ring-kravitt-orange/40 group-hover:ring-kravitt-orange transition">
            <Image
              src="/logo/escudo-original.jpeg"
              alt="Escudo AFC Kravitt"
              fill
              className="object-cover"
              sizes="48px"
              priority
            />
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-display text-xl lg:text-2xl text-kravitt-cream tracking-wider">
              AFC Kravitt
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-kravitt-orange font-medium">
              Est. 1931
            </span>
          </div>
        </Link>

        <ul className="hidden lg:flex items-center gap-6 text-sm font-medium uppercase tracking-wide">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-kravitt-cream/80 hover:text-kravitt-orange transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center text-xs uppercase tracking-widest text-kravitt-cream/60 hover:text-kravitt-orange transition"
          >
            Admin
          </Link>
          <button
            type="button"
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-kravitt-petrol text-kravitt-cream"
            aria-label="Abrir menú"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
