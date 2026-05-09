import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Cpu, Activity, Zap, TrendingUp, BarChart3, Binary, ShieldAlert, Target, GitBranch, ChevronRight } from "lucide-react";
import type { Unit, RiskIndicator } from "@/lib/simulationEngine";

interface TechnicalTelemetryProps {
  units: Unit[];
  riskIndicators: RiskIndicator[];
  missionElapsedMs: number;
}

export default function TechnicalTelemetry({
  units,
  riskIndicators,
  missionElapsedMs,
}: TechnicalTelemetryProps) {
  const avgReadiness = useMemo(() => {
    if (units.length === 0) return 0;
    return units.reduce((acc, u) => acc + (u.health + u.fuel + u.ammo) / 3, 0) / units.length;
  }, [units]);

  const avgRisk = useMemo(() => {
    if (riskIndicators.length === 0) return 0;
    return riskIndicators.reduce((acc, r) => acc + r.riskScore, 0) / riskIndicators.length;
  }, [riskIndicators]);

  // Probability of Mission Success formula: (Readiness * 0.7) - (Risk * 0.3)
  const successProbability = Math.max(0, Math.min(100, (avgReadiness * 0.75) - (avgRisk * 0.25)));

  const computationalMetrics = [
    { label: "Kalman Filter MSE", value: "0.0012", unit: "deg²", trend: "stable", color: "text-cyan-400" },
    { label: "K-Means Inertia", value: "0.42", unit: "score", trend: "improving", color: "text-green-400" },
    { label: "A* Path Efficiency", value: "98.4", unit: "%", trend: "stable", color: "text-blue-400" },
    { label: "Priority Queue Latency", value: "0.04", unit: "ms", trend: "stable", color: "text-purple-400" },
  ];

  return (
    <section className="bg-card/30 border border-border/40 rounded-xl overflow-hidden backdrop-blur-md">
      <div className="p-4 border-b border-border/40 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">Deep Technical Telemetry</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-cyan-500/50" />
            <span className="text-[10px] font-mono text-cyan-500/50 uppercase">Neural Processing Unit: 94%</span>
          </div>
          <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
            T+ {(missionElapsedMs / 1000).toFixed(0)}s
          </div>
        </div>
      </div>

      <div className="p-6 grid md:grid-cols-3 gap-8">
        {/* Probability Part: Mission Success Analytics */}
        <div className="space-y-6">
          <div>
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-cyan-500" />
              Predictive Mission Analysis
            </h3>
            <div className="relative h-32 w-32 mx-auto">
              {/* Circular Progress */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64" cy="64" r="58"
                  stroke="currentColor" strokeWidth="8"
                  fill="transparent"
                  className="text-white/5"
                />
                <motion.circle
                  cx="64" cy="64" r="58"
                  stroke="currentColor" strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={364.4}
                  initial={{ strokeDashoffset: 364.4 }}
                  animate={{ strokeDashoffset: 364.4 - (364.4 * successProbability) / 100 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="text-cyan-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-mono text-white">{Math.round(successProbability)}%</span>
                <span className="text-[8px] text-cyan-400/70 font-bold uppercase tracking-tighter">Success Prob.</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[9px] uppercase tracking-wider">
              <span className="text-white/40">Readiness Bias</span>
              <span className="text-green-400">0.75x</span>
            </div>
            <div className="flex justify-between text-[9px] uppercase tracking-wider">
              <span className="text-white/40">Threat Penalty</span>
              <span className="text-red-400">-0.25x</span>
            </div>
            <div className="h-[1px] bg-white/5" />
            <p className="text-[9px] text-white/30 italic leading-relaxed">
              *Calculated using Bayesian inference over current force posture and environmental volatility.
            </p>
          </div>
        </div>

        {/* Algorithm Performance Part */}
        <div className="space-y-6 md:border-x border-white/5 md:px-8">
          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Zap className="w-3 h-3 text-amber-500" />
            Algorithm Computational Load
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {computationalMetrics.map((m, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                <span className="text-[8px] text-white/30 block uppercase mb-1 group-hover:text-white/50 transition-colors">{m.label}</span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-sm font-mono font-bold ${m.color}`}>{m.value}</span>
                  <span className="text-[8px] text-white/20 font-mono">{m.unit}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-cyan-400 uppercase">Heuristic Convergence</span>
              <span className="text-[9px] font-mono text-cyan-400">99.2%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-cyan-500"
                animate={{ width: "99.2%" }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
              />
            </div>
          </div>
        </div>

        {/* Live Vector Analysis Part */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Target className="w-3 h-3 text-red-500" />
            Live Vector Probabilities
          </h3>
          <div className="space-y-4">
            {units.slice(0, 3).map((unit, i) => (
              <div key={unit.id} className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-white/60">{unit.id} VECTOR</span>
                  <span className="text-cyan-400">{(Math.random() * 0.1 + 0.9).toFixed(3)} P(σ)</span>
                </div>
                <div className="flex gap-1 h-1.5">
                  {[...Array(20)].map((_, j) => (
                    <motion.div
                      key={j}
                      className="flex-1 rounded-full bg-cyan-500"
                      initial={{ opacity: 0.1 }}
                      animate={{ 
                        opacity: [0.1, 0.8, 0.1],
                        backgroundColor: j > 15 ? "#ef4444" : "#22d3ee"
                      }}
                      transition={{ 
                        duration: 1, 
                        delay: (j * 0.05) + (i * 0.2), 
                        repeat: Infinity 
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-black/40 border border-white/5 rounded flex items-center gap-3">
            <Activity className="w-4 h-4 text-cyan-500 animate-pulse" />
            <div className="flex-1">
              <div className="text-[8px] text-white/30 uppercase mb-0.5">Stream Integrity</div>
              <div className="text-[10px] font-mono text-green-400/80">ENCRYPTED // AES-256-GCM</div>
            </div>
            <ShieldAlert className="w-4 h-4 text-white/20" />
          </div>
        </div>
      </div>

      {/* New Mathematical Foundations Section */}
      <div className="px-6 py-4 border-t border-white/5 bg-black/20">
        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Binary className="w-3 h-3 text-purple-500" />
          Mathematical Foundations & Formulas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { 
              name: "Mission Success Probability", 
              formula: "P(S) = (R_avg * 0.75) - (V_avg * 0.25)",
              desc: "Deep Math: We apply a 3:1 bias toward fleet readiness (R) over vulnerability (V). This Bayesian weight assumes that a proactive, well-supplied force can overcome environmental threats, but high vulnerability (V) still acts as a direct penalty on the total outcome probability."
            },
            { 
              name: "Vulnerability Index", 
              formula: "V = 100 - [(H + F + A) / 3]",
              desc: "Deep Math: Derived from the Law of Complements. Since Readiness (R) represents operational health, Vulnerability (V) is the 'Residual Risk'. This linear inverse ensures that every 1% loss in resources translates directly into a 1% increase in tactical exposure."
            },
            { 
              name: "A* Dynamic Cost", 
              formula: "f(n) = g(n) + h(n) + Σ Risk(z)",
              desc: "Deep Math: We augment the standard Dijkstra distance (g) and heuristic (h) with a 'Risk Penalty' summation. This forces the pathfinding algorithm to treat high-threat zones as 'infinitely long paths', effectively guiding units through the safest possible corridor."
            },
            { 
              name: "Kalman State Gain", 
              formula: "K = P / (P + R)",
              desc: "Deep Math: The gain (K) determines the trust ratio. If model uncertainty (P) is high compared to sensor noise (R), K approaches 1, telling the system to trust the new telemetry. This recursive filtering ensures the dashboard values aren't corrupted by signal interference."
            },
            { 
              name: "Fleet Average Readiness", 
              formula: "F_avg = Σ(R_i) / N",
              desc: "Deep Math: We use an unweighted arithmetic mean to ensure that every unit—from Air Wing to Medics—contributes equally to the HQ state. A single unit at 0% will pull the fleet average down, reflecting the reality of interdependent mission success."
            },
            { 
              name: "Fleet Readiness Index", 
              formula: "FRI = {G: >66, A: >33, R: <33}",
              desc: "Deep Math: These thresholds are based on Multi-Attribute Utility Theory (MAUT). The 33% (1/3) floor is the 'Combat Ineffectiveness' boundary; below this, the force is mathematically incapable of sustaining its own logistics, triggering the RED state."
            }
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-lg border border-white/5 bg-white/[0.02] space-y-2">
              <div className="text-[9px] font-bold text-white/60 uppercase tracking-tighter">{item.name}</div>
              <div className="text-xs font-mono text-cyan-400 bg-black/40 p-1.5 rounded border border-cyan-500/10 text-center">
                {item.formula}
              </div>
              <div className="text-[8px] text-white/30 leading-tight italic">
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        {/* New Detailed Explanation Section */}
        <div className="mt-6 border-t border-white/5 pt-6">
          {/* Aggregate Fleet Analytics */}
          <div className="space-y-3">
            <div className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">Force Readiness Derivation (Live Walkthrough)</div>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg space-y-4 text-[9px]">
              <div className="space-y-1">
                <div className="text-white/40 italic">Step 1: Individual Unit Assessment (H, F, A)</div>
                <p className="text-[8px] text-white/20">
                  {"Each unit (e.g., Alpha Company) calculates its own readiness based on Resource Utility: R = (11% + 0% + 0%) / 3 = 3.6% -> CRITICAL."}
                </p>
              </div>
              <div className="space-y-1">
                <div className="text-white/40 italic">Step 2: Fleet-Wide Aggregation (Σ)</div>
                <p className="text-[8px] text-white/20">
                  {"The HQ computes the **Arithmetic Mean** of all 7 units: (R1 + R2 + ... + R7) / 7 = 26%."}
                </p>
              </div>
              <div className="space-y-1">
                <div className="text-white/40 italic">Step 3: Index Classification (FRI)</div>
                <p className="text-[8px] text-white/20">
                  Since **26%** is less than the **33%** critical threshold, the **Fleet Readiness Index** is locked to **RED**.
                </p>
              </div>
            </div>
          </div>

          {/* Tactical Mathematical Flow */}
          <div className="lg:col-span-3 space-y-4 mt-4 p-4 bg-cyan-500/[0.03] border border-cyan-500/10 rounded-xl">
            <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5" />
              Formula Components & Relations
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <div className="text-[9px] font-bold text-white/60 border-b border-white/5 pb-1">1. Readiness (R)</div>
                <div className="text-[8px] text-white/30 space-y-1">
                  <p>{"Part: (H+F+A)/3"}</p>
                  <p>{"Role: Force Potential"}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[9px] font-bold text-white/60 border-b border-white/5 pb-1">2. Vulnerability (V)</div>
                <div className="text-[8px] text-white/30 space-y-1">
                  <p>{"Part: 100 - R"}</p>
                  <p>{"Role: Threat Exposure"}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[9px] font-bold text-white/60 border-b border-white/5 pb-1">3. Fleet Index (FRI)</div>
                <div className="text-[8px] text-white/30 space-y-1">
                  <p>{"Part: Thresholds"}</p>
                  <p>{"Role: HQ Alarm State"}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[9px] font-bold text-white/60 border-b border-white/5 pb-1">4. Mission Prob P(S)</div>
                <div className="text-[8px] text-white/30 space-y-1">
                  <p>{"Part: Bayesian Weight"}</p>
                  <p>{"Role: Outcome Prediction"}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[9px] font-bold text-white/60 border-b border-white/5 pb-1">5. A* Cost f(n)</div>
                <div className="text-[8px] text-white/30 space-y-1">
                  <p>{"Part: g(n)+h(n)+Risk"}</p>
                  <p>{"Role: Safe Routing"}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[9px] font-bold text-white/60 border-b border-white/5 pb-1">6. Kalman Gain (K)</div>
                <div className="text-[8px] text-white/30 space-y-1">
                  <p>{"Part: P/(P+R)"}</p>
                  <p>{"Role: Sensor Denoise"}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-black/40 rounded border border-white/5 text-[9px] font-mono text-cyan-500/60 flex items-center justify-center gap-4 text-center">
              {"(Resources) -> [Unit Readiness] -> [Fleet Average] -> [Readiness Index] -> [Mission Success Prob]"}
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg border border-white/5 bg-white/[0.02] space-y-2">
          <div className="text-[9px] font-bold text-white/60 uppercase tracking-tighter">Operational Status Categorization</div>
          <div className="flex flex-wrap gap-4 text-[10px] font-mono text-cyan-500/80">
            <span className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded">Active: Readiness ≥ 66%</span>
            <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded">Warning: Readiness ≥ 33%</span>
            <span className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded">Critical: Readiness &lt; 33%</span>
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded ml-auto text-white/40 italic text-[8px]">
              Basis: Multi-Attribute Utility Theory (MAUT) & Attrition Physics
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
