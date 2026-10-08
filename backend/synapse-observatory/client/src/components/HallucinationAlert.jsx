import { useState, useEffect } from 'react';
import { AlertTriangle, X, Skull, StopCircle } from 'lucide-react';

export default function HallucinationAlert({
  alerts,
  agents,
  systemStatus,
  killAgent,
  killAll,
  dismissAlert,
  clearAlerts,
}) {
  const [dismissed, setDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const rogueAgent = Object.values(agents).find(a => a.status === 'critical');
  const cascadeAgent = Object.values(agents).find(
    a => a.agentId === 'delta' && a.status === 'warning'
  );
  const hallucinationAlert = alerts.find(a => a.type === 'hallucination');
  const costAlert = alerts.find(a => a.type === 'cost-spike');

  const shouldShow = hallucinationAlert && rogueAgent && !dismissed;

  useEffect(() => {
    if (shouldShow) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [shouldShow]);

  useEffect(() => {
    if (dismissed && rogueAgent) {
      const timer = setTimeout(() => setDismissed(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [dismissed, rogueAgent]);

  const handleDismiss = () => {
    setDismissed(true);
  };

  const handleKillRogue = async () => {
    if (rogueAgent) {
      await killAgent(rogueAgent.agentId);
      clearAlerts();
      setDismissed(true);
    }
  };

  const handleKillAll = async () => {
    await killAll();
    clearAlerts();
    setDismissed(true);
  };

  if (!shouldShow) return null;

  const burnRate = systemStatus.burnRatePerSec || 5;
  const projectedHourlyCost = Math.round(burnRate * 3600);
  const confidence = rogueAgent?.confidenceScore || 0.18;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <div
        className={`max-w-4xl mx-auto rounded-xl p-5 transition-all duration-500 bg-red-50/95 backdrop-blur-md border border-red-500/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${
          isVisible ? 'animate-slide-down' : 'opacity-0 -translate-y-full'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-7 h-7 rounded-lg border border-black/5 bg-white/80 hover:bg-black/5 flex items-center justify-center transition-colors shadow-sm"
        >
          <X size={14} className="text-gray-500" />
        </button>

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-lg border border-red-500/20 bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Skull size={24} className="text-red-500 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-red-600" />
              <h2 className="text-base font-bold text-red-600 tracking-wide">
                HALLUCINATION CASCADE DETECTED
              </h2>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              <strong className="text-red-600">Agent Gamma (Decision Agent)</strong> has entered an
              infinite reasoning loop and is producing unreliable outputs.
              {cascadeAgent && (
                <span>
                  {' '}<strong className="text-amber-600">Agent Delta (Execution Agent)</strong> is
                  receiving and executing corrupted decision data.
                </span>
              )}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="bg-white/80 border border-red-500/20 rounded-lg px-4 py-3 min-w-[120px]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5 font-medium">Confidence</p>
                <p className="text-xl font-bold font-mono text-red-600">
                  {(confidence * 100).toFixed(0)}%
                </p>
              </div>
              <div className="bg-white/80 border border-red-500/20 rounded-lg px-4 py-3 min-w-[120px]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5 font-medium">Burn Rate</p>
                <p className="text-xl font-bold font-mono text-red-600">
                  ${burnRate.toFixed(2)}/sec
                </p>
              </div>
              <div className="bg-white/80 border border-red-500/20 rounded-lg px-4 py-3 min-w-[120px]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5 font-medium">Projected Hourly</p>
                <p className="text-xl font-bold font-mono text-red-600">
                  ${projectedHourlyCost.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleKillRogue}
                className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm"
              >
                <StopCircle size={16} />
                Kill Rogue Agent
              </button>
              <button
                onClick={handleKillAll}
                className="px-6 py-2.5 rounded-lg bg-white hover:bg-black/5 border border-black/10 text-black text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm"
              >
                <StopCircle size={16} />
                Kill All Agents
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
