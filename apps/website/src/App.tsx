import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Privacy } from "@/components/sections/Privacy";
import { Comparison } from "@/components/sections/Comparison";
import { CTA } from "@/components/sections/CTA";
import { Pricing } from "@/components/sections/Pricing";

function App() {
  return (
    <div className="flex min-h-screen flex-col antialiased">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Privacy />
        <Comparison />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
