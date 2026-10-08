import { useEffect, useRef, useState } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

export default function CostTracker({ totalCost, costColor, burnRatePerMin, systemHealth }) {
  const [displayCost, setDisplayCost] = useState(0);
  const targetRef = useRef(0);
  const displayRef = useRef(0);
  const rafRef = useRef(null);
  const [tick, setTick] = useState(false);

  useEffect(() => {
    targetRef.current = totalCost || 0;
  }, [totalCost]);

  useEffect(() => {
    let lastTime = performance.now();

    const animate = (now) => {
      const dt = Math.min(now - lastTime, 50) / 1000;
      lastTime = now;

      const diff = targetRef.current - displayRef.current;
      if (Math.abs(diff) > 0.001) {
        const speed = Math.max(Math.abs(diff) * 3, 0.05);
        const step = Math.sign(diff) * Math.min(speed * dt, Math.abs(diff));
        displayRef.current += step;
        setDisplayCost(displayRef.current);
        setTick(prev => !prev);
      } else {
        displayRef.current = targetRef.current;
        setDisplayCost(displayRef.current);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const formattedCost = displayCost.toFixed(2);
  const [dollars, cents] = formattedCost.split('.');
  const isCritical = systemHealth === 'critical';

  return (
    <div className={`glass-card p-5 flex flex-col justify-between transition-all duration-500 rounded-lg ${
      isCritical ? 'border-red-500/50' : ''
    }`}>
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</div>
        <DollarSign size={14} style={{ color: costColor }} className="opacity-50" />
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-3xl font-bold tracking-tighter transition-colors duration-500" style={{ color: costColor }}>
          ${dollars}
        </span>
        <span className="text-xl font-bold tracking-tighter transition-colors duration-500" style={{ color: costColor, opacity: 0.7 }}>
          .{cents}
        </span>
      </div>
      <div className="flex items-center gap-1 mt-1">
        <TrendingUp size={8} className={isCritical ? 'text-red-600' : 'text-gray-500'} />
        <div className={`text-[10px] truncate ${isCritical ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
          ${burnRatePerMin.toFixed(2)}/min
        </div>
      </div>
    </div>
  );
}
