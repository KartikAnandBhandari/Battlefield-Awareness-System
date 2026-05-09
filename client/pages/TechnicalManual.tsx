import React from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  Cpu, 
  GitBranch, 
  Layers, 
  Route, 
  ChevronRight, 
  ExternalLink,
  BookOpen,
  Zap,
  Lock,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";

interface FormulaTerm {
  symbol: string;
  label: string;
  description: string;
}

const AlgorithmSection = ({ 
  title, 
  icon: Icon, 
  tag, 
  description, 
  math, 
  logicPoints, 
  formulaTerms,
  formulaBasis,
  visualContent 
}: {
  title: string;
  icon: any;
  tag: string;
  description: string;
  math: string;
  logicPoints: string[];
  formulaTerms: FormulaTerm[];
  formulaBasis: string;
  visualContent: React.ReactNode;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="py-16 border-b border-white/5 last:border-0"
  >
    <div className="grid lg:grid-cols-2 gap-12 items-start">
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Icon className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.3em]">{tag}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
          <p className="text-white/60 leading-relaxed text-lg">
            {description}
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-black/40 border border-white/10 rounded-xl p-6 font-mono">
            <div className="text-cyan-500/50 text-[10px] uppercase tracking-widest mb-4">Core Mathematical Logic</div>
            <div className="text-xl text-cyan-50 text-center py-6 border-y border-white/5 my-4 bg-white/[0.02]">
              {math}
            </div>
            
            {/* Formula Terms Explanation */}
            <div className="space-y-4 mt-6">
              <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Term Definitions</div>
              <div className="grid grid-cols-1 gap-3">
                {formulaTerms.map((t, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <span className="text-cyan-400 font-bold min-w-[30px]">{t.symbol}</span>
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-white/80 font-bold uppercase tracking-wide">{t.label}</div>
                      <div className="text-[9px] text-white/40 leading-relaxed">{t.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Mathematical Basis</div>
              <p className="text-[10px] text-cyan-500/60 italic leading-relaxed">
                {formulaBasis}
              </p>
            </div>
          </div>

          <div className="space-y-3 px-2">
            <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Operational Logic</div>
            {logicPoints.map((point, i) => (
              <div key={i} className="flex gap-3 text-xs text-white/40">
                <ChevronRight className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="lg:sticky lg:top-24 relative aspect-square rounded-2xl bg-gradient-to-br from-cyan-950/20 to-black border border-white/5 overflow-hidden flex items-center justify-center group shadow-2xl">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        {visualContent}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </div>
    </div>
  </motion.div>
);

export default function TechnicalManual() {
  return (
    <div className="min-h-screen bg-[#05070a] text-foreground font-sans selection:bg-cyan-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-black/60 backdrop-blur-md z-50 px-6">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Back to HQ</span>
          </Link>
          <div className="flex items-center gap-3">
            <Lock className="w-3 h-3 text-cyan-500/40" />
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Classified Terminal // TS-SCI</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6 relative border-b border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest"
          >
            <BookOpen className="w-3 h-3" />
            System Architecture Manual
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent"
          >
            Algorithms Used & <br/>Mathematical Foundations
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg max-w-2xl mx-auto"
          >
            Comprehensive technical breakdown of the mathematical models, probability frameworks, and optimization logic driving the battlefield intelligence engine.
          </motion.p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6">
        <AlgorithmSection 
          tag="State Estimation"
          title="Kalman Filtering v2.0"
          icon={Cpu}
          description="The Kalman Filter is the system's primary mechanism for noise reduction and trajectory prediction. It operates recursively to estimate the state of a moving unit, even when GPS data is jittery or intermittently lost."
          math="x̂ₖ = x̂ₖ⁻ + Kₖ(zₖ - Hx̂ₖ⁻)"
          formulaTerms={[
            { symbol: "x̂ₖ", label: "Updated State Estimate", description: "The final computed position after fusing the prediction and the measurement." },
            { symbol: "x̂ₖ⁻", label: "Predicted State", description: "The estimate of the current position based only on previous velocity and physics model." },
            { symbol: "Kₖ", label: "Kalman Gain", description: "The relative weight given to the new measurement vs. the internal model prediction." },
            { symbol: "zₖ", label: "Measurement", description: "The raw, noisy GPS coordinate received from the unit's hardware sensor." },
            { symbol: "H", label: "Observation Model", description: "A matrix that maps the true state space into the observed measurement space." }
          ]}
          formulaBasis="Based on Recursive Least Squares and Bayesian inference, the Kalman Filter assumes that the true state is a hidden variable that can be estimated by minimizing the mean squared error of noisy observations."
          logicPoints={[
            "Predict (A): Estimates current state x̂ₖ⁻ by applying the state transition matrix to the previous known state.",
            "Measurement (z): Injects noisy GPS coordinates into the recursive loop for correction.",
            "Kalman Gain (K): A dynamic coefficient that minimizes the estimated error covariance. K determines if we trust the model or the sensor.",
            "Innovation (z - Hx̂): The residual error between the predicted state and actual sensor measurement, used to correct the model."
          ]}
          visualContent={
            <div className="relative w-full h-full flex items-center justify-center p-8">
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <div className="w-64 h-64 border-2 border-cyan-500 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                <div className="w-96 h-96 border border-cyan-500/50 rounded-full animate-ping" style={{ animationDuration: '5s' }} />
              </div>
              <div className="flex flex-col items-center gap-4 relative z-10">
                <div className="flex gap-12">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-500 mb-2">GPS</div>
                    <div className="text-[8px] font-mono text-red-500/60 uppercase">Noisy Raw</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-500 mb-2 animate-pulse">KF</div>
                    <div className="text-[8px] font-mono text-cyan-500/60 uppercase">Recursive</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-500 mb-2">TRU</div>
                    <div className="text-[8px] font-mono text-green-500/60 uppercase">Filtered</div>
                  </div>
                </div>
                <div className="w-64 h-2 bg-white/5 rounded-full relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-cyan-500"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </div>
            </div>
          }
        />

        <AlgorithmSection 
          tag="Spatial Intelligence"
          title="K-Means++ Clustering"
          icon={GitBranch}
          description="Operational sectors are derived using the K-Means++ algorithm, which identifies natural groupings of friendly and hostile units to optimize command structure and logistics deployment."
          math="J = Σ ||xᵢ - μₖ||²"
          formulaTerms={[
            { symbol: "J", label: "Objective Function", description: "The 'Inertia' or total within-cluster sum of squared errors to be minimized." },
            { symbol: "xᵢ", label: "Data Point", description: "The geographical coordinate of an individual unit on the battlefield." },
            { symbol: "μₖ", label: "Cluster Centroid", description: "The geometric center (mean position) of all units assigned to a specific sector." },
            { symbol: "||.||²", label: "L2 Norm", description: "The squared Euclidean distance between a unit and its assigned sector center." }
          ]}
          formulaBasis="Rooted in Vector Quantization, the basis of K-Means is to partition observations into Voronoi cells, ensuring that each unit is commanded by the nearest possible local HQ (centroid)."
          logicPoints={[
            "++ Initialization: Computes D(x)² distance for every point x to the nearest center. New centers are chosen with probability P(x) ∝ D(x)².",
            "Expectation (E): Assigns each unit to the nearest centroid cluster based on the L2 norm (Euclidean distance).",
            "Maximization (M): Updates centroid positions by calculating the arithmetic mean (μ) of all assigned unit coordinates.",
            "Convergence: The process repeats until the Within-Cluster Sum of Squares (WCSS) reaches a minimum threshold."
          ]}
          visualContent={
            <div className="w-full h-full grid grid-cols-3 gap-4 p-12 relative">
              {[0, 1, 2].map(i => (
                <div key={i} className="relative aspect-square rounded-full border border-white/5 flex items-center justify-center">
                  <motion.div 
                    className="absolute inset-0 rounded-full bg-cyan-500/5 border border-cyan-500/20"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                  />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
                </div>
              ))}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg className="w-full h-full opacity-20">
                  <motion.circle cx="50%" cy="50%" r="40" stroke="cyan" strokeWidth="1" fill="none" strokeDasharray="5 5" animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} />
                </svg>
              </div>
            </div>
          }
        />

        <AlgorithmSection 
          tag="Task Prioritization"
          title="Binary Heap Min-Priority Queue"
          icon={Layers}
          description="The system's alert engine utilizes a Binary Heap data structure to ensure that the most critical threats are always handled first with O(1) retrieval time."
          math="P(parent) ≤ P(child)"
          formulaTerms={[
            { symbol: "P", label: "Priority Value", description: "The numerical risk score calculated for a specific battlefield alert." },
            { symbol: "parent", label: "Parent Node", description: "A node in the binary tree that resides exactly one level above its children." },
            { symbol: "child", label: "Child Node", description: "The nodes branching from a parent; in a Min-Heap, they must have a higher or equal P value." }
          ]}
          formulaBasis="The heap structure is based on the Complete Binary Tree property, allowing for the highest-priority item to be maintained at the root (index 0) of an array for instantaneous access."
          logicPoints={[
            "Binary Heap Property: Ensures for every node i, parent(i) ≤ child(i) for Min-Heaps (Risk Priority).",
            "Sift-Up (Heapify): When a new alert is inserted at index n, it is compared with its parent at index floor((n-1)/2) and swapped if necessary.",
            "Sift-Down: When the root (highest priority) is removed, the last element is moved to the root and bubbled down to maintain heap order.",
            "Complexity: Guaranteed O(1) access to the maximum risk alert, with O(log N) maintenance for additions."
          ]}
          visualContent={
            <div className="relative w-full h-full flex flex-col items-center justify-center p-8 gap-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]">01</div>
              </div>
              <div className="flex gap-12">
                <div className="w-6 h-6 rounded-full bg-white/20 border border-white/10 flex items-center justify-center text-[8px] font-bold">02</div>
                <div className="w-6 h-6 rounded-full bg-white/20 border border-white/10 flex items-center justify-center text-[8px] font-bold">03</div>
              </div>
              <div className="flex gap-6">
                {[4,5,6,7].map(n => (
                  <div key={n} className="w-4 h-4 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-[6px]">{n}</div>
                ))}
              </div>
              <motion.div 
                className="absolute top-1/4 w-[2px] h-32 bg-gradient-to-b from-red-500 to-transparent"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          }
        />

        <AlgorithmSection 
          tag="Path Optimization"
          title="A* Navigation Algorithm"
          icon={Route}
          description="Computed unit vectors use A* pathfinding with a dynamic cost function that inflates weights in risk-heavy sectors, ensuring units take the safest possible route."
          math="f(n) = g(n) + h(n)"
          formulaTerms={[
            { symbol: "f(n)", label: "Total Estimated Cost", description: "The total priority value assigned to node n; the lowest f(n) is explored first." },
            { symbol: "g(n)", label: "Path Cost", description: "The exact movement cost accumulated from the start node to the current node n." },
            { symbol: "h(n)", label: "Heuristic Cost", description: "The estimated remaining distance to the goal (using Euclidean/Manhattan distance)." }
          ]}
          formulaBasis="A* is an extension of Dijkstra's algorithm that uses heuristics to focus the search. Its basis is the use of an 'admissible' heuristic that never overestimates the cost, guaranteeing an optimal path."
          logicPoints={[
            "G-Score: Represents the exact cost of the path from the start node to the current node n.",
            "H-Score (Heuristic): An admissible estimate of the distance to the goal, ensuring the algorithm never overestimates cost.",
            "F-Score: The combined priority f(n) = g(n) + h(n). The node with the lowest F-Score is explored next.",
            "Risk Gradient: The G-Score is artificially inflated by adding the Risk Integral ΣR(z) for nodes inside danger circles."
          ]}
          visualContent={
            <div className="w-full h-full p-12">
              <div className="grid grid-cols-10 gap-1 h-full">
                {[...Array(60)].map((_, i) => {
                  const isPath = [12, 13, 23, 33, 43, 44, 45, 35, 25, 26, 27, 28].includes(i);
                  const isRisk = [24, 34, 44, 54, 14, 15, 16].includes(i);
                  return (
                    <div 
                      key={i} 
                      className={`rounded-sm transition-all duration-500 ${
                        isPath ? 'bg-cyan-500 shadow-[0_0_8px_#22d3ee]' : 
                        isRisk ? 'bg-red-500/20 border border-red-500/30' : 
                        'bg-white/5'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          }
        />

        <AlgorithmSection 
          tag="Decision Support"
          title="Probabilistic Strategic Forecasting"
          icon={Zap}
          description="Beyond real-time tracking, the system uses Probabilistic Modeling to predict the future viability of missions. By applying Bayesian inference to the current readiness states, the HQ can simulate outcome probabilities before any engagement begins."
          math="P(S) = (R_{avg} \cdot 0.75) - (V_{avg} \cdot 0.25)"
          formulaTerms={[
            { symbol: "P(S)", label: "Probability of Success", description: "The calculated likelihood of achieving mission objectives (0-100%)." },
            { symbol: "R_avg", label: "Fleet Average Readiness", description: "The arithmetic mean of all operational units (The 'Strength' variable)." },
            { symbol: "V_avg", label: "Fleet Vulnerability", description: "The inverse of readiness, representing exposure to risk (The 'Weakness' variable)." },
            { symbol: "0.75/0.25", label: "Bayesian Weights", description: "Static coefficients that prioritize internal capacity over external threats in the decision model." }
          ]}
          formulaBasis="This model uses Bayesian Weighting to fuse internal telemetry with environmental risk. It operates on the principle that readiness and vulnerability are not independent; they are covariant factors in a larger survival probability distribution."
          logicPoints={[
            "Bayesian Inference: Success is not binary; it is a weight-adjusted distribution where R_avg acts as the primary prior and V_avg as the likelihood penalty.",
            "The Law of Complements: Vulnerability (V) is mathematically defined as 100 - R. This ensures that every drop in readiness increases the risk profile exponentially in complex environments.",
            "Outcome Bias: The 0.75/0.25 split reflects a 'Proactive Tactical Bias', assuming that a superior readiness level can mitigate some degree of environmental vulnerability.",
            "Entropy Management: The system treats 'Noise' (sensor jitter) as a probabilistic variable. If K (Kalman Gain) is low, the P(S) calculation adds a confidence interval penalty.",
            "Forecasting Horizon: These probabilities are recalculated every 2000ms, providing a dynamic 'Prediction Stream' that alerts commanders to mission failure before it occurs."
          ]}
          visualContent={
            <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-4 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-xl border border-white/5">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/10 pb-2 w-full text-center">Outcome Probability Distribution</div>
              <div className="flex items-end gap-1 h-32 w-full px-4">
                {[20, 35, 55, 80, 100, 85, 60, 40, 25, 15].map((h, i) => (
                  <div key={i} className="flex-1 bg-cyan-500/20 border-t border-cyan-500/40 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="flex justify-between w-full text-[8px] font-mono text-cyan-500/40">
                <span>0% (FAILURE)</span>
                <span>50% (NOMINAL)</span>
                <span>100% (SUCCESS)</span>
              </div>
              <div className="mt-4 p-3 bg-black/40 rounded border border-white/5 w-full text-center">
                <div className="text-[9px] text-white/80 font-bold mb-1 uppercase">Predictive Decision Loop</div>
                <div className="text-[8px] text-white/40 italic">"Probabilistic models allow the system to see the mission as a wave of possibilities rather than a static state."</div>
              </div>
            </div>
          }
        />

        <AlgorithmSection 
          tag="Operational Readiness"
          title="Status & Resource Logic"
          icon={Shield}
          description="The system derives real-time operational status by evaluating composite resource levels. This model ensures that unit health is not just a single percentage, but a balanced measure of combat effectiveness."
          math="R = (H + F + A) / 3"
          formulaTerms={[
            { symbol: "R", label: "Readiness Score", description: "The composite arithmetic mean of a unit's core resources." },
            { symbol: "H", label: "Health / Integrity", description: "The structural and personnel vitality of the unit (0-100)." },
            { symbol: "F", label: "Fuel / Energy", description: "The propulsion and power capability remaining (0-100)." },
            { symbol: "A", label: "Ammunition / Payload", description: "The offensive capacity and ordnance availability (0-100)." }
          ]}
          formulaBasis="Based on Multi-Attribute Utility Theory (MAUT), this logic weights multiple survival factors equally to provide a single 'Operational Status' that triggers command-level warnings."
          logicPoints={[
            "Active (≥66%): Unit is combat-ready and fully mission-capable with minimal resource degradation.",
            "Warning (≥33%): Readiness has dropped below optimal levels. Triggers resupply recommendations.",
            "Critical (<33%): Unit is functionally compromised and requires immediate withdrawal or emergency support.",
            "Low Resource Bias: Specific alerts (↓) are triggered if Fuel < 40% or Ammo < 30%, regardless of overall health.",
            "Attrition Basis: Values decrease per tick based on Unit Type (e.g., Air Wing drains Fuel at 2.0x vs Infantry 0.8x)."
          ]}
          visualContent={
            <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-4">
              <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest border-b border-white/10 pb-2 w-full text-center">Resource Attrition Model (Drain Rates)</div>
              <div className="grid grid-cols-4 gap-2 w-full text-[8px] font-mono">
                <div className="text-white/20">TYPE</div><div className="text-white/20">FUEL</div><div className="text-white/20">AMMO</div><div className="text-white/20">HLTH</div>
                <div className="text-cyan-400">AIR</div><div className="text-white/60">2.0</div><div className="text-white/60">0.3</div><div className="text-white/60">0.2</div>
                <div className="text-cyan-400">ARMOR</div><div className="text-white/60">1.5</div><div className="text-white/60">0.3</div><div className="text-white/60">0.2</div>
                <div className="text-cyan-400">INF</div><div className="text-white/60">0.8</div><div className="text-white/60">1.0</div><div className="text-white/60">0.5</div>
                <div className="text-cyan-400">LOG</div><div className="text-white/60">0.8</div><div className="text-white/60">0.1</div><div className="text-white/60">0.2</div>
              </div>
              <div className="mt-4 p-3 bg-white/5 rounded border border-white/10 w-full">
                <div className="text-[9px] text-white/60 leading-relaxed italic">
                  "The attrition model ensures that unit readiness is a living variable, directly tied to the unit's tactical role and movement profile."
                </div>
              </div>
            </div>
          }
        />
      </main>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 mt-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="flex items-center justify-center gap-6">
            <Shield className="w-8 h-8 text-cyan-500/40" />
            <div className="h-8 w-[1px] bg-white/10" />
            <Zap className="w-8 h-8 text-amber-500/40" />
          </div>
          <p className="text-white/20 text-xs font-mono uppercase tracking-[0.4em]">
            Military Grade Intelligence // Secure Uplink 882.11
          </p>
          <div className="flex justify-center gap-8">
            <Link to="/dashboard" className="px-8 py-3 bg-white text-black rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white/90 transition-colors">
              Access Operational HQ
            </Link>
            <Link to="/about" className="px-8 py-3 border border-white/10 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-colors">
              About Project
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
