import React from 'react';
import { NeuralCore } from '../components/chat/neural-core';

export default function NeuralCorePage() {
  return (
    <div className="w-full h-full bg-white dark:bg-black text-black dark:text-white relative z-50 transition-colors duration-500">
      <NeuralCore />
    </div>
  );
}
