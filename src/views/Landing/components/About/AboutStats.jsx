import React from 'react';
import { motion } from 'framer-motion';

export default function AboutStats() {
  const stats = [
    { label: "Operational Capital Saved for Clients", value: "[ $140M+ ]" },
    { label: "Enterprise Pipelines Deployed", value: "[ 45+ ]" },
    { label: "Specialized Machine Learning Engineers", value: "[ 12 ]" },
    { label: "Public Data Leaks", value: "[ 0 ]" }
  ];

  return (
    <section className="py-24 bg-white border-b border-border">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-display font-medium text-center text-text-primary mb-16"
        >
          The Company in Numbers
        </motion.h2>

        <div className="relative">
          {/* Subtle dotted connector background lines if needed, but grid gap works well */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border border-dashed p-[1px]">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-10 flex flex-col justify-between min-h-[160px]"
              >
                <div className="text-[13px] text-text-tertiary mb-8">
                  {stat.label}
                </div>
                <div className="text-3xl font-display font-semibold text-text-primary">
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
