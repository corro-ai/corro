import Navbar from "@/src/components/landing/Navbar";
import Hero from "@/src/components/landing/Hero";
import ProblemSection from "@/src/components/landing/ProblemSection";
import HowItWorks from "@/src/components/landing/HowItWorks";
import FeatureShowcase from "@/src/components/landing/FeatureShowCase";
import EvidenceChain from "@/src/components/landing/EvidenceChain";
import OpenSourceCTA from "@/src/components/landing/OpenSourceCTA";
import Footer from "@/src/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      <Navbar />
      
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <FeatureShowcase />
        <EvidenceChain />
        <OpenSourceCTA />
      </main>

      <Footer />
    </div>
  );
}