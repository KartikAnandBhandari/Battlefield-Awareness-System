import { useRef, Suspense } from "react";
import { Link } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import {
  ArrowRight, Map, AlertCircle, TrendingUp, Zap,
  Shield, Activity, BarChart2, BookOpen,
} from "lucide-react";

// ── 3-D Globe ────────────────────────────────────────────────

function GlobeWireframe() {
  const globeRef = useRef<THREE.Mesh>(null);
  const wireRef  = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (globeRef.current) globeRef.current.rotation.y += delta * 0.12;
    if (wireRef.current)  wireRef.current.rotation.y  += delta * 0.12;
  });
  return (
    <group>
      {/* Solid sphere with emissive ocean colour */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 48, 48]} />
        <meshPhongMaterial
          color="#0a1628"
          emissive="#0d2040"
          emissiveIntensity={0.6}
          transparent opacity={0.92}
        />
      </mesh>
      {/* Wireframe overlay */}
      <mesh ref={wireRef}>
        <sphereGeometry args={[2.02, 24, 24]} />
        <meshBasicMaterial color="#0ea5e9" wireframe transparent opacity={0.18} />
      </mesh>
      {/* Equatorial ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.25, 0.01, 8, 100]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.5} />
      </mesh>
      {/* Unit dots (7 positions near Amritsar) */}
      {[
        [0.55, 0.75, 1.7],   // ALPHA
        [0.6,  0.85, 1.68],  // BRAVO
        [0.5,  0.68, 1.72],  // CHARLIE
        [0.62, 0.9,  1.66],  // DELTA
        [0.52, 0.72, 1.71],  // ECHO
        [0.58, 0.8,  1.69],  // FOXTROT
        [0.48, 0.65, 1.73],  // GOLF
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color={i < 2 ? "#f87171" : i < 4 ? "#fbbf24" : "#4ade80"} />
        </mesh>
      ))}
    </group>
  );
}

function GlobeScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[8, 8, 8]} intensity={1.2} color="#60a5fa" />
      <pointLight position={[-8, -4, -4]} intensity={0.5} color="#06b6d4" />
      <Stars radius={60} depth={40} count={1200} factor={3} saturation={0} fade />
      <GlobeWireframe />
      <OrbitControls
        enableZoom={false} autoRotate={false}
        minPolarAngle={Math.PI * 0.3} maxPolarAngle={Math.PI * 0.7}
      />
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">SAWS</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/analytics" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Analytics
            </Link>
            <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              About
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero with 3D Globe */}
      <section className="relative overflow-hidden" style={{ minHeight: "92vh" }}>
        <div className="tactical-grid absolute inset-0 opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center py-16 sm:py-20">
          {/* Text */}
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-secondary/15 border border-secondary/40 rounded-full">
              <span className="text-secondary text-sm font-medium">
                🛰 Situational Awareness &amp; Decision Support
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
              Real-Time
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Battlefield Intelligence
              </span>
              Platform
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Cloud-based tactical command centre integrating <strong className="text-foreground">A* pathfinding</strong>,{" "}
              <strong className="text-foreground">K-Means clustering</strong>,{" "}
              <strong className="text-foreground">Kalman filtering</strong>, and{" "}
              <strong className="text-foreground">priority-queue triage</strong> into a live geospatial dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium gap-2 shadow-lg shadow-primary/20"
              >
                Launch Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-8 py-3 border border-border rounded-lg hover:bg-card/50 transition-colors font-medium"
              >
                <BookOpen className="w-4 h-4 mr-2" /> Project Report
              </Link>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-sm border-t border-b border-border py-5 mt-2">
              <div>
                <div className="text-green-400 font-bold text-xl">4</div>
                <div className="text-muted-foreground text-xs">Algorithms</div>
              </div>
              <div>
                <div className="text-green-400 font-bold text-xl">7</div>
                <div className="text-muted-foreground text-xs">Live Units</div>
              </div>
              <div>
                <div className="text-green-400 font-bold text-xl">&lt;100ms</div>
                <div className="text-muted-foreground text-xs">Alert Latency</div>
              </div>
            </div>
          </div>

          {/* 3D Globe */}
          <div className="h-[420px] lg:h-[520px] rounded-2xl overflow-hidden border border-border/50 bg-card/20 backdrop-blur">
            <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
              <Suspense fallback={null}>
                <GlobeScene />
              </Suspense>
            </Canvas>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="border-t border-border py-20 bg-card/20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Problem Statement</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Modern warfare generates massive volumes of sensor data. Without real-time processing,
              commanders make decisions on stale information — with fatal consequences.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "📍", title: "Noisy Positioning", desc: "GPS errors cause unit positions to drift by hundreds of metres, degrading operational picture accuracy." },
              { icon: "⚡", title: "Alert Overload", desc: "Hundreds of events flood command channels. Without triage, critical threats get buried under routine updates." },
              { icon: "🗺️", title: "Unoptimised Routes", desc: "Manual route planning ignores dynamic threat zones, exposing units to avoidable risk." },
            ].map((p) => (
              <div key={p.title} className="p-6 bg-card border border-border rounded-xl space-y-2">
                <div className="text-3xl">{p.icon}</div>
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="features" className="border-t border-border py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">How SAWS Works</h2>
            <p className="text-muted-foreground">Three-stage pipeline from raw sensor data to command decisions</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", label: "Sense", color: "text-primary border-primary/30 bg-primary/10", desc: "Drone, radar, thermal, and acoustic sensors stream raw noisy data to the cloud backend." },
              { step: "02", label: "Process", color: "text-secondary border-secondary/30 bg-secondary/10", desc: "Kalman filters denoise GPS. K-Means clusters units into sectors. Priority queue orders alerts." },
              { step: "03", label: "Decide", color: "text-accent border-accent/30 bg-accent/10", desc: "A* computes optimal movement paths. Rule-based recommendations are surfaced ordered by priority." },
            ].map((s) => (
              <div key={s.step} className="text-center space-y-3">
                <div className={`w-14 h-14 mx-auto rounded-full border-2 flex items-center justify-center text-lg font-bold ${s.color}`}>
                  {s.step}
                </div>
                <h3 className="font-bold text-lg">{s.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="border-t border-border py-20 bg-card/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Core Capabilities</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Map,       title: "A* Route Planning",       desc: "Pathfinding with dynamic risk-zone avoidance drawn live on the tactical map." },
              { icon: Activity,  title: "K-Means Sectors",         desc: "Automatic sector detection groups units geographically into Alpha, Bravo, Charlie zones." },
              { icon: Zap,       title: "Kalman GPS Smoothing",    desc: "Filter separates true position from GPS noise — visible as dual markers on map." },
              { icon: AlertCircle, title: "Priority Queue Alerts", desc: "Min-heap triage guarantees critical alerts always surface first." },
              { icon: BarChart2, title: "Live Analytics",          desc: "Health trends, event distribution, unit readiness radar — all updating in real-time." },
              { icon: TrendingUp, title: "Rule-Based Recommendations", desc: "Decision support ordered by urgency, derived from composite readiness score." },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="p-6 bg-card border border-border rounded-xl hover:border-primary/40 transition-colors group">
                  <div className="w-11 h-11 rounded-lg bg-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-16 text-center">
        <div className="max-w-xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl font-bold">Ready to explore?</h2>
          <p className="text-muted-foreground">Launch the live dashboard or read the full project report.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/dashboard" className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium gap-2">
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/analytics" className="inline-flex items-center justify-center px-8 py-3 border border-border rounded-lg hover:bg-card/50 transition-colors font-medium gap-2">
              <BarChart2 className="w-4 h-4" /> Analytics
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card/30 py-6 text-center text-sm text-muted-foreground">
        Battlefield Situational Awareness &amp; Decision Support System · Minor Project 2025-26
      </footer>
    </div>
  );
}
