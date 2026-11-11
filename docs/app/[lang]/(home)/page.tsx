import { ComponentDirectory } from "./components/ComponentDirectory";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Showcase } from "./components/Showcase";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Showcase />
      <Features />
      <ComponentDirectory />
      <Footer />
    </main>
  );
}
