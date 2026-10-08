import React from 'react';
import { Briefcase, User, Server } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutProcess() {
  const steps = [
    {
      title: "Architecture Audit",
      desc: "We map your existing data silos, legacy APIs, and operational bottlenecks to define exact integration points with zero guesswork.",
      icon: Briefcase
    },
    {
      title: "Secure Prototyping",
      desc: "We build the initial LLM agents and middleware in a ring-fenced sandbox, rigorously testing for hallucination, latency, and strict security compliance.",
      icon: User
    },
    {
      title: "Production & Handoff",
      desc: "Live deployment into your cloud infrastructure. We provide full documentation, employee training, and ongoing SLA maintenance to ensure zero downtime.",
      icon: Server
    }
  ];

  return (
    <section className="py-24 bg-white border-b border-border">
      <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row gap-16">
        <div className="md:w-1/3">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-display font-medium text-text-primary mb-6"
          >
            The process
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-text-tertiary leading-relaxed text-[15px]"
          >
            How we take your enterprise from fractured, manual data silos to production-grade automation with absolute structural precision.
          </motion.p>
        </div>

        <div className="md:w-2/3 flex flex-col gap-4">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#fcfcfc] border border-border border-dashed p-8 rounded flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <step.icon size={16} className="text-text-primary" />
                <h3 className="font-display font-semibold text-text-primary text-sm">{step.title}</h3>
              </div>
              <p className="text-text-tertiary text-[15px] leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
