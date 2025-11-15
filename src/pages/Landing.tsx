import { WelcomeNavbar } from "@/components/welcome/WelcomeNavbar";
import { SaveplusCoachWidget } from "@/components/coach/SaveplusCoachWidget";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Stats } from "@/components/landing/Stats";
import { Calculator } from "@/components/landing/Calculator";
import { CTA } from "@/components/landing/CTA";
import { SimpleBackground } from "@/components/landing/SimpleBackground";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <WelcomeNavbar />
      
      <main className="relative z-10">
        <Hero />
        <Features />
        <Stats />
        <Calculator />
        <CTA />
      </main>
      
      <SaveplusCoachWidget />
      <SimpleBackground />
    </div>
  );
}
