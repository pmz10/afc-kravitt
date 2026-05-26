/**
 * EscudoVintage — versión alterna del escudo AFC Kravitt en estilo
 * brutalista / heráldico antiguo / woodcut.
 *
 * - Conserva la composición del escudo oficial: shield + luna creciente +
 *   sol estrellado central + "KRAVITT" arriba + "AFC" abajo.
 * - Paleta monocromática: naranja quemado #C75D18 + crema #F5F2E8.
 * - SVG inline (vector puro, nítido a cualquier tamaño, peso 0 KB).
 * - Filtro de grano sutil para textura "stamped / print antiguo".
 */

interface EscudoVintageProps {
  className?: string;
  glow?: boolean;
}

export function EscudoVintage({
  className = "",
  glow = true,
}: EscudoVintageProps) {
  // 12 picos del sol estrellado (cada 30°)
  const sunSpikes = Array.from({ length: 12 }, (_, i) => i * 30);

  // 8 estrellas decorativas alrededor del círculo central
  const decorStars = [
    { x: 250, y: 320 }, { x: 774, y: 320 },
    { x: 215, y: 540 }, { x: 809, y: 540 },
    { x: 250, y: 760 }, { x: 774, y: 760 },
    { x: 512, y: 220 }, { x: 512, y: 858 },
  ];

  return (
    <div className={`relative ${className}`}>
      {glow && (
        <>
          <div
            className="absolute inset-0 rounded-full blur-3xl scale-90 -z-10"
            style={{ backgroundColor: "rgba(199, 93, 24, 0.30)" }}
            aria-hidden
          />
          <div
            className="absolute inset-[15%] rounded-full blur-2xl -z-10"
            style={{ backgroundColor: "rgba(245, 242, 232, 0.10)" }}
            aria-hidden
          />
        </>
      )}

      <svg
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
        role="img"
        aria-label="Escudo AFC Kravitt — versión vintage"
      >
        <defs>
          {/* Grano vintage muy sutil */}
          <filter id="vintage-grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="2"
              seed="3"
            />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>

          {/* Path del escudo (silueta heráldica) */}
          <path
            id="shield-path"
            d="M 512 80
               L 200 180
               L 200 540
               Q 200 760 512 940
               Q 824 760 824 540
               L 824 180 Z"
          />
        </defs>

        {/* === Silueta del escudo (relleno naranja quemado) === */}
        <use href="#shield-path" fill="#C75D18" />

        {/* === Borde crema doble (marco vintage) === */}
        <path
          d="M 512 130
             L 250 220
             L 250 540
             Q 250 730 512 880
             Q 774 730 774 540
             L 774 220 Z"
          fill="none"
          stroke="#F5F2E8"
          strokeWidth="6"
          strokeLinejoin="miter"
        />
        <path
          d="M 512 165
             L 280 245
             L 280 540
             Q 280 705 512 845
             Q 744 705 744 540
             L 744 245 Z"
          fill="none"
          stroke="#F5F2E8"
          strokeWidth="3"
          strokeLinejoin="miter"
          opacity="0.7"
        />

        {/* === Texto KRAVITT arriba === */}
        <text
          x="512"
          y="290"
          textAnchor="middle"
          fontFamily="'Anton', Impact, sans-serif"
          fontWeight="900"
          fontSize="92"
          fill="#F5F2E8"
          letterSpacing="10"
          style={{ textTransform: "uppercase" }}
        >
          KRAVITT
        </text>

        {/* Línea decorativa bajo KRAVITT */}
        <line
          x1="370"
          y1="320"
          x2="654"
          y2="320"
          stroke="#F5F2E8"
          strokeWidth="3"
        />

        {/* === Círculo central (anillo grueso crema) === */}
        <circle
          cx="512"
          cy="555"
          r="190"
          fill="none"
          stroke="#F5F2E8"
          strokeWidth="12"
        />
        <circle
          cx="512"
          cy="555"
          r="170"
          fill="none"
          stroke="#F5F2E8"
          strokeWidth="2"
          opacity="0.6"
        />

        {/* === Luna creciente === */}
        <g>
          <circle cx="455" cy="555" r="125" fill="#F5F2E8" />
          <circle cx="490" cy="540" r="115" fill="#C75D18" />
        </g>

        {/* === Sol estrellado central === */}
        <g transform="translate(560 555)">
          {/* Picos del sol */}
          {sunSpikes.map((angle) => (
            <polygon
              key={angle}
              points="-12,-50 12,-50 0,-78"
              fill="#F5F2E8"
              transform={`rotate(${angle})`}
            />
          ))}
          {/* Núcleo del sol */}
          <circle r="35" fill="#F5F2E8" />
          <circle r="28" fill="#C75D18" />
          <circle r="10" fill="#F5F2E8" />
        </g>

        {/* === Estrellas decorativas pequeñas === */}
        {decorStars.map((s, i) => (
          <g key={i} transform={`translate(${s.x} ${s.y})`}>
            <polygon
              points="0,-8 2,-2 8,0 2,2 0,8 -2,2 -8,0 -2,-2"
              fill="#F5F2E8"
              opacity="0.85"
            />
          </g>
        ))}

        {/* === Texto AFC abajo === */}
        <line
          x1="430"
          y1="830"
          x2="594"
          y2="830"
          stroke="#F5F2E8"
          strokeWidth="3"
        />
        <text
          x="512"
          y="895"
          textAnchor="middle"
          fontFamily="'Anton', Impact, sans-serif"
          fontWeight="900"
          fontSize="86"
          fill="#F5F2E8"
          letterSpacing="14"
          style={{ textTransform: "uppercase" }}
        >
          AFC
        </text>

        {/* === Overlay de grano vintage sobre TODO === */}
        <rect
          x="0"
          y="0"
          width="1024"
          height="1024"
          filter="url(#vintage-grain)"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
