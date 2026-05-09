import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Shield, Download, ArrowLeft, TrendingUp, Activity, BarChart2, RefreshCw } from "lucide-react";
import {
  simulationEngine, startSimulation, Unit,
} from "@/lib/simulationEngine";

const UNIT_COLORS: Record<string, string> = {
  "ALPHA-1":   "#22d3ee",
  "BRAVO-2":   "#f59e0b",
  "CHARLIE-3": "#4ade80",
  "DELTA-4":   "#f87171",
  "ECHO-5":    "#a78bfa",
  "FOXTROT-6": "#fb923c",
  "GOLF-7":    "#34d399",
};

const EVENT_COLORS = ["#22d3ee", "#f59e0b", "#4ade80", "#f87171", "#a78bfa"];

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function Analytics() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [healthHistory, setHealthHistory] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [missionMs, setMissionMs] = useState(0);
  const [sortKey, setSortKey] = useState<keyof Unit>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const stop = startSimulation(2000);
    return () => stop();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setUnits([...simulationEngine.getUnits()]);
      setHealthHistory([...simulationEngine.getHealthHistory()]);
      setEvents(simulationEngine.getEvents());
      setMissionMs(simulationEngine.getMissionElapsedMs());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Event type distribution for pie chart
  const eventTypeCounts = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(eventTypeCounts).map(([name, value]) => ({ name, value }));

  // Events per unit for bar chart
  const eventsByUnit = units.map((u) => ({
    id: u.id,
    count: events.filter((e) => e.unitId === u.id).length,
  }));

  // Radar chart data (readiness per unit) — Health, Ammo, Fuel, Comms (all measurable)
  const radarData = units.map((u) => ({
    unit: u.id.split("-")[0],
    Health: Math.round(u.health),
    Ammo: Math.round(u.ammo),
    Fuel: Math.round(u.fuel),
    Comms: u.communicationLink === "strong" ? 100 : u.communicationLink === "weak" ? 50 : 0,
  }));

  // Sort table
  const sortedUnits = [...units].sort((a, b) => {
    const av = a[sortKey] as any;
    const bv = b[sortKey] as any;
    const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const toggleSort = (key: keyof Unit) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      missionElapsed: formatMs(missionMs),
      units: simulationEngine.getUnits(),
      events: simulationEngine.getEvents(),
      recommendations: simulationEngine.getRecommendations(),
      riskIndicators: simulationEngine.getRiskIndicators(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `saws-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tooltipStyle = {
    backgroundColor: "hsl(219 18% 12%)",
    border: "1px solid hsl(219 18% 18%)",
    borderRadius: "8px",
    color: "hsl(210 13% 92%)",
    fontSize: "12px",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold">SAWS</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground text-sm">Analytics</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground border border-border rounded px-3 py-1.5">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Mission: <span className="font-mono text-primary">{formatMs(missionMs)}</span>
            </div>
            <Link to="/dashboard" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <button
              id="export-btn"
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" /> Export JSON
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Units",    value: units.length,                                          color: "text-primary" },
            { label: "Active",         value: units.filter((u) => u.status === "active").length,     color: "text-green-400" },
            { label: "Critical Units", value: units.filter((u) => u.status === "critical").length,   color: "text-red-400"  },
            { label: "Total Events",   value: events.length,                                         color: "text-amber-400"},
          ].map((kpi) => (
            <div key={kpi.label} className="bg-card border border-border rounded-xl p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{kpi.label}</p>
              <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Health over time */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Unit Health Over Time</h2>
            <span className="text-xs text-muted-foreground ml-auto">Last 30 ticks · Live</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={healthHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(219 18% 18%)" />
              <XAxis dataKey="time" tick={{ fill: "hsl(210 13% 70%)", fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis domain={[0, 100]} tick={{ fill: "hsl(210 13% 70%)", fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              {units.map((u) => (
                <Line
                  key={u.id} type="monotone" dataKey={u.id}
                  stroke={UNIT_COLORS[u.id] ?? "#888"} strokeWidth={2}
                  dot={false} activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar + Pie */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 className="w-5 h-5 text-secondary" />
              <h2 className="text-lg font-semibold">Events per Unit</h2>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={eventsByUnit} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(219 18% 18%)" />
                <XAxis dataKey="id" tick={{ fill: "hsl(210 13% 70%)", fontSize: 10 }} />
                <YAxis tick={{ fill: "hsl(210 13% 70%)", fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Events" radius={[4, 4, 0, 0]}>
                  {eventsByUnit.map((entry) => (
                    <Cell key={entry.id} fill={UNIT_COLORS[entry.id] ?? "#888"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold">Event Type Distribution</h2>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: "hsl(210 13% 50%)" }}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={EVENT_COLORS[i % EVENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold">Unit Readiness Radar</h2>
            <span className="text-xs text-muted-foreground ml-auto">Health · Ammo · Fuel · Comms</span>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {radarData.map((u) => (
              <div key={u.unit} className="bg-background border border-border rounded-lg p-2">
                <p className="text-xs font-mono text-center text-primary mb-1">{u.unit}</p>
                <ResponsiveContainer width="100%" height={160}>
                  <RadarChart data={[
                    { axis: "Health", val: u.Health },
                    { axis: "Ammo",   val: u.Ammo   },
                    { axis: "Fuel",   val: u.Fuel    },
                    { axis: "Comms",  val: u.Comms   },
                  ]} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <PolarGrid stroke="hsl(219 18% 22%)" />
                    <PolarAngleAxis dataKey="axis" tick={{ fill: "hsl(210 13% 60%)", fontSize: 9 }} />
                    <Radar dataKey="val" stroke={UNIT_COLORS[units.find(u2 => u2.id.startsWith(u.unit))?.id ?? ""] ?? "#22d3ee"}
                      fill={UNIT_COLORS[units.find(u2 => u2.id.startsWith(u.unit))?.id ?? ""] ?? "#22d3ee"} fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Unit Summary Table</h2>
            <span className="text-xs text-muted-foreground ml-2">Click column headers to sort</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/50">
                <tr>
                  {(["id", "type", "status", "health", "ammo", "fuel", "threatLevel"] as (keyof Unit)[]).map((col) => (
                    <th
                      key={col}
                      onClick={() => toggleSort(col)}
                      className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                    >
                      {col} {sortKey === col ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Readiness
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedUnits.map((u, i) => (
                  <tr
                    key={u.id}
                    className={`border-t border-border/50 hover:bg-card/70 transition-colors ${i % 2 === 0 ? "" : "bg-background/20"}`}
                  >
                    <td className="px-4 py-2 font-mono text-primary text-xs">{u.id}</td>
                    <td className="px-4 py-2 capitalize text-xs">{u.type}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        u.status === "active"   ? "bg-green-400/10 text-green-400" :
                        u.status === "warning"  ? "bg-amber-400/10 text-amber-400" :
                        u.status === "critical" ? "bg-red-400/10 text-red-400" :
                                                  "bg-muted/40 text-muted-foreground"
                      }`}>{u.status}</span>
                    </td>
                    <td className="px-4 py-2 text-xs">{Math.round(u.health)}%</td>
                    <td className="px-4 py-2 text-xs">{Math.round(u.ammo)}%</td>
                    <td className="px-4 py-2 text-xs">{Math.round(u.fuel)}%</td>
                    <td className="px-4 py-2 text-xs font-semibold">
                      {Math.round((u.health + u.ammo + u.fuel) / 3)}%
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-xs ${
                        u.threatLevel === "critical" ? "text-red-400" :
                        u.threatLevel === "high"     ? "text-orange-400" :
                        u.threatLevel === "medium"   ? "text-amber-400" : "text-green-400"
                      }`}>{u.threatLevel}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
