import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const SatelliteFeed = ({ center }: { center: { lat: number, lng: number } }) => {
  const [coords, setCoords] = useState(center);
  
  useEffect(() => {
    setCoords(center);
  }, [center]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCoords(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-48 bg-black rounded-lg overflow-hidden border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
      {/* Moving Map Grain Background */}
      <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      
      {/* Animated Scanline */}
      <motion.div 
        className="absolute inset-0 w-full h-1 bg-primary/20 z-10"
        animate={{ y: [0, 192] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      {/* Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="w-8 h-8 border border-primary/50 relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-primary/30" />
          <div className="absolute left-1/2 top-0 h-full w-[1px] bg-primary/30" />
        </div>
      </div>

      {/* Simulated Video Feed (Random noise/patterns) */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-black pointer-events-none" />
      
      {/* HUD Overlays */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-30">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[8px] font-mono text-white/70 uppercase tracking-tighter">Live SAT-FEED 04</span>
        </div>
        <span className="text-[10px] font-mono text-primary leading-none">
          LAT: {coords.lat.toFixed(4)}<br/>
          LNG: {coords.lng.toFixed(4)}
        </span>
      </div>

      <div className="absolute bottom-2 right-2 text-[8px] font-mono text-primary/50 z-30">
        ALT: 42,000 FT<br/>
        ZOOM: 14X
      </div>

      {/* Static Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-repeat" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }} />
    </div>
  );
};
