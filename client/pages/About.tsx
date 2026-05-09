import { Link } from "react-router-dom";
import { Shield, Cpu, GitBranch, Layers, BookOpen, Users, Code2, ArrowLeft } from "lucide-react";

const ALGORITHMS = [
  {
    name: "A* Pathfinding",
    complexity: "O((V + E) log V)",
    space: "O(V)",
    icon: "🗺️",
    category: "Graph Search",
    realWorld: "GPS navigation, robotics, game AI",
    description:
      "A* finds the lowest-cost path between two geographic points on a discretised grid. It uses an admissible Euclidean heuristic and adds a penalty for traversing high-risk zones derived from live risk indicators. Unlike Dijkstra's, the heuristic guides the search toward the goal, drastically reducing explored nodes.",
    steps: [
      "Overlay a 50×50 grid on the map bounding box",
      "Insert start node into the open set",
      "Each iteration: expand the node with lowest f = g + h",
      "Risk zones increase movement cost of adjacent cells",
      "Reconstruct path by tracing parent pointers to start",
    ],
  },
  {
    name: "K-Means++ Clustering",
    complexity: "O(n · k · i)",
    space: "O(n + k)",
    icon: "🎯",
    category: "Unsupervised ML",
    realWorld: "Military ISR, data mining, image segmentation",
    description:
      "K-Means++ groups unit positions into K operational sectors by iteratively minimising intra-cluster variance. The ++ variant initialises centroids probabilistically (D² weighting) to avoid poor local optima. Sectors update every simulation tick, providing a live geographic intelligence picture.",
    steps: [
      "Select first centroid uniformly at random",
      "Each subsequent centroid chosen with probability ∝ D²",
      "Assignment: each unit joins nearest centroid",
      "Update: centroids recomputed as cluster mean",
      "Repeat until centroid shift < 5×10⁻⁵ degrees",
    ],
  },
  {
    name: "Kalman Filter",
    complexity: "O(1) per update",
    space: "O(1) per unit",
    icon: "📡",
    category: "State Estimation",
    realWorld: "GPS, spacecraft navigation, autonomous vehicles, radar",
    description:
      "Each unit's true position is unknown — the GPS provides noisy measurements (Gaussian noise σ = 0.0007°). The Kalman filter maintains a state estimate and error covariance, applying two steps each tick: (1) Prediction widens the uncertainty, (2) Update blends the measurement with the model using an optimal Kalman gain K.",
    steps: [
      "Prediction: P = P + Q  (grow uncertainty)",
      "Kalman gain: K = P / (P + R)",
      "Update estimate: x = x + K(z − x)",
      "Update covariance: P = (1 − K) · P",
      "Map shows raw (dim) vs filtered (bright) position",
    ],
  },
  {
    name: "Priority Queue (Min-Heap)",
    complexity: "Insert / ExtractMin: O(log n)",
    space: "O(n)",
    icon: "🚨",
    category: "Data Structure",
    realWorld: "OS schedulers, hospital triage, network QoS, Dijkstra's",
    description:
      "All operational events and alerts are inserted into a binary min-heap keyed by priority (critical=0, high=1, medium=2, low=3). Dequeue always returns the most urgent alert first, regardless of insertion order. A secondary key on insertion order ensures FIFO within the same priority level.",
    steps: [
      "Insert: append node, bubble-up to restore heap property",
      "ExtractMin: swap root with last, sink-down from root",
      "Priority map: critical < high < medium < low",
      "Tie-break: earlier-inserted event dequeued first",
      "Alert panel always shows highest-priority items",
    ],
  },
];

const STACK = [
  { layer: "Frontend",   tech: "React 18 + TypeScript",          color: "text-cyan-400" },
  { layer: "Routing",    tech: "React Router 6 (SPA mode)",       color: "text-blue-400" },
  { layer: "Styling",    tech: "TailwindCSS 3 + Radix UI",        color: "text-purple-400" },
  { layer: "Animation",  tech: "Framer Motion",                   color: "text-pink-400" },
  { layer: "3D / Globe", tech: "Three.js + React Three Fiber",    color: "text-orange-400" },
  { layer: "Charts",     tech: "Recharts",                        color: "text-green-400" },
  { layer: "Maps",       tech: "Leaflet.js",                      color: "text-emerald-400" },
  { layer: "Build",      tech: "Vite + SWC",                      color: "text-yellow-400" },
  { layer: "Backend",    tech: "Node.js + Express",               color: "text-rose-400" },
  { layer: "Validation", tech: "Zod",                             color: "text-indigo-400" },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold">SAWS</span>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-muted-foreground text-sm">Project Report</span>
          </div>
          <div className="flex gap-3 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <Link to="/dashboard" className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16 space-y-20">
        {/* Project Header */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-primary text-sm font-medium">
            <BookOpen className="w-4 h-4" /> Minor Project Report — B.Tech / MCA 2025-26
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold">
            Battlefield Situational Awareness &amp;
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mt-1">
              Decision Support System
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            A real-time cloud-based tactical intelligence platform integrating four
            computer-science algorithms into an operational command-centre interface.
          </p>
        </section>

        {/* Project Info Table */}
        <section className="grid md:grid-cols-2 gap-6">
          {[
            { label: "Project Title", value: "Battlefield Situational Awareness & Decision Support System (SAWS)" },
            { label: "Domain", value: "Defence Technology / Real-Time Systems / Applied Algorithms" },
            { label: "Type", value: "Minor Project — Full-Stack Web Application" },
            { label: "Student(s)", value: "Kartik Anand Bhandari | 500122458  ·  Ayushman Naresh | 500120529" },
            { label: "Department", value: "Computer Science & Engineering" },
            { label: "Academic Year", value: "2023–27" },
            { label: "Guide", value: "Prof. Abhishek Roshan" },
            { label: "Institution", value: "UPES Dehradun" },
          ].map((row) => (
            <div key={row.label} className="p-4 bg-card border border-border rounded-lg">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{row.label}</p>
              <p className="font-medium text-sm">{row.value}</p>
            </div>
          ))}
        </section>

        {/* Objective & Scope */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <GitBranch className="w-5 h-5" /> Objective
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To design and implement a browser-based real-time situational awareness
              system that applies classical and modern computer-science algorithms to
              the domain of battlefield intelligence. The system simulates live unit
              tracking, automated threat assessment, and decision support in a
              visually rich, interactive dashboard.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-secondary font-semibold">
              <Layers className="w-5 h-5" /> Scope
            </div>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
              <li>Real-time simulation of 7 tactical field units</li>
              <li>A* pathfinding for route optimisation with risk avoidance</li>
              <li>K-Means++ for automated operational sector detection</li>
              <li>Kalman Filter for GPS noise reduction and position smoothing</li>
              <li>Min-Heap priority queue for triage-ordered alert management</li>
              <li>Interactive Leaflet map with trails, sectors, and A* overlay</li>
              <li>Live analytics: health trends, event distribution, readiness radar</li>
            </ul>
          </div>
        </section>

        {/* Algorithms */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <Cpu className="w-7 h-7 text-primary" /> Algorithms Implemented
            </h2>
            <p className="text-muted-foreground">Core computer science applied to real battlefield scenarios</p>
          </div>

          {ALGORITHMS.map((algo) => (
            <div key={algo.name} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-6 border-b border-border bg-card/50">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{algo.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold">{algo.name}</h3>
                      <span className="text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                        {algo.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm space-y-1">
                    <div><span className="text-muted-foreground">Time: </span><code className="text-secondary">{algo.complexity}</code></div>
                    <div><span className="text-muted-foreground">Space: </span><code className="text-secondary">{algo.space}</code></div>
                  </div>
                </div>
              </div>
              <div className="p-6 grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{algo.description}</p>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Real-world use: </span>
                    <span className="text-accent">{algo.realWorld}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase font-semibold text-muted-foreground mb-2 tracking-wider">Algorithm Steps</p>
                  <ol className="space-y-1.5">
                    {algo.steps.map((step, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Technology Stack */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <Code2 className="w-7 h-7 text-primary" /> Technology Stack
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {STACK.map((s) => (
              <div key={s.layer} className="p-4 bg-card border border-border rounded-lg text-center hover:border-primary/40 transition-colors">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{s.layer}</p>
                <p className={`text-sm font-semibold ${s.color}`}>{s.tech}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
          <Users className="w-8 h-8 text-primary mx-auto" />
          <h2 className="text-2xl font-bold">Project Team</h2>
          <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {["Kartik Anand Bhandari — Roll No. 500122458", "Ayushman Naresh — Roll No. 500120529", "Faculty Guide — Prof. Abhishek Roshan"].map((m) => (
              <div key={m} className="p-3 bg-background border border-border rounded-lg text-sm text-muted-foreground">{m}</div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Dept. of Computer Science & Engineering · UPES Dehradun · 2023-27</p>
        </section>

        {/* References */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">References</h2>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Hart, P.E., Nilsson, N.J., Raphael, B. (1968). <em>A Formal Basis for the Heuristic Determination of Minimum Cost Paths.</em> IEEE Transactions on Systems Science.</li>
            <li>MacQueen, J. (1967). <em>Some Methods for Classification and Analysis of Multivariate Observations.</em> Proceedings of the 5th Berkeley Symposium.</li>
            <li>Kalman, R.E. (1960). <em>A New Approach to Linear Filtering and Prediction Problems.</em> Journal of Basic Engineering, 82(1), 35–45.</li>
            <li>Cormen, T.H. et al. (2022). <em>Introduction to Algorithms (4th ed.).</em> MIT Press.</li>
            <li>OpenStreetMap contributors — map tile data via Leaflet.js.</li>
          </ol>
        </section>
      </main>

      <footer className="border-t border-border bg-card/30 py-6 text-center text-sm text-muted-foreground">
        SAWS — Battlefield Situational Awareness &amp; Decision Support System · Minor Project 2025-26
      </footer>
    </div>
  );
}
