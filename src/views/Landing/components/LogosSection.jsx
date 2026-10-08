import React from 'react';
import { motion } from 'framer-motion';

export default function LogosSection() {
  const logos = [
    { name: "Votion", icon: "V" },
    { name: "XYZ", icon: "X" },
    { name: "Search App", icon: "S" },
    { name: "Openly AI", icon: "O" },
    { name: "Stries", icon: "S" },
    { name: "I Combinator", icon: "I" },
    { name: "Radial", icon: "R" },
    { name: "Vercex", icon: "V" }
  ];

  return (
    <section className="py-16 bg-[#f7f7f7] border-y border-border">
      <div className="container mx-auto px-6">
        <p className="text-center text-sm font-medium text-text-tertiary mb-8 uppercase tracking-wider">
          Trusted by people at
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {logos.map((logo, idx) => (
            <motion.div 
              key={logo.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-2"
            >
              <div className="w-6 h-6 bg-text-tertiary text-white rounded flex items-center justify-center text-xs font-bold font-display">
                {logo.icon}
              </div>
              <span className="font-display font-medium text-text-secondary text-lg">{logo.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
