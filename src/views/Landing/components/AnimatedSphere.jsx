import React, { useEffect, useRef } from "react";

const AnimatedSphere = () => {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const chars = "░▒▓█▀▄▌▐│─┤├┴┬╭╮╰╯";
    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      // Slightly smaller radius to fit perfectly in the hero section
      const radius = Math.min(rect.width, rect.height) * 0.45;

      // Draw subtle background orbits
      ctx.lineWidth = 1;
      
      // Inner orbit
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * 1.6, radius * 0.5, time * 0.15, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.08)"; 
      ctx.stroke();

      // Outer orbit
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * 2.1, radius * 0.7, -time * 0.1, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
      ctx.stroke();

      // Third diagonal orbit
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * 1.8, radius * 1.8, time * 0.05, 0, Math.PI * 2);
      // making it dashed for variation
      ctx.setLineDash([4, 8]);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.04)";
      ctx.stroke();
      ctx.setLineDash([]); // reset dash

      ctx.font = "14px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const points = [];

      // Generate sphere points (reduced density slightly for performance and clean aesthetic)
      for (let phi = 0; phi < Math.PI * 2; phi += 0.2) {
        for (let theta = 0; theta < Math.PI; theta += 0.2) {
          const x = Math.sin(theta) * Math.cos(phi + time * 0.5);
          const y = Math.sin(theta) * Math.sin(phi + time * 0.5);
          const z = Math.cos(theta);

          // Rotate around Y axis
          const rotY = time * 0.3;
          const newX = x * Math.cos(rotY) - z * Math.sin(rotY);
          const newZ = x * Math.sin(rotY) + z * Math.cos(rotY);

          // Rotate around X axis
          const rotX = time * 0.2;
          const newY = y * Math.cos(rotX) - newZ * Math.sin(rotX);
          const finalZ = y * Math.sin(rotX) + newZ * Math.cos(rotX);

          const depth = (finalZ + 1) / 2;
          const charIndex = Math.floor(depth * (chars.length - 1));

          points.push({
            x: centerX + newX * radius,
            y: centerY + newY * radius,
            z: finalZ,
            char: chars[charIndex],
            depth,
            nx: newX,
            ny: newY
          });
        }
      }

      // Sort by z for depth (draw back to front)
      points.sort((a, b) => a.z - b.z);

      // Draw points
      points.forEach((point) => {
        // Base opacity heavily influenced by depth
        const alpha = 0.1 + (point.z + 1) * 0.4;
        
        // Simple black color with depth-based alpha
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillText(point.char, point.x, point.y);
      });

      time += 0.015;
      frameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className="w-full h-full relative flex items-center justify-center pointer-events-none" style={{ transform: 'translateZ(0)' }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
      {/* Add a subtle grayscale glow behind the sphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-neutral-900/5 blur-[80px] -z-10" />
    </div>
  );
};

export default AnimatedSphere;
