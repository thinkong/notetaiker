import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Privacy } from "@/components/Privacy";
import { Footer } from "@/components/Footer";

function App() {
  return (
    <div className="flex min-h-screen flex-col font-sans antialiased">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Privacy />
      </main>
      <Footer />
    </div>
  );
}

export default App;
