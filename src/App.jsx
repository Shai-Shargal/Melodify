import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/about" element={<div>About Page</div>} />
            <Route path="/career" element={<div>Career Page</div>} />
            <Route path="/projects" element={<div>Projects Page</div>} />
            <Route path="/skills" element={<div>Skills Page</div>} />
            <Route path="/contact" element={<div>Contact Page</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
