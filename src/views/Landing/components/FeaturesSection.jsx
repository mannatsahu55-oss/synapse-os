import React from 'react';
import { motion } from 'framer-motion';
import { Database, ShieldCheck, Workflow, Bot } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      title: "Tenancy Sync Agents",
      description: "Automate lease agreements, sync tenancy statuses, and handle multi-branch auditing autonomously.",
      icon: <Bot size={24} className="text-primary" />
    },
    {
      title: "Data Abstraction",
      description: "Abstract legacy property databases into a unified neural roster for real-time operations.",
      icon: <Database size={24} className="text-primary" />
    },
    {
      title: "Secure Enterprise Data",
      description: "Query proprietary documents through private, zero-retention infrastructure using RAG architecture.",
      icon: <ShieldCheck size={24} className="text-primary" />
    },
    {
      title: "Lease Management Automation",
      description: "Orchestrate lease updates, manage units, and track move-in/move-out workflows entirely on autopilot.",
      icon: <Workflow size={24} className="text-primary" />
    }
  ];

  return (
    <section className="py-24 bg-secondary">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-medium text-text-primary mb-4"
          >
            Engineered Core Capabilities.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-text-tertiary max-w-2xl"
          >
            From isolated language model agents to private, secure database environments—we architect the structural foundation of your automated enterprise.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * idx }}
              className="bg-white p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium text-text-primary mb-3">{feature.title}</h3>
              <p className="text-text-tertiary leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
