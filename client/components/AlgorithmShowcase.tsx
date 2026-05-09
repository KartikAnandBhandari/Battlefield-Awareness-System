import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Cpu, GitBranch, Layers, Route } from "lucide-react";
import type { Unit, RiskIndicator } from "@/lib/simulationEngine";

interface AlgorithmShowcaseProps {
  units: Unit[];
  riskIndicators: RiskIndicator[];
  sectors: any[];
  selectedUnit?: string | null;
}

type Tab = "kalman" | "kmeans" | "priority" | "astar";

export default function AlgorithmShowcase({
  units,
  riskIndicators,
  sectors,
  selectedUnit,
}: AlgorithmShowcaseProps) {
  const [activeTab, setActiveTab] = useState<Tab>("kalman");

  const tabs = [
    { id: "kalman" as Tab, label: "Kalman Filter", icon: <Cpu className="w-3 h-3" /> },
    { id: "kmeans" as Tab, label: "K-Means++", icon: <GitBranch className="w-3 h-3" /> },
    { id: "priority" as Tab, label: "Priority Queue", icon: <Layers className="w-3 h-3" /> },
    { id: "astar" as Tab, label: "A* Pathfinding", icon: <Route className="w-3 h-3" /> },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex gap-1 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white/60"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "kalman" && <KalmanFilterViz units={units} />}
        {activeTab === "kmeans" && <KMeansViz sectors={sectors} units={units} />}
        {activeTab === "priority" && <PriorityQueueViz riskIndicators={riskIndicators} />}
        {activeTab === "astar" && <AStarViz selectedUnit={selectedUnit} units={units} />}
      </div>
    </div>
  );
}

// Kalman Filter Visualization
function KalmanFilterViz({ units }: { units: Unit[] }) {
  const unit = units[0];
  if (!unit) return <div className="text-white/30 text-xs">No units available</div>;

  // Convert lat/lng diff to approximate meters
  const rawNoise = Math.sqrt(
    Math.pow((unit.rawLat - unit.filteredLat) * 111000, 2) +
    Math.pow((unit.rawLng - unit.filteredLng) * 111000, 2)
  );
  const noiseReductionPct = Math.min(95, Math.max(40, 100 - rawNoise * 10));

  // Build a mini SVG showing raw (jittery) vs filtered (smooth) dots
  const W = 260, H = 80;
  const cx = W / 2, cy = H / 2;
  const rawPoints = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      x: cx + (Math.sin(i * 2.4) * 18 + Math.cos(i * 1.7) * 12),
      y: cy + (Math.cos(i * 2.1) * 14 + Math.sin(i * 3.1) * 10),
    }));
  }, [unit.id]);

  return (
    <div className="space-y-3 h-full overflow-y-auto pr-1 custom-scrollbar">
      <div className="text-[10px] text-white/60 leading-relaxed bg-cyan-950/20 p-2 rounded-lg border border-cyan-500/20">
        <strong className="text-cyan-400 uppercase tracking-widest text-[9px] block mb-1">Executive Summary</strong>
        Fuses noisy GPS sensor data with motion prediction models to estimate the true position of units. Critical for maintaining situational awareness in electronic warfare environments where GPS may be denied or spoofed.
      </div>

      <div className="text-[10px] text-white/60 leading-relaxed p-2 bg-white/5 rounded border border-white/5">
        <strong className="text-white/80 uppercase tracking-widest text-[9px] block mb-1">How It Works</strong>
        It uses a recursive mathematical process containing two steps: <strong>Predict</strong> (estimating the current state based on previous velocity) and <strong>Update</strong> (correcting the prediction using the latest noisy sensor measurement). Over time, the filter converges on the true trajectory, ignoring random sensor jumps.
      </div>

      <div className="text-[10px] text-cyan-200/60 leading-relaxed p-2 bg-cyan-950/30 rounded border border-cyan-500/10">
        <strong className="text-cyan-500 uppercase tracking-widest text-[9px] block mb-1">Implementation Path</strong>
        <code className="bg-black/50 px-1 py-0.5 rounded text-cyan-400">client/lib/kalmanFilter.ts</code><br/>
        Utilized in <code className="bg-black/50 px-1 py-0.5 rounded text-cyan-400">simulationEngine.ts</code> to process incoming <code className="text-white/50">rawLat/rawLng</code> telemetry into smoothed <code className="text-white/50">filteredLat/filteredLng</code> states before rendering to the 2D and 3D maps.
      </div>

      {/* Visual: Raw scatter vs Filtered point */}
      <div className="rounded-lg bg-black/40 border border-white/10 overflow-hidden flex-shrink-0">
        <div className="flex text-[8px] font-bold uppercase">
          <div className="flex-1 text-center py-1 text-red-400 border-r border-white/10">Raw GPS (noisy)</div>
          <div className="flex-1 text-center py-1 text-green-400">Kalman Filtered</div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
          <clipPath id="left-half"><rect x={0} y={0} width={W/2} height={H} /></clipPath>
          <clipPath id="right-half"><rect x={W/2} y={0} width={W/2} height={H} /></clipPath>
          <line x1={W/2} y1={0} x2={W/2} y2={H} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
          {rawPoints.map((p, i) => (
            <circle key={i} cx={p.x / 2} cy={p.y} r={2} fill="#ef4444" opacity={0.5} />
          ))}
          <circle cx={cx / 2} cy={cy} r={3} fill="#ef4444" opacity={0.3} />
          <circle cx={cx / 2 + W / 2} cy={cy} r={5} fill="none" stroke="#22c55e" strokeWidth={1.5} opacity={0.4} />
          <circle cx={cx / 2 + W / 2} cy={cy} r={3} fill="#22c55e" />
          <circle
            cx={cx / 2 + W / 2} cy={cy} r="8"
            fill="none" stroke="#22c55e" strokeWidth="0.8"
            className="animate-ping"
            style={{ animationDuration: '2s', opacity: 0.4 }}
          />
        </svg>
      </div>

      <div className="text-[9px] text-white/30 leading-relaxed p-2 bg-white/5 rounded text-center font-mono">
        <strong className="text-white/50">Core Equation:</strong> x̂ = x̂ + K·(z − x̂)
      </div>
    </div>
  );
}

// K-Means Clustering Visualization
function KMeansViz({ sectors, units }: { sectors: any[]; units: Unit[] }) {
  if (sectors.length === 0) return <div className="text-white/30 text-xs">Computing clusters...</div>;

  const W = 260, H = 80;
  const lats = units.map((u) => u.lat);
  const lngs = units.map((u) => u.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const pad = 12;

  const toSvg = (lat: number, lng: number) => ({
    x: pad + ((lng - minLng) / (maxLng - minLng || 1)) * (W - pad * 2),
    y: pad + (1 - (lat - minLat) / (maxLat - minLat || 1)) * (H - pad * 2),
  });

  const assignmentMap = new Map<string, { color: string; name: string }>();
  sectors.forEach((s) => {
    s.members.forEach((m: any) => assignmentMap.set(m.id, { color: s.color, name: s.name }));
  });

  return (
    <div className="space-y-3 h-full overflow-y-auto pr-1 custom-scrollbar">
      <div className="text-[10px] text-white/60 leading-relaxed bg-cyan-950/20 p-2 rounded-lg border border-cyan-500/20">
        <strong className="text-cyan-400 uppercase tracking-widest text-[9px] block mb-1">Executive Summary</strong>
        Automatically partitions the battlefield into distinct operational sectors based on unit density. K-Means++ ensures optimal initial seeding, preventing overlapping sectors and identifying high-value clusters for targeted strikes or logistics support.
      </div>

      <div className="text-[10px] text-white/60 leading-relaxed p-2 bg-white/5 rounded border border-white/5">
        <strong className="text-white/80 uppercase tracking-widest text-[9px] block mb-1">How It Works</strong>
        Standard K-Means randomly picks initial center points, which can lead to poor, overlapping clusters. <strong>K-Means++</strong> solves this by picking the first center randomly, but weighting subsequent centers to be as far away from existing ones as possible. It then groups units by distance and re-centers iteratively until the sectors stabilize.
      </div>

      <div className="text-[10px] text-cyan-200/60 leading-relaxed p-2 bg-cyan-950/30 rounded border border-cyan-500/10">
        <strong className="text-cyan-500 uppercase tracking-widest text-[9px] block mb-1">Implementation Path</strong>
        <code className="bg-black/50 px-1 py-0.5 rounded text-cyan-400">client/lib/kmeans.ts</code><br/>
        Utilized in <code className="bg-black/50 px-1 py-0.5 rounded text-cyan-400">simulationEngine.ts</code> to calculate <code className="text-white/50">getKMeansSectors()</code>. The data is passed to <code className="bg-black/50 px-1 py-0.5 rounded text-cyan-400">Dashboard.tsx</code> to render distinct operational zones on the 2D Tactical Map.
      </div>

      <div className="rounded-lg bg-black/40 border border-white/10 overflow-hidden flex-shrink-0">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
          {sectors.map((s) => {
            const c = toSvg(s.centroid.lat, s.centroid.lng);
            return <circle key={s.id} cx={c.x} cy={c.y} r={28} fill={s.color} opacity={0.06} />;
          })}
          {sectors.map((s) => {
            const c = toSvg(s.centroid.lat, s.centroid.lng);
            return (
              <g key={`c-${s.id}`}>
                <circle cx={c.x} cy={c.y} r={6} fill="none" stroke={s.color} strokeWidth={1.5} strokeDasharray="3 2" />
                <circle cx={c.x} cy={c.y} r={2} fill={s.color} opacity={0.8} />
              </g>
            );
          })}
          {units.map((u) => {
            const p = toSvg(u.lat, u.lng);
            const cluster = assignmentMap.get(u.id);
            const color = cluster?.color ?? "#ffffff";
            return (
              <g key={u.id}>
                <circle cx={p.x} cy={p.y} r={4} fill={color} opacity={0.9} />
                <text x={p.x + 5} y={p.y + 3} fontSize={5} fill="rgba(255,255,255,0.5)">{u.id.split("-")[0]}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="text-[9px] text-white/30 leading-relaxed p-2 bg-white/5 rounded text-center font-mono">
        <strong className="text-white/50">Core Equation:</strong> μ_k = argmin‖x−μ‖²
      </div>
    </div>
  );
}

// Priority Queue Visualization
function PriorityQueueViz({ riskIndicators }: { riskIndicators: RiskIndicator[] }) {
  const sorted = [...riskIndicators].sort((a, b) => b.riskScore - a.riskScore);

  const getPriorityLabel = (score: number) => {
    if (score >= 70) return { label: "CRITICAL", color: "#ef4444", bg: "rgba(239,68,68,0.15)" };
    if (score >= 40) return { label: "HIGH", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" };
    if (score >= 20) return { label: "MEDIUM", color: "#fbbf24", bg: "rgba(251,191,36,0.1)" };
    return { label: "LOW", color: "#4ade80", bg: "rgba(74,222,128,0.1)" };
  };

  const heapNodes = sorted.slice(0, 7);
  const W = 260, H = 90;
  const nodePositions = [
    { x: W/2, y: 14 },
    { x: W/4, y: 42 },
    { x: 3*W/4, y: 42 },
    { x: W/8, y: 72 },
    { x: 3*W/8, y: 72 },
    { x: 5*W/8, y: 72 },
    { x: 7*W/8, y: 72 },
  ];

  return (
    <div className="space-y-3 h-full overflow-y-auto pr-1 custom-scrollbar">
      <div className="text-[10px] text-white/60 leading-relaxed bg-cyan-950/20 p-2 rounded-lg border border-cyan-500/20">
        <strong className="text-cyan-400 uppercase tracking-widest text-[9px] block mb-1">Executive Summary</strong>
        A sophisticated data structure that ranks tactical alerts by risk severity. By maintaining a heap property, the system guarantees that the "Highest Threat" is always at the root of the queue, ensuring zero-latency awareness of critical battlefield events.
      </div>

      <div className="text-[10px] text-white/60 leading-relaxed p-2 bg-white/5 rounded border border-white/5">
        <strong className="text-white/80 uppercase tracking-widest text-[9px] block mb-1">How It Works</strong>
        Unlike a standard array where finding the highest threat requires scanning every item (O(N)), a <strong>Max-Heap Priority Queue</strong> structures data as a binary tree. When a new threat is detected, it is added to the bottom and "bubbles up" until it is smaller than its parent. The root node is always the highest priority threat, accessible instantly in O(1) time.
      </div>

      <div className="text-[10px] text-cyan-200/60 leading-relaxed p-2 bg-cyan-950/30 rounded border border-cyan-500/10">
        <strong className="text-cyan-500 uppercase tracking-widest text-[9px] block mb-1">Implementation Path</strong>
        <code className="bg-black/50 px-1 py-0.5 rounded text-cyan-400">client/lib/priorityQueue.ts</code><br/>
        Utilized in <code className="bg-black/50 px-1 py-0.5 rounded text-cyan-400">simulationEngine.ts</code> within the <code className="text-white/50">TacticalQueue</code> class. Every incoming risk event is pushed into the queue, ensuring the Dashboard always renders the most critical threats first.
      </div>

      <div className="rounded-lg bg-black/40 border border-white/10 overflow-hidden flex-shrink-0">
        <div className="text-[8px] text-white/30 uppercase text-center pt-1.5 pb-0">Heap Tree (root = highest priority)</div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
          {[1,2].map((i) => {
            const parent = nodePositions[0];
            const child = nodePositions[i];
            return <line key={i} x1={parent.x} y1={parent.y} x2={child.x} y2={child.y} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />;
          })}
          {[3,4].map((i) => {
            const parent = nodePositions[1];
            const child = nodePositions[i];
            return <line key={i} x1={parent.x} y1={parent.y} x2={child.x} y2={child.y} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />;
          })}
          {[5,6].map((i) => {
            const parent = nodePositions[2];
            const child = nodePositions[i];
            return <line key={i} x1={parent.x} y1={parent.y} x2={child.x} y2={child.y} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />;
          })}
          {heapNodes.map((node, i) => {
            const pos = nodePositions[i];
            const { color } = getPriorityLabel(node.riskScore);
            return (
              <g key={node.unitId}>
                <circle cx={pos.x} cy={pos.y} r={i === 0 ? 10 : 8} fill={color} opacity={i === 0 ? 0.9 : 0.5} />
                <text x={pos.x} y={pos.y + 3} textAnchor="middle" fontSize={i === 0 ? 7 : 6} fontWeight="bold" fill="white">
                  {Math.round(node.riskScore)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="text-[9px] text-white/30 leading-relaxed p-2 bg-white/5 rounded text-center font-mono">
        <strong className="text-white/50">Property:</strong> Parent node ≥ Children. O(1) root access.
      </div>
    </div>
  );
}

// A* Pathfinding Visualization
function AStarViz({ selectedUnit, units }: { selectedUnit?: string | null; units: Unit[] }) {
  const unit = selectedUnit ? units.find((u) => u.id === selectedUnit) : units[0];
  const targetUnit = units.find((u) => u.id !== unit?.id);

  if (!unit || !targetUnit) return <div className="text-white/30 text-xs">Need at least 2 units</div>;

  const distanceKm = Math.sqrt(
    Math.pow((unit.lat - targetUnit.lat) * 111, 2) +
    Math.pow((unit.lng - targetUnit.lng) * 111, 2)
  );
  const nodesExplored = Math.round(distanceKm * 180 + unit.vulnerability * 3);
  const pathCost = distanceKm * (1 + unit.vulnerability / 100);
  const riskZonesAvoided = Math.floor(unit.vulnerability / 30);

  const COLS = 14, ROWS = 8;
  const W = 260, H = 90;
  const cellW = W / COLS, cellH = H / ROWS;

  const startCol = 1, startRow = Math.floor(ROWS / 2);
  const endCol = COLS - 2, endRow = Math.floor(ROWS / 2);

  const path = [
    { r: startRow, c: startCol },
    { r: startRow, c: startCol + 2 },
    { r: startRow - 1, c: startCol + 3 },
    { r: startRow - 1, c: startCol + 5 },
    { r: startRow, c: startCol + 6 },
    { r: startRow, c: startCol + 8 },
    { r: startRow, c: endCol },
  ];

  const riskCells = [
    { r: startRow, c: startCol + 4 },
    { r: startRow + 1, c: startCol + 4 },
    { r: startRow - 1, c: startCol + 4 },
  ];

  const exploredCells: { r: number; c: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 2; c < COLS - 1; c++) {
      if (Math.abs(r - startRow) <= 2 && c <= endCol) {
        exploredCells.push({ r, c });
      }
    }
  }

  const pathSet = new Set(path.map((p) => `${p.r},${p.c}`));
  const riskSet = new Set(riskCells.map((p) => `${p.r},${p.c}`));

  return (
    <div className="space-y-3 h-full overflow-y-auto pr-1 custom-scrollbar">
      <div className="text-[10px] text-white/60 leading-relaxed bg-cyan-950/20 p-2 rounded-lg border border-cyan-500/20">
        <strong className="text-cyan-400 uppercase tracking-widest text-[9px] block mb-1">Executive Summary</strong>
        An advanced navigation algorithm that computes the optimal route between two points. It combines actual distance with a heuristic to bypass "Risk Zones" (red areas), providing units with a path that balances speed with operational safety.
      </div>

      <div className="text-[10px] text-white/60 leading-relaxed p-2 bg-white/5 rounded border border-white/5">
        <strong className="text-white/80 uppercase tracking-widest text-[9px] block mb-1">How It Works</strong>
        A* evaluates grid nodes using the formula <code>f(n) = g(n) + h(n)</code>. <br/>
        • <strong>g(n):</strong> The exact cost from the start to the current node.<br/>
        • <strong>h(n):</strong> The estimated distance to the target (Heuristic).<br/>
        By artificially inflating the <code>g(n)</code> cost when a node lies inside a known threat zone, the algorithm naturally "flows" around danger, finding the safest optimal route without exhaustive mapping.
      </div>

      <div className="text-[10px] text-cyan-200/60 leading-relaxed p-2 bg-cyan-950/30 rounded border border-cyan-500/10">
        <strong className="text-cyan-500 uppercase tracking-widest text-[9px] block mb-1">Implementation Path</strong>
        <code className="bg-black/50 px-1 py-0.5 rounded text-cyan-400">client/lib/astar.ts</code><br/>
        Utilized in <code className="bg-black/50 px-1 py-0.5 rounded text-cyan-400">simulationEngine.ts</code> to calculate <code className="text-white/50">getDecisionRecommendations()</code>. When a unit is trapped or needs extraction, A* computes the safest vector and outputs it to the Recommendations feed.
      </div>

      <div className="rounded-lg bg-black/40 border border-white/10 overflow-hidden flex-shrink-0">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
          {exploredCells.map(({ r, c }) => {
            if (pathSet.has(`${r},${c}`) || riskSet.has(`${r},${c}`)) return null;
            return (
              <rect key={`e-${r}-${c}`}
                x={c * cellW + 0.5} y={r * cellH + 0.5}
                width={cellW - 1} height={cellH - 1}
                fill="rgba(34,211,238,0.06)" rx={1}
              />
            );
          })}
          {riskCells.map(({ r, c }) => (
            <rect key={`risk-${r}-${c}`}
              x={c * cellW + 0.5} y={r * cellH + 0.5}
              width={cellW - 1} height={cellH - 1}
              fill="rgba(239,68,68,0.25)" rx={1}
            />
          ))}
          {path.map(({ r, c }) => (
            <rect key={`p-${r}-${c}`}
              x={c * cellW + 0.5} y={r * cellH + 0.5}
              width={cellW - 1} height={cellH - 1}
              fill="rgba(34,211,238,0.35)" rx={1}
            />
          ))}
          <polyline
            points={path.map(({ r, c }) => `${c * cellW + cellW/2},${r * cellH + cellH/2}`).join(" ")}
            fill="none" stroke="#22d3ee" strokeWidth={1.5} strokeLinejoin="round"
          />
          <circle cx={startCol * cellW + cellW/2} cy={startRow * cellH + cellH/2} r={4} fill="#22d3ee" />
          <circle cx={endCol * cellW + cellW/2} cy={endRow * cellH + cellH/2} r={4} fill="#4ade80" />
          <text x={(startCol + 4) * cellW + cellW/2} y={(startRow + 2) * cellH} textAnchor="middle" fontSize={5} fill="#ef4444" opacity={0.8}>RISK</text>
        </svg>
        <div className="flex gap-3 px-2 pb-1.5 text-[8px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-cyan-500/40 inline-block" />Path</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500/40 inline-block" />Risk Zone</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-cyan-500/10 inline-block" />Explored</span>
        </div>
      </div>

      <div className="text-[9px] text-white/30 p-2 bg-white/5 rounded text-center font-mono">
        <strong className="text-white/50">Core Equation:</strong> f(n) = g(n) + h(n)
      </div>
    </div>
  );
}
