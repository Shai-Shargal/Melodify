import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Name and Title */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900">Shai Shargal</h1>
            <p className="text-sm text-gray-600">Software Engineer</p>
          </div>

          {/* Right side - Navigation */}
          <nav className="flex space-x-8">
            <Link
              to="/about"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              About
            </Link>
            <Link
              to="/career"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Career
            </Link>
            <Link
              to="/projects"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Projects
            </Link>
            <Link
              to="/skills"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Skills
            </Link>
            <Link
              to="/contact"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
