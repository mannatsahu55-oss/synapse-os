import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { motion } from 'framer-motion';
import AnimatedSphere from './AnimatedSphere';

export default function HeroSection() {
  const { session } = useAuth();
  
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-start bg-white pt-48 pb-16">
      
      <div className="z-10 container mx-auto px-6 flex flex-col items-center text-center">
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-6xl lg:text-7xl font-serif font-normal tracking-tight text-text-primary max-w-4xl leading-tight mb-6"
        >
          The Future of AI Automation
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-base md:text-lg text-text-tertiary max-w-lg mx-auto mb-10 leading-relaxed font-sans"
        >
          Deploy autonomous AI agents to automate your complex workflows, scale operations, and drive exponential growth.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row gap-4 items-center mb-40"
        >
          <Link 
            to={session ? "/app/observatory" : "/login"}
            className="px-6 py-2 rounded-full bg-text-primary text-white text-sm font-medium hover:bg-text-secondary transition-colors"
          >
            Launch Observatory
          </Link>
        </motion.div>

        {/* Floating ASCII AI neural network visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex items-center justify-center w-full max-w-[750px] h-[350px] md:h-[550px] mx-auto mt-8"
        >
          {/* Viewfinder brackets - tightly framing the 3D object */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-text-tertiary/30"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-text-tertiary/30"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-text-tertiary/30"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-text-tertiary/30"></div>
          
          <AnimatedSphere />
        </motion.div>
      </div>
    </section>
  );
}
