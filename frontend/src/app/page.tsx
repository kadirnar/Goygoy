"use client";

import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import WhySection from "@/components/WhySection";
import FeaturesSection from "@/components/FeaturesSection";
import DemoSection from "@/components/DemoSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen grid-bg">
      <NavBar />
      <HeroSection />
      <WhySection />
      <FeaturesSection />
      <DemoSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
