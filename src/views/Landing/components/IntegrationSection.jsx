import React from 'react';
import { motion } from 'framer-motion';

export default function IntegrationSection() {
  return (
    <section className="py-24 bg-white border-y border-border">
      <div className="container mx-auto px-6 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-display font-medium text-text-primary mb-4"
        >
          The Integration Ecosystem
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg text-text-tertiary max-w-2xl mx-auto mb-16"
        >
          We connect the industry's best APIs into one seamless pipeline.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-4xl mx-auto"
        >
          {/* Framer uses an SVG diagram for this, we will load the closest matching SVG from assets or use a placeholder */}
          <div className="w-full aspect-auto md:aspect-[16/9] py-12 md:py-8 bg-secondary/30 rounded-3xl border border-border flex items-center justify-center px-4 md:px-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3455fa_1px,transparent_1px)] [background-size:20px_20px]"></div>
            
            {/* Diagram Placeholder based on the copy */}
            <div className="relative z-10 flex flex-col gap-8 md:gap-12 w-full max-w-2xl">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex-1 text-sm font-medium text-center w-full md:w-auto">CRM Automation</div>
                <div className="h-8 w-[2px] md:h-[2px] md:w-auto bg-primary flex-1 opacity-20 relative">
                    <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-0 w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-primary shadow-sm flex-1 text-sm font-medium text-primary border-dashed text-center w-full md:w-auto">Synapse OS</div>
                <div className="h-8 w-[2px] md:h-[2px] md:w-auto bg-primary flex-1 opacity-20 relative">
                    <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-0 w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex-1 text-sm font-medium text-center w-full md:w-auto">Vector Databases</div>
              </div>

              <div className="flex justify-center">
                 <div className="w-[2px] h-12 bg-primary opacity-20 relative"></div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex-1 text-sm font-medium text-center w-full md:w-auto">Middleware</div>
                <div className="h-8 w-[2px] md:h-[2px] md:w-auto bg-primary flex-1 opacity-20 relative"></div>
                <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex-1 text-sm font-medium text-center w-full md:w-auto">Large Language Models</div>
                <div className="h-8 w-[2px] md:h-[2px] md:w-auto bg-primary flex-1 opacity-20 relative"></div>
                <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex-1 text-sm font-medium text-center w-full md:w-auto">Lease Management</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
