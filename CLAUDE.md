# AFC Kravitt — Plataforma oficial del club

@AGENTS.md

## Contexto

Sitio web del club de fútbol amateur **AFC Kravitt** (fundado 1931). Basado en `PRD_AFC_Kravitt.pdf` v1.0.
La identidad visual ya existe — escudo con luna creciente, paleta verde petróleo + naranja + crema.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (tokens declarados en `src/app/globals.css` con `@theme`, sin tailwind.config.js)
- **Data layer:** JSON local en `src/data/` (migrará a Supabase en una fase futura)
- **Hosting:** Vercel (planeado)

## Estructura

```
src/
├── app/
│   ├── layout.tsx          ← Root layout con fonts (Anton + Inter) y metadata
│   ├── globals.css         ← Paleta Kravitt + tokens Tailwind v4
│   ├── page.tsx            ← Landing page pública
│   ├── jugadores/          ← (público) lista del plantel
│   ├── partidos/           ← (público) calendario y resultados
│   ├── estadisticas/       ← (público) stats por temporada
│   └── admin/              ← Panel admin protegido (CRUD del usuario)
│       ├── jugadores/
│       ├── partidos/
│       ├── estadisticas/
│       └── configuracion/
├── components/
│   ├── layout/             ← Navbar, Footer compartidos
│   ├── landing/            ← Secciones del home
│   ├── ui/                 ← UI primitives reutilizables
│   └── admin/              ← UI específica de admin
├── data/                   ← JSON editable (la "DB" actual)
│   ├── club.json
│   ├── jugadores.json
│   ├── partidos.json
│   └── estadisticas.json
├── lib/
│   └── data.ts             ← Helpers de lectura/escritura abstraen la fuente
├── types/
│   └── index.ts            ← TS types del dominio
└── public/
    ├── logo/               ← escudo-original.jpeg, escudo-moon.jpeg
    ├── jugadores/          ← fotos individuales (subidas vía admin)
    ├── videos/             ← hero video (HyperFrames + clips reales)
    └── galeria/            ← (futuro)
```

## Reglas de oro

1. **Admin-first**: el usuario gestiona TODO el contenido desde `/admin`. NUNCA hardcodear datos en componentes; siempre leer del data layer (`@/lib/data`).
2. **Data layer abstracto**: las páginas y componentes usan los helpers de `lib/data.ts`. Si mañana migramos a Supabase, solo se reescribe ese archivo.
3. **Paleta Kravitt**: usar tokens del `@theme` en globals.css (`bg-kravitt-night`, `text-kravitt-orange`, etc.). No hardcodear hex.
4. **Server Components por default**; `"use client"` solo cuando se necesita interactividad/estado.
5. **Server Actions** para mutaciones desde el admin (forms). Marcadas con `"use server"`. Validar auth en cada una.

## Convenciones Next.js 16

- **Middleware = Proxy**: archivo `src/proxy.ts`, no `middleware.ts`.
- **Tailwind v4**: declarar tokens en `globals.css` con `@theme { --color-... }`, no en archivo JS.
- **Server Actions**: con `"use server"`. Endpoints públicos, validar auth siempre.

## Cómo arrancar

```bash
cd /Users/pmz10/Documents/afc-kravitt
npm run dev
# Abre http://localhost:3000
```

## Auth admin

Implementación inicial simple basada en password de env var + cookie httpOnly.
La password se configura en `.env.local` como `ADMIN_PASSWORD=...`.
Proxy (`src/proxy.ts`) verifica cookie en todas las rutas `/admin/*`.
