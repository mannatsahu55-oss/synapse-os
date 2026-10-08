import React from 'react';
import { motion } from 'framer-motion';

export default function HumanAIIntersection() {
  return (
    <section className="py-24 bg-background overflow-hidden relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-display font-medium text-text-primary mb-6"
          >
            The Human-AI Intersection.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-text-tertiary max-w-2xl mx-auto"
          >
            Unifying human enterprise and autonomous data pipelines to scale your company’s throughput instantly.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-5xl mx-auto h-[400px] md:h-[600px] flex items-center justify-center"
        >
          <img 
            src="/images/ascii-magic-1.png" 
            alt="Complex ASCII handshake" 
            className="w-full h-full object-contain mix-blend-multiply opacity-90"
            style={{ 
              WebkitMaskImage: 'radial-gradient(50% 50% at 50% 50%, black 60%, transparent 100%)',
              maskImage: 'radial-gradient(50% 50% at 50% 50%, black 60%, transparent 100%)' 
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
