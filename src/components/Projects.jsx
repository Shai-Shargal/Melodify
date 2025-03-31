import { motion } from "framer-motion";

const projects = [
  {
    title: "Project 1",
    description: "A cool web application built with React and Node.js",
    color: "bg-lego-red",
    link: "https://github.com",
  },
  {
    title: "Project 2",
    description: "An awesome mobile app developed with React Native",
    color: "bg-lego-blue",
    link: "https://github.com",
  },
  {
    title: "Project 3",
    description: "A fun game created with Three.js and WebGL",
    color: "bg-lego-green",
    link: "https://github.com",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-20 px-4 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">My Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div
                className={`lego-card lego-bump ${project.color} text-white h-full`}
              >
                <h3 className="text-2xl font-bold mb-4">{project.title}</h3>
                <p className="mb-6">{project.description}</p>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  View Project
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
