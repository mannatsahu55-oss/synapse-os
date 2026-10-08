import React from 'react';
import { motion } from 'framer-motion';

export default function PricingSection() {
  const tiers = [
    {
      label: "Basic",
      name: "Starter Automations",
      desc: "Perfect for individuals and small teams looking to automate repetitive tasks.",
      price: "$49 /month",
      features: [
        "Up to 5 active AI agents",
        "1,000 tasks per month",
        "Standard integrations",
        "Community support"
      ]
    },
    {
      label: "Pro",
      name: "Team Workflows",
      desc: "For growing teams that need advanced automation and custom data pipelines.",
      price: "$149 /month",
      features: [
        "Up to 20 active AI agents",
        "10,000 tasks per month",
        "Custom API integrations",
        "Priority email support"
      ]
    },
    {
      label: "Enterprise",
      name: "Dedicated AI Swarms",
      desc: "Full neural abstraction with dedicated compute and custom development.",
      price: "$499 /month",
      features: [
        "Unlimited AI agents",
        "Unlimited tasks",
        "Private compute nodes",
        "24/7 dedicated account manager"
      ]
    }
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden" id="pricing">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-medium text-text-primary mb-4"
          >
            Service Tiers
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-text-tertiary max-w-2xl mx-auto"
          >
            Our services are divided into clear execution phases designed to audit, build, and continuously optimize your custom intelligence assets.
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto relative pl-4 md:pl-0">
          {/* Vertical connecting line for desktop tree view */}
          <div className="hidden md:block absolute left-[50%] top-0 bottom-0 w-[1px] bg-border z-0"></div>

          <div className="flex flex-col gap-12 md:gap-24">
            {tiers.map((tier, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <motion.div 
                  key={tier.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className={`relative flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Branch connecting line */}
                  <div className={`hidden md:block absolute top-1/2 w-[10%] h-[1px] bg-border z-0 ${isEven ? 'left-[40%]' : 'right-[40%]'}`}></div>
                  
                  {/* Node dot on the center line */}
                  <div className="hidden md:flex absolute left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full z-10 ring-4 ring-white"></div>

                  <div className="w-full md:w-[45%] bg-white p-8 rounded-2xl border border-border border-dashed shadow-sm z-10 relative">
                    <span className="inline-block px-3 py-1 bg-secondary text-text-secondary text-sm font-medium rounded-md mb-6">
                      {tier.label}
                    </span>
                    <h3 className="text-2xl font-display font-medium text-text-primary mb-3">{tier.name}</h3>
                    <p className="text-text-tertiary mb-8 leading-relaxed">
                      {tier.desc}
                    </p>
                    <div className="flex items-end justify-between border-t border-border pt-6 mb-8">
                      <div className="text-3xl font-display font-medium text-text-primary">{tier.price}</div>
                      <a 
                        href={`mailto:hello@synapse.io?subject=Booking Inquiry for ${tier.name} package&body=Hello,%0D%0A%0D%0AI'm interested in booking the ${tier.name} package.%0D%0APlease let me know if any of the following dates and times work for a discussion:%0D%0A%0D%0ADate 1: [Select Date]%0D%0ATime 1: [Select Time]%0D%0A%0D%0ADate 2: [Select Date]%0D%0ATime 2: [Select Time]%0D%0A%0D%0ALooking forward to hearing from you.%0D%0A%0D%0ABest,%0D%0A[Your Name]`}
                        className="px-5 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors inline-block text-center"
                      >
                        Book now
                      </a>
                    </div>
                    
                    <div className="space-y-3">
                      {tier.features.map((feat, i) => (
                        <div key={i} className="bg-secondary/50 p-4 rounded-xl text-sm text-text-secondary">
                          {feat}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
