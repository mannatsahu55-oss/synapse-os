import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AboutHero() {
  return (
    <section className="pt-32 pb-24 md:pt-48 md:pb-32 bg-white flex flex-col items-center justify-center text-center px-6">
      <div className="max-w-3xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-7xl font-serif font-normal tracking-tight text-text-primary leading-tight mb-8"
        >
          We engineer systems,<br/>not slide decks.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-base md:text-lg text-text-tertiary max-w-lg mx-auto mb-10 leading-relaxed font-sans"
        >
          Synapse OS was built on a single, uncompromising premise: traditional consulting is broken. We do not charge retainers to deliver theoretical roadmaps.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link 
            to="#booking"
            className="inline-flex px-8 py-3 rounded-full bg-text-primary text-white text-sm font-medium hover:bg-text-secondary transition-colors"
          >
            Book now
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
