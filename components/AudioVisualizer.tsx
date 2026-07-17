"use client";

import { useEffect, useState } from "react";
import { useAudio } from "./AudioProvider";

export function AudioVisualizer() {
  const { audioLevel } = useAudio();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render on server
  if (!isClient) return null;

  return (
    <>
      {/* Audio visualizer overlay */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none transition-all duration-150"
        style={{
          background: `radial-gradient(circle at ${50 + Math.sin(Date.now() / 1000) * 10}% ${50 + Math.cos(Date.now() / 2000) * 10}%, 
            rgba(255, 215, 0, ${0.02 + audioLevel * 0.08}) 0%, 
            rgba(255, 100, 0, ${0.01 + audioLevel * 0.04}) 30%, 
            transparent 70%)`,
          opacity: 0.6 + audioLevel * 0.3,
        }}
      />

      {/* Popping circles based on audio */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2 + Date.now() / 8000;
        const x = 50 + Math.cos(angle) * (20 + audioLevel * 30);
        const y = 50 + Math.sin(angle) * (20 + audioLevel * 30);
        const size =
          20 + audioLevel * 120 + Math.sin(Date.now() / 1000 + i) * 20;

        return (
          <div
            key={i}
            className="fixed rounded-full pointer-events-none z-[1]"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              transform: `translate(-50%, -50%) scale(${0.5 + audioLevel * 0.8})`,
              background: `radial-gradient(circle, 
                rgba(255, 215, 0, ${0.1 + audioLevel * 0.3}), 
                rgba(255, 100, 0, ${0.05 + audioLevel * 0.1}) 40%, 
                transparent 70%)`,
              animation: `pulse ${0.5 + audioLevel * 0.5}s ease-in-out infinite alternate`,
              opacity: 0.3 + audioLevel * 0.6,
              filter: `blur(${5 - audioLevel * 3}px)`,
            }}
          />
        );
      })}

      {/* Floating particles based on audio */}
      {Array.from({ length: 15 }).map((_, i) => {
        const seed = i * 1.3;
        const x = (Math.sin(Date.now() / 3000 + seed) * 0.5 + 0.5) * 100;
        const y = (Math.cos(Date.now() / 2500 + seed * 1.2) * 0.5 + 0.5) * 100;
        const size = 2 + audioLevel * 8;

        return (
          <div
            key={`particle-${i}`}
            className="fixed rounded-full pointer-events-none z-[1]"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              background: `hsl(${40 + audioLevel * 20 + i * 20}, 100%, ${50 + audioLevel * 30}%)`,
              opacity: 0.2 + audioLevel * 0.6,
              animation: `float ${2 + audioLevel * 2}s ease-in-out infinite alternate`,
              filter: `blur(${2 - audioLevel * 1.5}px)`,
              boxShadow: `0 0 ${10 + audioLevel * 30}px rgba(255, 215, 0, ${0.1 + audioLevel * 0.3})`,
            }}
          />
        );
      })}

      {/* Dimming overlay that pulses with music */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none transition-all duration-300"
        style={{
          background: `radial-gradient(ellipse at center, 
            transparent ${30 - audioLevel * 20}%, 
            rgba(0, 0, 0, ${0.3 + audioLevel * 0.4}) 100%)`,
          opacity: 0.5 + audioLevel * 0.4,
        }}
      />

      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
          }
        }
        @keyframes float {
          0% {
            transform: translate(0, 0) scale(0.8);
          }
          100% {
            transform: translate(10px, -20px) scale(1.2);
          }
        }
      `}</style>
    </>
  );
}
