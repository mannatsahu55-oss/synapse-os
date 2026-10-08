import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const shapes = [
  // 4 dots
  <motion.svg key="dots" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.5 }}>
    <circle cx="8" cy="8" r="3" />
    <circle cx="16" cy="8" r="3" />
    <circle cx="8" cy="16" r="3" />
    <circle cx="16" cy="16" r="3" />
  </motion.svg>,
  // Cross / Plus
  <motion.svg key="plus" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" initial={{ opacity: 0, scale: 0.5, rotate: -90 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.5, rotate: 90 }} transition={{ duration: 0.5 }}>
    <rect x="10" y="4" width="4" height="16" rx="1" />
    <rect x="4" y="10" width="16" height="4" rx="1" />
  </motion.svg>,
  // Diamond
  <motion.svg key="diamond" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" initial={{ opacity: 0, scale: 0.5, rotate: 0 }} animate={{ opacity: 1, scale: 1, rotate: 45 }} exit={{ opacity: 0, scale: 0.5, rotate: 90 }} transition={{ duration: 0.5 }}>
    <rect x="7" y="7" width="10" height="10" rx="2" />
  </motion.svg>,
  // Circle
  <motion.svg key="circle" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.5 }}>
    <circle cx="12" cy="12" r="7" />
  </motion.svg>
];

export default function MorphingLogo() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % shapes.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-8 h-8 flex items-center justify-center text-text-primary">
      <AnimatePresence mode="wait">
        {shapes[index]}
      </AnimatePresence>
    </div>
  );
}
