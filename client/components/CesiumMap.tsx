import React, { useEffect, useRef, useState } from "react";
import { Viewer, Entity, PointGraphics, EntityDescription, ScreenSpaceEventHandler as ResiumScreenSpaceEventHandler, ScreenSpaceEvent, CameraFlyTo, PolylineGraphics, LabelGraphics, BillboardGraphics, ImageryLayer } from "resium";
import { Cartesian3, Color, VerticalOrigin, ScreenSpaceEventType, createWorldTerrainAsync, Ion, Terrain, Camera, ScreenSpaceEventHandler, HeightReference, HorizontalOrigin, Cartesian2, createWorldImageryAsync, OpenStreetMapImageryProvider, IonImageryProvider, UrlTemplateImageryProvider } from "cesium";
import { RiskIndicator } from "@/lib/simulationEngine";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Crosshair, ZoomIn, ZoomOut, Box, Layers, Globe } from "lucide-react";

interface MapUnit {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: "active" | "warning" | "critical" | "idle";
  type: "infantry" | "armor" | "air" | "logistics" | "recon" | "medic";
  health: number;
  ammo: number;
  fuel: number;
  personnel: number;
}

interface MapProps {
  units: MapUnit[];
  selectedUnit: string | null;
  onUnitSelect: (unitId: string) => void;
  centerLat: number;
  centerLng: number;
  onLocationSearch?: (lat: number, lng: number) => void;
  riskIndicators?: RiskIndicator[];
  sectors?: any[];
}

const STATUS_COLOR: Record<string, Color> = {
  active: Color.fromCssColorString("#4ade80"),
  warning: Color.fromCssColorString("#fbbf24"),
  critical: Color.fromCssColorString("#ef4444"),
  idle: Color.fromCssColorString("#6b7280"),
};

export default function CesiumMap({
  units,
  selectedUnit,
  onUnitSelect,
  centerLat,
  centerLng,
  onLocationSearch,
  riskIndicators = [],
  sectors = [],
}: MapProps) {
  const viewerRef = useRef<any>(null);
  const [terrainProvider, setTerrainProvider] = useState<any>(null);
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  // Enable all camera controls on mount
  useEffect(() => {
    if (!viewerRef.current || !viewerRef.current.cesiumElement) return;
    const viewer = viewerRef.current.cesiumElement;
    viewer.scene.screenSpaceCameraController.enableZoom = true;
    viewer.scene.screenSpaceCameraController.enableRotate = true;
    viewer.scene.screenSpaceCameraController.enableTilt = true;
    viewer.scene.screenSpaceCameraController.enableTranslate = true;
  }, []);

  // Handle prop-driven camera movement (e.g. from search)
  useEffect(() => {
    if (viewerRef.current && viewerRef.current.cesiumElement) {
      viewerRef.current.cesiumElement.camera.flyTo({
        destination: Cartesian3.fromDegrees(centerLng, centerLat, 15000),
        duration: 2,
      });
    }
  }, [centerLat, centerLng]);

  useEffect(() => {
    // Enable terrain elevation
    const loadTerrain = async () => {
      try {
        const terrain = await createWorldTerrainAsync();
        setTerrainProvider(terrain);
      } catch (e) {
        console.error("Failed to load terrain", e);
      }
    };
    loadTerrain();
  }, []);

  const [imageryProvider] = useState(() => new UrlTemplateImageryProvider({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  }));

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    setIsSearching(true);
    
    const coordMatch = searchInput.trim().match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
    
    const performSearch = async () => {
      try {
        if (coordMatch) {
          const lat = parseFloat(coordMatch[1]), lng = parseFloat(coordMatch[2]);
          if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            onLocationSearch?.(lat, lng);
          }
        } else {
          const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchInput.trim())}&format=json&limit=1`);
          const data = await r.json();
          if (data.length > 0) {
            onLocationSearch?.(parseFloat(data[0].lat), parseFloat(data[0].lon));
          }
        }
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        // Fast reset for better UX
        setTimeout(() => setIsSearching(false), 500);
      }
    };

    performSearch();
  };

  return (
    <div className="w-full h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden relative group">
      {/* Search Bar Overlay */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 w-72">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-400/70" />
          <input
            type="text"
            placeholder="Search battlefield coords…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-8 pr-3 py-2 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded text-[10px] text-cyan-50 font-mono placeholder-cyan-900/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          />
        </div>
        <button 
          onClick={handleSearch} 
          disabled={isSearching}
          className="px-3 py-2 bg-cyan-950/80 backdrop-blur-md border border-cyan-500/30 text-cyan-400 rounded text-[10px] font-bold hover:bg-cyan-900/80 transition-colors uppercase tracking-widest disabled:opacity-50 relative overflow-hidden"
        >
          {isSearching ? (
            <motion.div 
              className="absolute inset-0 bg-cyan-400/20"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
          ) : null}
          {isSearching ? "Scanning" : "Scan"}
        </button>
      </div>

      {/* Dynamic Scan Overlay */}
      <AnimatePresence>
        {isSearching && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent w-2/3 h-full"
              animate={{ x: ["-150%", "250%"] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              style={{ filter: "blur(40px)" }}
            />
            
            {/* Sharp Scanline */}
            <motion.div 
              className="absolute inset-0 bg-cyan-400/50 w-[2px] h-full shadow-[0_0_20px_rgba(34,211,238,0.8)]"
              animate={{ x: ["-10%", "110%"] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Pulse Ripples (Multiple) */}
            {[0, 0.5, 1].map((delay) => (
              <motion.div 
                key={delay}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div 
                  className="w-2 h-2 rounded-full border-2 border-cyan-400"
                  initial={{ scale: 0, opacity: 0.8 }}
                  animate={{ scale: 80, opacity: 0 }}
                  transition={{ duration: 2, delay, repeat: Infinity, ease: "easeOut" }}
                />
              </motion.div>
            ))}

            {/* Scanning Status Text Overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
              <div className="px-6 py-2 bg-black/80 border border-cyan-500/50 rounded-lg backdrop-blur-xl shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                <span className="text-sm font-bold text-cyan-400 animate-pulse tracking-[0.5em] uppercase">Deep Scan Active</span>
              </div>
              <div className="text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded">
                Retrieving Satellite Intelligence...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cesium Viewer */}
      <div className="flex-1 relative">
        <Viewer
          ref={viewerRef}
          full
          terrainProvider={terrainProvider}
          timeline={false}
          animation={false}
          baseLayerPicker={false}
          geocoder={false}
          homeButton={false}
          infoBox={true}
          navigationHelpButton={false}
          sceneModePicker={false}
          selectionIndicator={true}
          shadows={true}
          className="cesium-viewer-custom"
          style={{ height: "100%", width: "100%" }}
        >
          <ImageryLayer imageryProvider={imageryProvider} />
          <CameraFlyTo
            destination={Cartesian3.fromDegrees(centerLng, centerLat, 15000)}
            duration={2}
          />

          {/* Unit Communications / Links */}
          {units.length > 1 && units.slice(0, 5).map((unit, i) => {
            const nextUnit = units[(i + 1) % units.length];
            return (
              <Entity key={`link-${i}`} name="Comm Link">
                <PolylineGraphics
                  positions={Cartesian3.fromDegreesArrayHeights([
                    unit.lng, unit.lat, unit.type === 'air' ? 5000 : 100,
                    nextUnit.lng, nextUnit.lat, nextUnit.type === 'air' ? 5000 : 100
                  ])}
                  width={2}
                  material={Color.CYAN.withAlpha(0.3)}
                />
              </Entity>
            );
          })}

          {units.map((unit) => {
            const isSelected = selectedUnit === unit.id;
            const color = STATUS_COLOR[unit.status] || Color.WHITE;
            
            return (
              <Entity
                key={unit.id}
                id={unit.id}
                name={unit.name}
                position={Cartesian3.fromDegrees(unit.lng, unit.lat, unit.type === 'air' ? 5000 : 100)}
                onClick={() => onUnitSelect(unit.id)}
              >
                <PointGraphics
                  pixelSize={isSelected ? 16 : 10}
                  color={color}
                  outlineColor={isSelected ? Color.CYAN : Color.BLACK}
                  outlineWidth={2}
                />
                <LabelGraphics
                  text={unit.name}
                  font="12px monospace"
                  fillColor={Color.CYAN}
                  outlineColor={Color.BLACK}
                  outlineWidth={2}
                  pixelOffset={new Cartesian2(0, -20)}
                  verticalOrigin={VerticalOrigin.BOTTOM}
                  horizontalOrigin={HorizontalOrigin.CENTER}
                  showBackground
                  backgroundColor={Color.BLACK.withAlpha(0.7)}
                />
                <EntityDescription>
                  <div className="p-4 bg-[#05070a] text-cyan-50 font-sans border border-cyan-500/20 rounded">
                    <h3 className="text-sm font-bold mb-2 uppercase tracking-widest text-cyan-400 border-b border-cyan-500/20 pb-1">{unit.name}</h3>
                    <div className="space-y-1 text-[11px] font-mono">
                      <p><span className="text-cyan-900">TYPE:</span> {unit.type.toUpperCase()}</p>
                      <p><span className="text-cyan-900">COORD:</span> {unit.lat.toFixed(4)}, {unit.lng.toFixed(4)}</p>
                      <p><span className="text-cyan-900">HEALTH:</span> {Math.round(unit.health)}%</p>
                      <p><span className="text-cyan-900">AMMO:</span> {Math.round(unit.ammo)}%</p>
                      <p><span className="text-cyan-900">FUEL:</span> {Math.round(unit.fuel)}%</p>
                    </div>
                  </div>
                </EntityDescription>
              </Entity>
            );
          })}
        </Viewer>

        {/* Overlay HUD elements */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button 
            onClick={() => viewerRef.current?.cesiumElement.camera.zoomIn(1000)}
            className="p-2 bg-black/60 backdrop-blur-md border border-cyan-500/30 text-cyan-400 rounded hover:bg-cyan-900/80 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            onClick={() => viewerRef.current?.cesiumElement.camera.zoomOut(1000)}
            className="p-2 bg-black/60 backdrop-blur-md border border-cyan-500/30 text-cyan-400 rounded hover:bg-cyan-900/80 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-[1px] bg-cyan-500/20 my-1" />
          <button 
            onClick={() => onLocationSearch?.(31.6340, 74.8720)}
            className="p-2 bg-black/60 backdrop-blur-md border border-cyan-500/30 text-cyan-400 rounded hover:bg-cyan-900/80 transition-colors"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute inset-0 pointer-events-none z-[1000] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_2px]" />
        <div className="absolute inset-0 pointer-events-none z-[1000] shadow-[inset_0_0_100px_rgba(0,0,0,0.6)]" />
      </div>

      {/* Footer Status */}
      <div className="px-3 py-2 border-t border-cyan-500/20 bg-black/40 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isSearching ? "bg-red-500 animate-pulse" : "bg-cyan-500 animate-pulse"}`} />
            <span className="text-[9px] font-bold text-cyan-400/70 uppercase tracking-widest">{isSearching ? "DATA UPLINK ACTIVE" : "3D RENDERING ACTIVE"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Box className="w-3 h-3 text-cyan-600" />
            <span className="text-[9px] font-bold text-cyan-600 uppercase tracking-widest">TERRAIN LOADED</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[9px] text-cyan-900 uppercase font-mono">
          <span>LAT: {centerLat.toFixed(4)}</span>
          <span>LNG: {centerLng.toFixed(4)}</span>
        </div>
      </div>

      <style>{`
        .cesium-viewer-custom .cesium-viewer-bottom { display: none !important; }
        .cesium-viewer-custom .cesium-infoBox {
          background: rgba(5, 7, 10, 0.9) !important;
          border: 1px solid rgba(34, 211, 238, 0.2) !important;
          border-radius: 4px !important;
          top: 80px !important;
          right: 20px !important;
          width: 250px !important;
        }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
    </div>
  );
}
