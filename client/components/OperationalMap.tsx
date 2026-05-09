import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Crosshair, ZoomIn, ZoomOut, Eye, EyeOff } from "lucide-react";
import { RiskIndicator } from "@/lib/simulationEngine";

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
  centerLat?: number;
  centerLng?: number;
  onLocationSearch?: (lat: number, lng: number) => void;
  riskIndicators?: RiskIndicator[];
  sectors?: any[];
}

const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const STATUS_COLOR: Record<string, string> = {
  active: "#4ade80",
  warning: "#fbbf24",
  critical: "#ef4444",
  idle: "#6b7280",
};

const TYPE_ICON: Record<string, string> = {
  air: "✈",
  armor: "🛡",
  logistics: "📦",
  infantry: "⚔",
  recon: "👁",
  medic: "➕",
};

function buildMarkerHtml(unit: MapUnit, isSelected: boolean): string {
  const color = STATUS_COLOR[unit.status] ?? "#6b7280";
  const icon = TYPE_ICON[unit.type] ?? "◆";
  return `<div style="
    width:32px;height:32px;
    background:${color};
    border:2px solid ${isSelected ? "#22d3ee" : "rgba(255,255,255,0.8)"};
    border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-size:13px;
    box-shadow:0 0 ${isSelected ? "14px" : "8px"} ${color};
    transition:box-shadow 0.2s;
  ">${icon}</div>`;
}

export default function OperationalMap({
  units,
  selectedUnit,
  onUnitSelect,
  centerLat = 31.6340,
  centerLng = 74.8720,
  onLocationSearch,
  riskIndicators = [],
  sectors = [],
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const searchCircleRef = useRef<L.Circle | null>(null);
  const selectionCircleRef = useRef<L.Circle | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const sectorsLayerRef = useRef<L.LayerGroup | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showUnits, setShowUnits] = useState(true);

  // ── Initialize map ONCE ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current, {
      zoomControl: false,
      preferCanvas: true, // much faster rendering
    }).setView([centerLat, centerLng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
      className: "map-tiles",
    }).addTo(map.current);

    heatmapLayerRef.current = L.layerGroup().addTo(map.current);
    sectorsLayerRef.current = L.layerGroup().addTo(map.current);

    const style = document.createElement("style");
    style.id = "map-dark-style";
    style.textContent = `
      .map-tiles { filter: brightness(0.45) contrast(1.2) saturate(0.4) hue-rotate(180deg); }
      .leaflet-container { background: #000 !important; }
      .custom-unit-marker { background: transparent !important; border: none !important; }
    `;
    document.head.appendChild(style);

    return () => {
      document.getElementById("map-dark-style")?.remove();
      map.current?.remove();
      map.current = null;
      markersRef.current.clear();
    };
  }, []); // ← empty deps: init once only

  // ── Sync map view with props ─────────────────────────────────────────────
  useEffect(() => {
    if (map.current) {
      if (units.length > 0) {
        const bounds = L.latLngBounds(units.map(u => [u.lat, u.lng]));
        map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      } else {
        map.current.setView([centerLat, centerLng], 13);
      }
    }
  }, [centerLat, centerLng]);

  // ── Update markers incrementally (no full rebuild) ───────────────────────
  useEffect(() => {
    if (!map.current) return;

    const currentIds = new Set(units.map((u) => u.id));

    // Remove markers for units that no longer exist
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    if (!showUnits) {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      return;
    }

    units.forEach((unit) => {
      const isSelected = selectedUnit === unit.id;
      const existing = markersRef.current.get(unit.id);

      if (existing) {
        // Just move + update icon — no remove/re-add
        existing.setLatLng([unit.lat, unit.lng]);
        existing.setIcon(
          L.divIcon({
            html: buildMarkerHtml(unit, isSelected),
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -20],
            className: "custom-unit-marker",
          })
        );
      } else {
        // Create new marker
        const marker = L.marker([unit.lat, unit.lng], {
          icon: L.divIcon({
            html: buildMarkerHtml(unit, isSelected),
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -20],
            className: "custom-unit-marker",
          }),
        });

        marker.on("click", () => onUnitSelect(unit.id));
        marker.addTo(map.current!);
        markersRef.current.set(unit.id, marker);
      }

      // Update popup content (lazy — only bind, don't open)
      const existing2 = markersRef.current.get(unit.id);
      if (existing2) {
        existing2.bindPopup(`
          <div style="min-width:180px;font-size:12px;color:#ccc">
            <strong style="color:#fff">${unit.name}</strong><br/>
            Type: ${unit.type.toUpperCase()}<br/>
            Personnel: ${unit.personnel}<br/>
            Health: ${Math.round(unit.health)}% &nbsp; Ammo: ${Math.round(unit.ammo)}%<br/>
            Fuel: ${Math.round(unit.fuel)}%<br/>
            <span style="color:${STATUS_COLOR[unit.status]}">● ${unit.status.toUpperCase()}</span>
          </div>
        `, { maxWidth: 220 });
      }
    });

    // Selection circle — update position without recreating
    if (selectionCircleRef.current) {
      selectionCircleRef.current.remove();
      selectionCircleRef.current = null;
    }
    if (selectedUnit) {
      const sel = units.find((u) => u.id === selectedUnit);
      if (sel && map.current) {
        selectionCircleRef.current = L.circle([sel.lat, sel.lng], {
          color: "#22d3ee",
          weight: 1.5,
          opacity: 0.7,
          fill: false,
          radius: 400,
        }).addTo(map.current);
      }
    }
  }, [units, selectedUnit, showUnits, onUnitSelect]);

  // ── Heatmap layer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!heatmapLayerRef.current) return;
    heatmapLayerRef.current.clearLayers();
    if (!showHeatmap) return;

    riskIndicators.forEach((risk) => {
      const unit = units.find((u) => u.id === risk.unitId);
      if (!unit) return;
      const color = risk.riskScore > 70 ? "#ef4444" : risk.riskScore > 40 ? "#fbbf24" : "#4ade80";
      L.circle([unit.lat, unit.lng], {
        color,
        weight: 1,
        opacity: 0.4,
        fillColor: color,
        fillOpacity: 0.15,
        radius: 300 + risk.riskScore * 6,
      }).addTo(heatmapLayerRef.current!);
    });
  }, [riskIndicators, showHeatmap, units]);

  // ── Sectors layer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sectorsLayerRef.current) return;
    sectorsLayerRef.current.clearLayers();

    sectors.forEach((sector, i) => {
      const color = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"][i % 5];
      L.circle([sector.centroid.lat, sector.centroid.lng], {
        radius: 1800,
        color,
        weight: 1,
        fillColor: color,
        fillOpacity: 0.04,
        dashArray: "5 5",
      }).addTo(sectorsLayerRef.current!);

      L.marker([sector.centroid.lat, sector.centroid.lng], {
        icon: L.divIcon({
          className: "bg-transparent",
          html: `<div style="font-size:9px;font-weight:700;letter-spacing:0.15em;padding:2px 6px;border-radius:3px;border:1px solid ${color};color:${color};background:rgba(0,0,0,0.6);white-space:nowrap">SECTOR ${String.fromCharCode(65 + i)}</div>`,
          iconSize: [80, 18],
        }),
      }).addTo(sectorsLayerRef.current!);
    });
  }, [sectors]);

  // ── Search helpers ───────────────────────────────────────────────────────
  const centerOnLocation = (lat: number, lng: number) => {
    if (!map.current) return;
    map.current.setView([lat, lng], 14);
    searchCircleRef.current?.remove();
    searchCircleRef.current = L.circle([lat, lng], {
      color: "#06b6d4", weight: 2, opacity: 0.6,
      fillColor: "#06b6d4", fillOpacity: 0.08, radius: 3000,
    }).addTo(map.current);
  };

  const handleSearch = () => {
    if (!searchInput.trim() || !map.current) return;
    setIsSearching(true);
    const coordMatch = searchInput.trim().match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]), lng = parseFloat(coordMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        centerOnLocation(lat, lng);
        onLocationSearch?.(lat, lng);
        setIsSearching(false);
        return;
      }
    }
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchInput.trim())}&format=json&limit=1`)
      .then((r) => r.json())
      .then((data) => {
        if (data.length > 0) {
          centerOnLocation(parseFloat(data[0].lat), parseFloat(data[0].lon));
          onLocationSearch?.(parseFloat(data[0].lat), parseFloat(data[0].lon));
        }
        setIsSearching(false);
      })
      .catch(() => setIsSearching(false));
  };

  const handleCurrentLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => centerOnLocation(coords.latitude, coords.longitude),
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      {/* Search Bar */}
      <div className="p-3 border-b border-border bg-black/30 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search coordinates (lat,lng) or location…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-8 pr-3 py-1.5 bg-input border border-border rounded text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button onClick={handleSearch} disabled={isSearching}
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 disabled:opacity-50">
          {isSearching ? "…" : "Go"}
        </button>
        <button onClick={handleCurrentLocation}
          className="px-2 py-1.5 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90">
          <Crosshair className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Map */}
      <div ref={mapContainer} className="flex-1 relative overflow-hidden" style={{ minHeight: 300 }}>
        <div className="absolute inset-0 pointer-events-none z-[1000] opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_2px]" />
        <div className="absolute inset-0 pointer-events-none z-[1000] shadow-[inset_0_0_60px_rgba(0,0,0,0.5)]" />

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-[1001]">
          <button onClick={() => map.current?.zoomIn()}
            className="p-1.5 bg-black/60 border border-white/10 text-white/70 rounded hover:bg-white/10 transition-colors">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => map.current?.zoomOut()}
            className="p-1.5 bg-black/60 border border-white/10 text-white/70 rounded hover:bg-white/10 transition-colors">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="px-3 py-2 border-t border-border bg-black/30 flex items-center gap-2">
        <button onClick={() => setShowUnits(!showUnits)}
          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1.5 transition-colors ${showUnits ? "bg-primary/20 text-primary border border-primary/40" : "bg-muted text-muted-foreground border border-transparent"}`}>
          {showUnits ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />} Units
        </button>
        <button onClick={() => setShowHeatmap(!showHeatmap)}
          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1.5 transition-colors ${showHeatmap ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-muted text-muted-foreground border border-transparent"}`}>
          {showHeatmap ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />} Heatmap
        </button>
        <div className="ml-auto flex items-center gap-3 text-[9px] text-white/30">
          {[["#4ade80","Active"],["#fbbf24","Warning"],["#ef4444","Critical"]].map(([c,l]) => (
            <span key={l} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: c }} />{l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

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
  centerLat?: number;
  centerLng?: number;
  onLocationSearch?: (lat: number, lng: number) => void;
  riskIndicators?: RiskIndicator[];
  sectors?: any[];
}

