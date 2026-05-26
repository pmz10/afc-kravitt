import { getClubConfig } from "@/lib/data";

export type EscudoVariantName =
  | "gold"      // Dorado deluxe — primordial, premium
  | "silver"    // Plata fría — institucional
  | "orange"    // Naranja sólido del club — acento fuerte
  | "cream"     // Crema línea — sutil, sobre fondos oscuros
  | "petrol";   // Verde petróleo — tono sobre tono

interface EscudoVariantProps {
  variant?: EscudoVariantName;
  /** clase para el contenedor (usar w/h o aspect-square + w) */
  className?: string;
  /** glow halo detrás del escudo */
  glow?: boolean;
}

// Gradientes por variante. Cada uno mantiene la misma silueta (porque usa el
// mismo PNG como máscara), solo cambia el "relleno" del escudo.
const GRADIENTS: Record<EscudoVariantName, string> = {
  // Gold = cobre-naranja cálido. Conversa con el #ED7B2C del sitio.
  // Highlight crema → cobre brillante → naranja Kravitt → bronce profundo.
  gold: "linear-gradient(135deg, #FBD78B 0%, #F5B547 18%, #E8893A 40%, #C75D18 65%, #F5B547 88%, #8B4513 100%)",
  silver: "linear-gradient(135deg, #f3f4f6 0%, #cbd5e1 30%, #94a3b8 60%, #e2e8f0 100%)",
  orange: "linear-gradient(135deg, #f89b5a 0%, #ed7b2c 50%, #c75d18 100%)",
  cream: "linear-gradient(135deg, #f5f2e8 0%, #e8e3d2 50%, #cfd2d0 100%)",
  petrol: "linear-gradient(135deg, #1a4549 0%, #0f3438 50%, #0b2a2e 100%)",
};

const GLOW_COLOR: Record<EscudoVariantName, string> = {
  // Glow ahora cálido también — naranja-cobre — para amarrar con el sitio.
  gold: "rgba(232, 137, 58, 0.45)",
  silver: "rgba(203, 213, 225, 0.30)",
  orange: "rgba(237, 123, 44, 0.40)",
  cream: "rgba(245, 242, 232, 0.25)",
  petrol: "rgba(26, 69, 73, 0.45)",
};

export async function EscudoVariant({
  variant = "gold",
  className = "",
  glow = true,
}: EscudoVariantProps) {
  const club = await getClubConfig();
  const maskUrl = `url(${club.escudoOriginal})`;
  const gradient = GRADIENTS[variant];
  const glowColor = GLOW_COLOR[variant];

  return (
    <div className={`relative ${className}`}>
      {glow && (
        <>
          <div
            className="absolute inset-0 rounded-full blur-3xl scale-90 -z-10"
            style={{ backgroundColor: glowColor }}
            aria-hidden
          />
          <div
            className="absolute inset-[10%] rounded-full blur-2xl -z-10"
            style={{ backgroundColor: glowColor, opacity: 0.6 }}
            aria-hidden
          />
        </>
      )}
      {/* El escudo: PNG como máscara + gradiente como relleno */}
      <div
        role="img"
        aria-label={`Escudo ${club.nombre} variante ${variant}`}
        className="absolute inset-0 drop-shadow-[0_25px_50px_rgba(0,0,0,0.45)]"
        style={{
          backgroundImage: gradient,
          WebkitMaskImage: maskUrl,
          maskImage: maskUrl,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
    </div>
  );
}
