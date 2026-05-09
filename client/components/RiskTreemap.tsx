import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, TrendingUp, Users, Zap, ChevronRight, X } from "lucide-react";
import type { Unit, RiskIndicator } from "@/lib/simulationEngine";

interface RiskTreemapProps {
  units: Unit[];
  riskIndicators: RiskIndicator[];
  onUnitSelect?: (unitId: string) => void;
  selectedUnit?: string | null;
}

interface TreemapCell {
  unit: Unit;
  risk: RiskIndicator;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Squarified treemap layout algorithm
function squarify(
  items: { id: string; value: number }[],
  x: number,
  y: number,
  width: number,
  height: number
): { id: string; x: number; y: number; width: number; height: number }[] {
  if (items.length === 0) return [];

  const total = items.reduce((s, i) => s + i.value, 0);
  const result: { id: string; x: number; y: number; width: number; height: number }[] = [];

  let remaining = [...items];
  let cx = x, cy = y, cw = width, ch = height;

  while (remaining.length > 0) {
    const isHorizontal = cw >= ch;
    const stripSize = isHorizontal ? cw : ch;
    const stripTotal = remaining.reduce((s, i) => s + i.value, 0);

    // Find best row
    let row: typeof remaining = [];
    let rowTotal = 0;
    let bestRatio = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = [...row, remaining[i]];
      const candidateTotal = rowTotal + remaining[i].value;
      const stripWidth = (candidateTotal / stripTotal) * stripSize;

      let maxRatio = 0;
      for (const item of candidate) {
        const itemSize = (item.value / candidateTotal) * (isHorizontal ? ch : cw);
        const ratio = Math.max(stripWidth / itemSize, itemSize / stripWidth);
        maxRatio = Math.max(maxRatio, ratio);
      }

      if (maxRatio <= bestRatio) {
        bestRatio = maxRatio;
        row = candidate;
        rowTotal = candidateTotal;
      } else {
        break;
      }
    }

    // Layout the row
    const stripWidth = (rowTotal / stripTotal) * stripSize;
    let offset = 0;

    for (const item of row) {
      const itemFrac = item.value / rowTotal;
      if (isHorizontal) {
        result.push({
          id: item.id,
          x: cx,
          y: cy + offset,
          width: stripWidth,
          height: itemFrac * ch,
        });
        offset += itemFrac * ch;
      } else {
        result.push({
          id: item.id,
          x: cx + offset,
          y: cy,
          width: itemFrac * cw,
          height: stripWidth,
        });
        offset += itemFrac * cw;
      }
    }

    remaining = remaining.slice(row.length);
    if (isHorizontal) {
      cx += stripWidth;
      cw -= stripWidth;
    } else {
      cy += stripWidth;
      ch -= stripWidth;
    }
  }

  return result;
}

function getRiskColor(score: number): { bg: string; border: string; glow: string; label: string } {
  if (score >= 70) return {
    bg: "rgba(239,68,68,0.25)",
    border: "rgba(239,68,68,0.6)",
    glow: "rgba(239,68,68,0.3)",
    label: "CRITICAL",
  };
  if (score >= 40) return {
    bg: "rgba(245,158,11,0.2)",
    border: "rgba(245,158,11,0.5)",
    glow: "rgba(245,158,11,0.2)",
    label: "ELEVATED",
  };
  return {
    bg: "rgba(34,197,94,0.15)",
    border: "rgba(34,197,94,0.4)",
    glow: "rgba(34,197,94,0.15)",
    label: "NOMINAL",
  };
}

function getRiskTextColor(score: number): string {
  if (score >= 70) return "#f87171";
  if (score >= 40) return "#fbbf24";
  return "#4ade80";
}

const UNIT_TYPE_ICONS: Record<string, string> = {
  infantry: "⚔",
  armor: "🛡",
  air: "✈",
  logistics: "📦",
  recon: "👁",
  medic: "➕",
};

export default function RiskTreemap({ units, riskIndicators, onUnitSelect, selectedUnit }: RiskTreemapProps) {
  const [hoveredUnit, setHoveredUnit] = useState<string | null>(null);
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);

  const W = 320;
  const H = 340;
  const GAP = 3;

  const riskMap = useMemo(
    () => new Map(riskIndicators.map((r) => [r.unitId, r])),
    [riskIndicators]
  );

  // Sort by risk score descending so highest risk gets most prominent placement
  const sortedUnits = useMemo(
    () =>
      [...units].sort((a, b) => {
        const ra = riskMap.get(a.id)?.riskScore ?? 0;
        const rb = riskMap.get(b.id)?.riskScore ?? 0;
        return rb - ra;
      }),
    [units, riskMap]
  );

  const items = sortedUnits.map((u) => ({
    id: u.id,
    value: Math.max(u.personnel, 10), // size = personnel count
  }));

  const layout = useMemo(
    () => squarify(items, 0, 0, W, H),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [units.map((u) => u.id).join(","), W, H]
  );

  const cells: TreemapCell[] = layout.map((cell) => {
    const unit = units.find((u) => u.id === cell.id)!;
    const risk = riskMap.get(cell.id) ?? {
      unitId: cell.id,
      threatLevel: "low" as const,
      vulnerability: 0,
      riskScore: 0,
      factors: [],
    };
    return { unit, risk, ...cell };
  });

  // Summary stats
  const criticalCount = cells.filter((c) => c.risk.riskScore >= 70).length;
  const elevatedCount = cells.filter((c) => c.risk.riskScore >= 40 && c.risk.riskScore < 70).length;
  const nominalCount = cells.filter((c) => c.risk.riskScore < 40).length;
  const avgRisk = cells.length > 0
    ? Math.round(cells.reduce((s, c) => s + c.risk.riskScore, 0) / cells.length)
    : 0;

  const expandedCell = expandedUnit ? cells.find((c) => c.unit.id === expandedUnit) : null;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Legend + summary */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          {[
            { color: "#4ade80", label: "Nominal", count: nominalCount },
            { color: "#fbbf24", label: "Elevated", count: elevatedCount },
            { color: "#f87171", label: "Critical", count: criticalCount },
          ].map(({ color, label, count }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
              <span className="text-[9px] text-white/40 uppercase font-mono">{label}</span>
              <span className="text-[9px] font-bold font-mono" style={{ color }}>{count}</span>
            </div>
          ))}
        </div>
        <div className="text-[9px] font-mono text-white/30 uppercase">
          Box size = personnel
        </div>
      </div>

      {/* Treemap SVG */}
      <div className="relative flex-shrink-0">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full rounded-lg overflow-hidden"
          style={{ height: H }}
        >
          {cells.map((cell) => {
            const colors = getRiskColor(cell.risk.riskScore);
            const isHovered = hoveredUnit === cell.unit.id;
            const isSelected = selectedUnit === cell.unit.id;
            const isExpanded = expandedUnit === cell.unit.id;
            const textColor = getRiskTextColor(cell.risk.riskScore);
            const cellW = cell.width - GAP;
            const cellH = cell.height - GAP;
            const showLabel = cellW > 50 && cellH > 30;
            const showScore = cellW > 40 && cellH > 45;
            const showIcon = cellW > 30 && cellH > 25;

            return (
              <g
                key={cell.unit.id}
                transform={`translate(${cell.x + GAP / 2}, ${cell.y + GAP / 2})`}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredUnit(cell.unit.id)}
                onMouseLeave={() => setHoveredUnit(null)}
                onClick={() => {
                  setExpandedUnit(expandedUnit === cell.unit.id ? null : cell.unit.id);
                  onUnitSelect?.(cell.unit.id);
                }}
              >
                {/* Background */}
                <rect
                  width={cellW}
                  height={cellH}
                  rx={4}
                  fill={colors.bg}
                  stroke={isSelected || isExpanded ? textColor : colors.border}
                  strokeWidth={isSelected || isExpanded ? 1.5 : 0.8}
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 6px ${colors.glow})` : undefined,
                    transition: "all 0.15s ease",
                  }}
                />

                {/* Animated pulse for critical */}
                {cell.risk.riskScore >= 70 && (
                  <rect
                    width={cellW}
                    height={cellH}
                    rx={4}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth={1}
                    opacity={0.4}
                    style={{
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  />
                )}

                {/* Risk score bar at bottom */}
                <rect
                  x={2}
                  y={cellH - 4}
                  width={(cellW - 4) * (cell.risk.riskScore / 100)}
                  height={2}
                  rx={1}
                  fill={textColor}
                  opacity={0.7}
                />

                {/* Content */}
                {showIcon && (
                  <text
                    x={cellW / 2}
                    y={showLabel ? cellH / 2 - (showScore ? 8 : 4) : cellH / 2 + 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={showLabel ? (cellW > 80 ? 14 : 10) : 8}
                    opacity={0.6}
                  >
                    {UNIT_TYPE_ICONS[cell.unit.type] ?? "◆"}
                  </text>
                )}

                {showLabel && (
                  <text
                    x={cellW / 2}
                    y={showScore ? cellH / 2 + 2 : cellH / 2 + 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={cellW > 100 ? 9 : 7}
                    fontWeight="700"
                    fill="rgba(255,255,255,0.85)"
                    fontFamily="monospace"
                    letterSpacing="0.05em"
                  >
                    {cell.unit.id}
                  </text>
                )}

                {showScore && (
                  <text
                    x={cellW / 2}
                    y={cellH / 2 + 13}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={cellW > 80 ? 11 : 8}
                    fontWeight="800"
                    fill={textColor}
                    fontFamily="monospace"
                  >
                    {Math.round(cell.risk.riskScore)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        <AnimatePresence>
          {hoveredUnit && !expandedUnit && (() => {
            const cell = cells.find((c) => c.unit.id === hoveredUnit);
            if (!cell) return null;
            const colors = getRiskColor(cell.risk.riskScore);
            const textColor = getRiskTextColor(cell.risk.riskScore);
            return (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute bottom-2 left-2 right-2 p-3 rounded-lg border backdrop-blur-md z-20 pointer-events-none"
                style={{ background: "rgba(5,7,10,0.95)", borderColor: colors.border }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">{cell.unit.name}</span>
                  <span className="text-[10px] font-mono font-bold" style={{ color: textColor }}>
                    {colors.label} · {Math.round(cell.risk.riskScore)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[9px] font-mono">
                  <div>
                    <span className="text-white/30 block uppercase">Personnel</span>
                    <span className="text-white/80">{cell.unit.personnel}</span>
                  </div>
                  <div>
                    <span className="text-white/30 block uppercase">Health</span>
                    <span className="text-white/80">{Math.round(cell.unit.health)}%</span>
                  </div>
                  <div>
                    <span className="text-white/30 block uppercase">Threat</span>
                    <span className="text-white/80 capitalize">{cell.unit.threatLevel}</span>
                  </div>
                </div>
                {cell.risk.factors.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <span className="text-[8px] text-white/30 uppercase block mb-1">Top Factor</span>
                    <span className="text-[9px] text-white/60">{cell.risk.factors[0]}</span>
                  </div>
                )}
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* Expanded unit detail */}
      <AnimatePresence>
        {expandedCell && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="p-3 rounded-lg border"
              style={{
                background: "rgba(5,7,10,0.8)",
                borderColor: getRiskColor(expandedCell.risk.riskScore).border,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{UNIT_TYPE_ICONS[expandedCell.unit.type]}</span>
                  <div>
                    <span className="text-xs font-bold text-white block">{expandedCell.unit.name}</span>
                    <span
                      className="text-[9px] font-mono font-bold uppercase"
                      style={{ color: getRiskTextColor(expandedCell.risk.riskScore) }}
                    >
                      Risk Score: {Math.round(expandedCell.risk.riskScore)} · {getRiskColor(expandedCell.risk.riskScore).label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedUnit(null)}
                  className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { icon: <Users className="w-2.5 h-2.5" />, label: "Personnel", value: expandedCell.unit.personnel },
                  { icon: <Shield className="w-2.5 h-2.5" />, label: "Health", value: `${Math.round(expandedCell.unit.health)}%` },
                  { icon: <Zap className="w-2.5 h-2.5" />, label: "Ammo", value: `${Math.round(expandedCell.unit.ammo)}%` },
                  { icon: <TrendingUp className="w-2.5 h-2.5" />, label: "Fuel", value: `${Math.round(expandedCell.unit.fuel)}%` },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="bg-white/5 rounded p-1.5 text-center">
                    <div className="flex justify-center text-white/30 mb-0.5">{icon}</div>
                    <div className="text-[8px] text-white/30 uppercase">{label}</div>
                    <div className="text-[10px] font-mono font-bold text-white/80">{value}</div>
                  </div>
                ))}
              </div>

              {/* Risk factors */}
              {expandedCell.risk.factors.length > 0 ? (
                <div>
                  <span className="text-[8px] text-white/30 uppercase font-bold block mb-1.5">
                    Risk Factors ({expandedCell.risk.factors.length})
                  </span>
                  <div className="space-y-1">
                    {expandedCell.risk.factors.map((factor, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <ChevronRight className="w-2.5 h-2.5 flex-shrink-0" style={{ color: getRiskTextColor(expandedCell.risk.riskScore) }} />
                        <span className="text-[9px] text-white/60">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-[9px] text-white/30 text-center py-1">No active risk factors</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Force summary footer */}
      <div className="flex items-center justify-between px-1 mt-auto">
        <span className="text-[9px] text-white/30 uppercase font-mono">Force Avg Risk</span>
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${avgRisk}%`,
                background: avgRisk >= 70 ? "#ef4444" : avgRisk >= 40 ? "#f59e0b" : "#22c55e",
              }}
            />
          </div>
          <span
            className="text-[10px] font-mono font-bold"
            style={{ color: avgRisk >= 70 ? "#f87171" : avgRisk >= 40 ? "#fbbf24" : "#4ade80" }}
          >
            {avgRisk}
          </span>
        </div>
      </div>
    </div>
  );
}
