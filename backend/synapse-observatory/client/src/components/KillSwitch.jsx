import { useState } from 'react';
import { StopCircle, RotateCcw, ShieldAlert, Zap } from 'lucide-react';

export default function KillSwitch({ killAll, restartAll, allKilled, systemHealth }) {
  const [flashActive, setFlashActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isCritical = systemHealth === 'critical';

  const handleKill = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setFlashActive(true);
    await killAll();
    setTimeout(() => setFlashActive(false), 400);
    setTimeout(() => setIsProcessing(false), 600);
  };

  const handleRestart = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    await restartAll();
    setTimeout(() => setIsProcessing(false), 600);
  };

  const handleDemoTrigger = async () => {
    try {
      await fetch('http://localhost:4000/api/demo/trigger-rogue', { method: 'POST' });
    } catch (e) {
      console.error('Failed to trigger demo', e);
    }
  };

  return (
    <div className="glass-card p-6 mb-6">
      {/* Flash overlay */}
      {flashActive && (
        <div className="fixed inset-0 bg-red-500/10 pointer-events-none z-50 kill-flash" />
      )}

      <div className="flex flex-col gap-5">
        {/* Title & Demo Trigger */}
        <div className="flex items-center justify-between border-b border-black/10 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className={isCritical ? 'text-red-600' : 'text-black/60'} />
            <h3 className="text-sm font-semibold tracking-tight text-black">
              Emergency Controls
            </h3>
          </div>
          
          <button 
            onClick={handleDemoTrigger}
            className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-400 hover:text-amber-500 transition-colors"
            title="Trigger rogue event instantly for demo purposes"
          >
            <Zap size={12} />
            Demo: Force Cascade
          </button>
        </div>

        <div className="w-full">
          {/* Kill Button */}
          {!allKilled ? (
            <button
              onClick={handleKill}
              disabled={isProcessing}
              className={`w-full h-16 rounded-none flex items-center justify-center gap-3 transition-colors disabled:opacity-50 ${
                isCritical 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-white border border-red-600/30 hover:bg-red-50 text-red-600'
              }`}
            >
              <StopCircle size={20} />
              <span className="text-sm font-bold tracking-widest uppercase">
                Terminate Swarm
              </span>
            </button>
          ) : (
            <div className="flex gap-4">
              <div className="flex-1 h-16 rounded-none bg-black/5 border border-black/10 flex items-center justify-center gap-3 text-black/60">
                <StopCircle size={20} />
                <span className="text-sm font-bold tracking-widest uppercase">
                  Terminated
                </span>
              </div>
              <button
                onClick={handleRestart}
                disabled={isProcessing}
                className="flex-1 h-16 rounded-none bg-black text-white hover:bg-black/80 flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
              >
                <RotateCcw size={20} />
                <span className="text-sm font-bold tracking-widest uppercase">
                  Restart Swarm
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Status text */}
        <p className="text-[10px] font-mono text-black/50 uppercase tracking-widest">
          {allKilled
            ? '[SYS] Swarm offline — all agents terminated'
            : isCritical
            ? '[WARN] Critical state detected — kill switch armed'
            : '[INFO] All systems operational — kill switch on standby'}
        </p>
      </div>
    </div>
  );
}
