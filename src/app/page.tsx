import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Work } from "@/components/Work";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <Work />
      <About />
      <Contact />
      <footer className="footer">
        <p>&copy; 2026</p>
      </footer>
    </>
  );
}
