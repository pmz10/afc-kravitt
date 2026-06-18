import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { AboutClub } from "@/components/landing/AboutClub";
import { ProximoPartido } from "@/components/landing/ProximoPartido";
import { StatsHighlight } from "@/components/landing/StatsHighlight";
import { PlantelDestacado } from "@/components/landing/PlantelDestacado";
import { CTASection } from "@/components/landing/CTASection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <AboutClub />
        <ProximoPartido />
        <PlantelDestacado />
        <StatsHighlight />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}