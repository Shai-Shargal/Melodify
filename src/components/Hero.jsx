import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-lego-blue py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Hi, I'm Shai
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            A creative developer who loves building things with code and Lego!
          </p>
          <a
            href="#projects"
            className="lego-btn bg-lego-yellow text-gray-900 inline-block"
          >
            View My Projects
          </a>
        </motion.div>
      </div>
    </section>
  );
}
