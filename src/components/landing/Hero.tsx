import { getClubConfig } from "@/lib/data";
import { AnimatedHeroClient } from "./AnimatedHeroClient";

export async function Hero() {
  const club = await getClubConfig();

  // Mantenemos la lógica de servidor intacta y delegamos 
  // la renderización visual al componente cliente interactivo.
  return <AnimatedHeroClient club={club} />;
}