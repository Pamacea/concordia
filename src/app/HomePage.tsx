import Features from '../features/home/Features';
import FinalCTA from '../features/home/FinalCTA';
import Footer from '../features/home/Footer';
import Hero from '../features/home/Hero';
import Navbar from '../features/home/Navbar';
import Showcase from '../features/home/Showcase';
import Stats from '../features/home/Stats';

/** Page d'accueil — route `/` : shell de la landing page. */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <Stats />
        <Features />
        <Showcase />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
