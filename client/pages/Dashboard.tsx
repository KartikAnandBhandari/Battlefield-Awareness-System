import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Clock,
  Shield,
  Menu,
  X,
  Activity,
  Zap,
  TrendingUp,
  Radio,
  ChevronDown,
  MessageSquare,
  Eye,
  EyeOff,
  Crosshair,
  Maximize2,
  Trophy,
  Target,
  Settings,
  Home,
  BookOpen,
} from "lucide-react";
import OperationalMap from "@/components/OperationalMap";
import CesiumMap from "@/components/CesiumMap";
import { SatelliteFeed } from "@/components/SatelliteFeed";
import AlgorithmShowcase from "@/components/AlgorithmShowcase";
import TechnicalTelemetry from "@/components/TechnicalTelemetry";
import { motion, AnimatePresence } from "framer-motion";
import {
  simulationEngine,
  startSimulation,
  Unit,
  OperationalEvent,
  RiskIndicator,
  DecisionRecommendation,
  CommunicationLog,
  SensorFeed,
} from "@/lib/simulationEngine";

type FilterType = "all" | "movement" | "threat" | "supply" | "communication";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [systemTime, setSystemTime] = useState(new Date());
  const [units, setUnits] = useState<Unit[]>([]);
  const [events, setEvents] = useState<OperationalEvent[]>([]);
  const [riskIndicators, setRiskIndicators] = useState<RiskIndicator[]>([]);
  const [recommendations, setRecommendations] = useState<DecisionRecommendation[]>([]);
  const [communications, setCommunications] = useState<CommunicationLog[]>([]);
  const [sensorFeeds, setSensorFeeds] = useState<SensorFeed[]>([]);
  const [eventFilter, setEventFilter] = useState<FilterType>("all");
  const [expandedSections, setExpandedSections] = useState({
    map: true,
    alerts: true,
    units: true,
    timeline: true,
    communications: true,
    sensors: true,
    recommendations: true,
  });
  const [sectors, setSectors] = useState<any[]>([]);
  const [envData, setEnvData] = useState<any>(null);
  const [isBriefing, setIsBriefing] = useState(false);
  const [viewMode, setViewMode] = useState<"2D View" | "3D Global">("2D View");
  const [mapCenter, setMapCenter] = useState({ lat: 31.6340, lng: 74.8720 });

  // Initialize simulation
  useEffect(() => {
    const stopSimulation = startSimulation(2000);
    return () => stopSimulation();
  }, []);

  // Update data from simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemTime(new Date());
      setUnits([...simulationEngine.getUnits()]);
      setEvents(simulationEngine.getEvents());
      setRiskIndicators(simulationEngine.getRiskIndicators());
      setRecommendations(simulationEngine.getRecommendations());
      setCommunications(simulationEngine.getCommunicationLogs());
      setSensorFeeds(simulationEngine.getSensorFeeds());
      setSectors(simulationEngine.getKMeansSectors());
      setEnvData(simulationEngine.getEnvironmentalData()[0]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update map center when a unit is selected (Only on selection change, not every second)
  const lastSelectedId = useRef<string | null>(null);
  useEffect(() => {
    if (selectedUnit && selectedUnit !== lastSelectedId.current) {
      const unit = units.find(u => u.id === selectedUnit);
      if (unit) {
        setMapCenter({ lat: unit.lat, lng: unit.lng });
      }
      lastSelectedId.current = selectedUnit;
    }
  }, [selectedUnit, units]);

  const handleVoiceBriefing = () => {
    if (isBriefing) {
      window.speechSynthesis.cancel();
      setIsBriefing(false);
      return;
    }

    const avgRisk = riskIndicators.length > 0 
      ? Math.round(riskIndicators.reduce((acc, r) => acc + r.riskScore, 0) / riskIndicators.length) 
      : 0;

    const criticalCount = units.filter(u => u.status === "critical").length;
    const avgReadiness = units.length > 0
      ? Math.round(units.reduce((acc, u) => acc + (u.health + u.fuel + u.ammo) / 3, 0) / units.length)
      : 0;

    const text = `Tactical Situation Report. 
      Total units deployed: ${units.length}. 
      Fleet readiness is at ${avgReadiness} percent. 
      ${criticalCount > 0 ? `${criticalCount} unit${criticalCount > 1 ? "s" : ""} in critical state.` : "No units in critical state."} 
      Global threat level is at ${avgRisk} percent. 
      Standing by for further commands.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsBriefing(true);
    utterance.onend = () => setIsBriefing(false);
    window.speechSynthesis.speak(utterance);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-status-active";
      case "warning": return "text-status-warning";
      case "critical": return "text-status-critical";
      default: return "text-status-idle";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "border-destructive/50 bg-destructive/10";
      case "warning": return "border-accent/50 bg-accent/10";
      default: return "border-primary/50 bg-primary/10";
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  const alerts = simulationEngine.getAlerts();
  const selectedUnitData = selectedUnit ? units.find((u) => u.id === selectedUnit) : null;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="flex h-screen bg-[#05070a] text-foreground overflow-hidden font-sans">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } border-r border-border/40 bg-card/30 backdrop-blur-xl transition-all duration-300 overflow-hidden flex flex-col flex-shrink-0 z-50`}
      >
        <div className="p-4 border-b border-border/40 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_10px_rgba(var(--primary),0.3)]">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-sm tracking-tighter uppercase">Tactical HQ</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-muted rounded text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-8 custom-scrollbar">
          {/* Satellite Intel Feed */}
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase font-bold text-cyan-400/70 tracking-[0.2em] px-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
              SAT-FEED 04
            </h3>
            <SatelliteFeed center={mapCenter} />
          </div>

          {/* Operational Status Lines — auto-generated from live data */}
          {(() => {
            const fleetReadiness = units.length > 0
              ? Math.round(units.reduce((s, u) => s + (u.health + u.fuel + u.ammo) / 3, 0) / units.length)
              : null;
            const criticalUnits = units.filter(u => u.status === "critical");
            const warningUnits  = units.filter(u => u.status === "warning");
            const weakComms     = units.filter(u => u.communicationLink !== "strong");
            const highThreat    = units.filter(u => u.threatLevel === "high");
            const avgVis        = envData ? envData.visibility : null;

            // Derive top degradation driver across the fleet
            const resourceAvgs = units.length > 0 ? {
              health: Math.round(units.reduce((s, u) => s + u.health, 0) / units.length),
              fuel:   Math.round(units.reduce((s, u) => s + u.fuel,   0) / units.length),
              ammo:   Math.round(units.reduce((s, u) => s + u.ammo,   0) / units.length),
            } : null;
            const topDriver = resourceAvgs
              ? (resourceAvgs.fuel <= resourceAvgs.health && resourceAvgs.fuel <= resourceAvgs.ammo
                  ? `fuel avg ${resourceAvgs.fuel}%`
                  : resourceAvgs.ammo <= resourceAvgs.health
                  ? `ammo avg ${resourceAvgs.ammo}%`
                  : `health avg ${resourceAvgs.health}%`)
              : null;

            const statusLines = [
              {
                label: "Force Readiness",
                value: fleetReadiness !== null ? `${fleetReadiness}%` : "—",
                sub: topDriver ? `driven by ${topDriver}` : "awaiting data",
                band: fleetReadiness === null ? "neutral" : fleetReadiness >= 66 ? "green" : fleetReadiness >= 33 ? "amber" : "red",
              },
              {
                label: "Unit Status",
                value: criticalUnits.length > 0
                  ? `${criticalUnits.length} critical`
                  : warningUnits.length > 0
                  ? `${warningUnits.length} warning`
                  : `${units.length} active`,
                sub: criticalUnits.length > 0
                  ? criticalUnits.map(u => u.name).join(", ")
                  : warningUnits.length > 0
                  ? warningUnits.map(u => u.name).join(", ")
                  : "all units nominal",
                band: criticalUnits.length > 0 ? "red" : warningUnits.length > 0 ? "amber" : "green",
              },
              {
                label: "Comms Health",
                value: units.length > 0
                  ? `${Math.round(((units.length - weakComms.length) / units.length) * 100)}% strong`
                  : "—",
                sub: weakComms.length > 0
                  ? `${weakComms.length} link${weakComms.length > 1 ? "s" : ""} degraded`
                  : "all links nominal",
                band: weakComms.length === 0 ? "green" : weakComms.length <= 1 ? "amber" : "red",
              },
              {
                label: "Threat Exposure",
                value: highThreat.length > 0 ? `${highThreat.length} high-threat` : "nominal",
                sub: highThreat.length > 0
                  ? highThreat.map(u => u.name).join(", ")
                  : avgVis !== null ? `visibility ${avgVis}%` : "no high-threat units",
                band: highThreat.length >= 2 ? "red" : highThreat.length === 1 ? "amber" : "green",
              },
            ];

            const bandColor = {
              green:   { dot: "bg-green-500",  text: "text-green-400",  border: "border-green-500/20" },
              amber:   { dot: "bg-amber-500",  text: "text-amber-400",  border: "border-amber-500/20" },
              red:     { dot: "bg-red-500",    text: "text-red-400",    border: "border-red-500/20"   },
              neutral: { dot: "bg-white/30",   text: "text-white/40",   border: "border-white/10"     },
            };

            return (
              <div className="space-y-3">
                <h3 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-1">
                  Operational Status
                </h3>
                {statusLines.map((line) => {
                  const c = bandColor[line.band as keyof typeof bandColor];
                  return (
                    <div key={line.label} className={`p-2.5 rounded-lg bg-background/40 border ${c.border} flex flex-col gap-1`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                          <span className="text-[9px] uppercase font-bold text-white/40 tracking-wider">{line.label}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold ${c.text}`}>{line.value}</span>
                      </div>
                      <p className="text-[9px] text-white/35 pl-3 leading-relaxed truncate">{line.sub}</p>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Environmental Intel */}
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-1">
              Environmental Intel
            </h3>
            {envData && (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Weather", value: envData.weather },
                  { label: "Visibility", value: `${envData.visibility}%` },
                  { label: "Temp", value: `${envData.temperature}°C` },
                  { label: "Terrain", value: envData.terrain, accent: true },
                ].map((item, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-background/40 border border-border/30 hover:bg-black/40 transition-colors">
                    <span className="text-[8px] text-muted-foreground block uppercase mb-1">{item.label}</span>
                    <span className={`text-xs font-mono capitalize ${item.accent ? 'text-cyan-400/80' : ''}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Unit Details */}
          <AnimatePresence>
            {selectedUnitData && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-3 bg-cyan-950/20 rounded-lg border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.05)]"
              >
                <h3 className="text-xs font-bold mb-3 flex items-center gap-2 text-cyan-400">
                  <Target className="w-3 h-3" />
                  {selectedUnitData.name}
                </h3>
                <div className="space-y-2 text-[10px] font-mono">
                  {[
                    { label: "Status", value: selectedUnitData.status, color: getStatusColor(selectedUnitData.status) },
                    { label: "Personnel", value: selectedUnitData.personnel },
                    { label: "Health", value: `${Math.round(selectedUnitData.health)}%` },
                    { label: "Ammo", value: `${Math.round(selectedUnitData.ammo)}%` },
                    { label: "Fuel", value: `${Math.round(selectedUnitData.fuel)}%` },
                    { label: "Readiness", value: `${Math.round((selectedUnitData.health + selectedUnitData.fuel + selectedUnitData.ammo) / 3)}%` },
                    { label: "Threat", value: selectedUnitData.threatLevel, accent: true },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-white/40 uppercase">{row.label}</span>
                      <span className={row.color || (row.accent ? 'text-cyan-400' : 'text-white/80')}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-border/40 bg-black/20 space-y-3">
          <button 
            onClick={handleVoiceBriefing}
            className={`w-full py-2.5 rounded-lg border flex items-center justify-center gap-2 transition-all duration-300 font-bold text-xs uppercase tracking-widest ${
              isBriefing 
                ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.2)]" 
                : "bg-cyan-500/10 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
            }`}
          >
            <Radio className="w-4 h-4" />
            {isBriefing ? "STOP COMMS" : "SITUATION BRIEF"}
          </button>
          
          <Link
            to="/technical-manual"
            className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold text-cyan-500/60 hover:text-cyan-400 transition-colors uppercase tracking-widest border border-cyan-500/10 rounded mb-2"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Technical Manual
          </Link>

          <Link
            to="/"
            className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-white transition-colors uppercase tracking-widest"
          >
            <Home className="w-3.5 h-3.5" />
            Abort Operation
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

        {/* Header */}
        <header className="border-b border-border/40 bg-black/40 backdrop-blur-md flex-shrink-0 z-40">
          <div className="h-14 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-cyan-400"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-sm font-bold tracking-[0.3em] uppercase text-white/90">
                Command Terminal <span className="text-cyan-500 font-mono ml-2">V4.0.2</span>
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">System Time</span>
                <span className="text-sm font-mono text-cyan-400">{formatTime(systemTime)}</span>
              </div>
              <div className="h-8 w-[1px] bg-white/10" />
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Uplink Active</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
            {/* Map Section */}
            <section className="relative">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-xs font-bold flex items-center gap-2 uppercase tracking-[0.2em] text-white/70">
                  <Crosshair className="w-4 h-4 text-cyan-500" />
                  Geospatial Intelligence Feed
                </h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewMode("2D View")}
                    className={`text-[10px] px-2 py-1 rounded border transition-colors uppercase font-mono ${viewMode === "2D View" ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                  >
                    2D View
                  </button>
                  <button 
                    onClick={() => setViewMode("3D Global")}
                    className={`text-[10px] px-2 py-1 rounded border transition-colors uppercase font-mono ${viewMode === "3D Global" ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                  >
                    3D Global
                  </button>
                </div>
              </div>
              <div className="h-[550px] rounded-xl overflow-hidden border border-border/40 shadow-2xl relative">
                {viewMode === "2D View" ? (
                  <>
                    <OperationalMap
                      units={units}
                      selectedUnit={selectedUnit}
                      onUnitSelect={setSelectedUnit}
                      riskIndicators={riskIndicators}
                      sectors={sectors}
                      centerLat={mapCenter.lat}
                      onLocationSearch={(lat, lng) => {
                        setMapCenter({ lat, lng });
                        simulationEngine.relocateOperations(lat, lng);
                        setUnits([...simulationEngine.getUnits()]);
                      }}
                    />
                    <div className="absolute bottom-4 left-4 z-[1000]">
                      <button 
                        onClick={() => {
                          const base = simulationEngine.getBaseLocation();
                          setMapCenter(base);
                        }}
                        className="p-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-colors shadow-lg flex items-center justify-center"
                        title="Recenter on HQ"
                      >
                        <Crosshair className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <CesiumMap
                      units={units}
                      selectedUnit={selectedUnit}
                      onUnitSelect={setSelectedUnit}
                      riskIndicators={riskIndicators}
                      sectors={sectors}
                      centerLat={mapCenter.lat}
                      centerLng={mapCenter.lng}
                      onLocationSearch={(lat, lng) => {
                        setMapCenter({ lat, lng });
                        simulationEngine.relocateOperations(lat, lng);
                        setUnits([...simulationEngine.getUnits()]);
                      }}
                    />
                    <div className="absolute bottom-4 left-4 z-[1000]">
                      <button 
                        onClick={() => {
                          const base = simulationEngine.getBaseLocation();
                          setMapCenter(base);
                        }}
                        className="p-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-colors shadow-lg flex items-center justify-center"
                        title="Recenter on HQ"
                      >
                        <Crosshair className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Tactical Grid */}
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Left Column: Alerts & Units */}
              <div className="lg:col-span-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Alerts Panel */}
                  <div className="bg-card/30 border border-border/40 rounded-xl overflow-hidden flex flex-col h-[400px] backdrop-blur-sm">
                    <div className="p-4 border-b border-border/40 bg-black/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <h2 className="text-xs font-bold uppercase tracking-widest">Tactical Alerts</h2>
                      </div>
                      <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full font-mono">
                        {alerts.length} ACTIVE
                      </span>
                    </div>
                    <div className="flex-1 overflow-auto p-4 space-y-3 custom-scrollbar">
                      {alerts.map((alert) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={alert.id}
                          className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)} transition-all hover:scale-[1.01]`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-tighter">{alert.type}</span>
                            <span className="text-[9px] font-mono opacity-60">12:04:32</span>
                          </div>
                          <p className="text-xs leading-relaxed text-white/90">{alert.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Force Readiness Panel */}
                  <div className="bg-card/30 border border-border/40 rounded-xl overflow-hidden flex flex-col h-[400px] backdrop-blur-sm">
                    {(() => {
                      const sorted = [...units].sort((a, b) => {
                        const order = { critical: 0, warning: 1, active: 2, idle: 3 };
                        return order[a.status] - order[b.status];
                      });
                      const fleetReadiness = units.length > 0
                        ? Math.round(units.reduce((s, u) => s + (u.health + u.fuel + u.ammo) / 3, 0) / units.length)
                        : 0;
                      const criticalCount = units.filter(u => u.status === "critical").length;
                      const warningCount  = units.filter(u => u.status === "warning").length;
                      const readinessBand = fleetReadiness >= 66 ? "green" : fleetReadiness >= 33 ? "amber" : "red";
                      const bandStyle = {
                        green: { bar: "bg-green-500", text: "text-green-400" },
                        amber: { bar: "bg-amber-500", text: "text-amber-400" },
                        red:   { bar: "bg-red-500",   text: "text-red-400"   },
                      }[readinessBand];

                      return (
                        <>
                          <div className="p-4 border-b border-border/40 bg-black/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-cyan-500" />
                              <h2 className="text-xs font-bold uppercase tracking-widest">Force Readiness</h2>
                            </div>
                            <span className={`text-[10px] font-mono font-bold ${bandStyle.text}`}>
                              {fleetReadiness}% fleet avg
                            </span>
                          </div>

                          {/* Fleet readiness bar */}
                          <div className="px-4 pt-3 pb-2 border-b border-white/5">
                            <div className="flex justify-between text-[9px] text-white/40 uppercase mb-1">
                              <span>Fleet Readiness Index</span>
                              <span className={bandStyle.text}>{readinessBand.toUpperCase()}</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${bandStyle.bar}`}
                                style={{ width: `${fleetReadiness}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[8px] text-white/25 mt-1">
                              <span>{criticalCount} critical · {warningCount} warning · {units.length - criticalCount - warningCount} active</span>
                              <span>≥66 active · ≥33 warning · &lt;33 critical</span>
                            </div>
                          </div>

                          {/* Exception list — sorted by severity, shows degradation driver */}
                          <div className="flex-1 overflow-auto custom-scrollbar">
                            {sorted.map((unit) => {
                              const readiness = Math.round((unit.health + unit.fuel + unit.ammo) / 3);
                              const driver = unit.fuel <= unit.health && unit.fuel <= unit.ammo
                                ? `fuel ${Math.round(unit.fuel)}%`
                                : unit.ammo <= unit.health
                                ? `ammo ${Math.round(unit.ammo)}%`
                                : `health ${Math.round(unit.health)}%`;
                              const rowStyle = {
                                critical: "border-l-2 border-l-red-500 bg-red-500/5",
                                warning:  "border-l-2 border-l-amber-500 bg-amber-500/5",
                                active:   "border-l-2 border-l-green-500/30 bg-transparent",
                                idle:     "border-l-2 border-l-white/10 bg-transparent",
                              }[unit.status];

                              return (
                                <div
                                  key={unit.id}
                                  onClick={() => setSelectedUnit(unit.id)}
                                  className={`px-4 py-2.5 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${rowStyle} ${selectedUnit === unit.id ? "bg-cyan-500/10" : ""}`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[11px] font-semibold text-white/90">{unit.name}</span>
                                    <span className={`text-[9px] font-mono font-bold ${getStatusColor(unit.status)}`}>
                                      {readiness}%
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] text-white/35">
                                      {unit.status === "active" ? "nominal" : `↓ ${driver}`}
                                    </span>
                                    <div className="flex gap-1.5 items-center">
                                      {[
                                        { v: unit.health, c: "bg-green-500" },
                                        { v: unit.fuel,   c: "bg-cyan-500"  },
                                        { v: unit.ammo,   c: "bg-amber-500" },
                                      ].map(({ v, c }, i) => (
                                        <div key={i} className="w-8 h-1 bg-white/10 rounded-full overflow-hidden">
                                          <div className={`h-full ${c}`} style={{ width: `${v}%` }} />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Timeline Panel */}
                <div className="bg-card/30 border border-border/40 rounded-xl overflow-hidden flex flex-col backdrop-blur-sm">
                  <div className="p-4 border-b border-border/40 bg-black/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-cyan-500" />
                      <h2 className="text-xs font-bold uppercase tracking-widest">Operational Log</h2>
                    </div>
                    <div className="flex gap-1">
                      {["all", "movement", "threat"].map((f) => (
                        <button 
                          key={f}
                          onClick={() => setEventFilter(f as FilterType)}
                          className={`text-[9px] uppercase px-2 py-0.5 rounded transition-colors ${eventFilter === f ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/40 hover:text-white/60'}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 max-h-[300px] overflow-auto space-y-4 custom-scrollbar">
                    {events.filter(e => eventFilter === 'all' || e.type === eventFilter).map((event) => (
                      <div key={event.id} className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${event.type === 'threat' ? 'bg-red-500' : 'bg-cyan-500'}`} />
                          <div className="w-[1px] flex-1 bg-white/10 my-1 group-last:hidden" />
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-white/70 uppercase">{event.type}</span>
                            <span className="text-[9px] font-mono text-white/30">12:04:32</span>
                          </div>
                          <p className="text-xs text-white/50">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Algorithm Showcase */}
              <div className="lg:col-span-4">
                <div className="bg-card/40 border border-cyan-500/20 rounded-xl overflow-hidden flex flex-col h-full bg-gradient-to-b from-cyan-950/10 to-transparent backdrop-blur-md relative">
                  {/* Top Scanline */}
                  <motion.div
                    className="absolute inset-x-0 h-[1px] bg-cyan-400/20 z-0 pointer-events-none"
                    animate={{ y: [0, 800] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  />

                  <div className="p-4 border-b border-cyan-500/20 bg-black/40 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-cyan-400">Algorithm Telemetry</h2>
                    </div>
                    <div className="text-[8px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-white/30 uppercase">
                      Live
                    </div>
                  </div>

                  <div className="p-4 flex-1 relative z-10 flex flex-col overflow-hidden">
                    <AlgorithmShowcase
                      units={units}
                      riskIndicators={riskIndicators}
                      sectors={sectors}
                      selectedUnit={selectedUnit}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Deep Technical Telemetry Section */}
            <TechnicalTelemetry 
              units={units}
              riskIndicators={riskIndicators}
              missionElapsedMs={simulationEngine.getMissionElapsedMs()}
            />
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34, 211, 238, 0.3); }
      `}</style>
    </div>
  );
}
