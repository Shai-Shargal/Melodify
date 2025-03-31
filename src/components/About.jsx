import { motion } from "framer-motion";

export default function About() {
  return (
    <section className="py-20 px-4 bg-lego-yellow">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row items-center gap-12"
        >
          <div className="w-48 h-48 relative">
            <div className="w-full h-full bg-lego-red rounded-full overflow-hidden lego-bump">
              {/* Replace with your actual image */}
              <img
                src="https://api.dicebear.com/7.x/personas/svg?seed=shai"
                alt="Lego Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl font-bold mb-6">About Me</h2>
            <p className="text-xl leading-relaxed">
              I'm a passionate developer who believes in creating engaging and
              interactive web experiences. Just like building with Lego bricks,
              I love putting together pieces of code to create something
              amazing. When I'm not coding, you can find me collecting Lego sets
              or experimenting with new web technologies.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
