import Hero from "./components/Hero";
import Projects from "./components/Projects";
import About from "./components/About";
import Contact from "./components/Contact";

function App() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <Projects />
      <About />
      <Contact />
    </main>
  );
}

export default App;
