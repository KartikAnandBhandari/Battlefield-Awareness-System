// ============================================================
// SIMULATION ENGINE — v2.0
// Integrates: Kalman Filter, Priority Queue, K-Means sectors
// 7 units all positioned near Amritsar/Pakistan border region
// ============================================================

import { KalmanFilter2D, addGPSNoise } from "./kalmanFilter";
import { MinHeapPriorityQueue, AlertPriority, PRIORITY_MAP } from "./priorityQueue";
import { kMeansClustering, Cluster } from "./kmeans";

// ── Types ────────────────────────────────────────────────────────

export type UnitType = "infantry" | "armor" | "air" | "logistics" | "recon" | "medic";
export type UnitStatus = "active" | "warning" | "critical" | "idle";
export type EventType =
  | "movement" | "threat" | "supply" | "hazard"
  | "communication" | "status" | "alert";
export type EnvironmentalFactor = "clear" | "fog" | "rain" | "storm" | "snow";
export type ThreatLevel = "low" | "medium" | "high" | "critical";

export interface Unit {
  id: string;
  name: string;
  type: UnitType;
  lat: number;
  lng: number;
  /** Kalman-filtered position */
  filteredLat: number;
  filteredLng: number;
  /** Raw noisy GPS reading */
  rawLat: number;
  rawLng: number;
  status: UnitStatus;
  personnel: number;
  health: number;
  ammo: number;
  fuel: number;
  /**
   * Threat level derived from vulnerability score:
   *   vulnerability >= 60 → "high"
   *   vulnerability >= 30 → "medium"
   *   else               → "low"
   * Vulnerability itself is updated each tick based on proximity
   * to other units and resource depletion.
   */
  threatLevel: ThreatLevel;
  vulnerability: number;
  speed: number;
  direction: number;
  communicationLink: "strong" | "weak" | "lost";
  lastUpdate: Date;
}

export interface HistoricalPosition {
  lat: number;
  lng: number;
  timestamp: Date;
}

export interface HealthDataPoint {
  time: string;
  [key: string]: number | string;
}

export interface RiskIndicator {
  unitId: string;
  threatLevel: ThreatLevel;
  vulnerability: number;
  riskScore: number;
  factors: string[];
}

export interface OperationalEvent {
  id: string;
  timestamp: Date;
  type: EventType;
  unitId: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  priority: AlertPriority;
  location?: { lat: number; lng: number };
}

export interface EnvironmentalData {
  location: { lat: number; lng: number };
  weather: EnvironmentalFactor;
  visibility: number;
  terrain: "flat" | "forest" | "urban" | "mountain" | "water";
  temperature: number;
}

export interface SensorFeed {
  id: string;
  type: "drone" | "radar" | "thermal" | "acoustic";
  unitId: string;
  data: string;
  timestamp: Date;
}

export interface CommunicationLog {
  id: string;
  timestamp: Date;
  fromUnit: string;
  toUnit: string;
  message: string;
  priority: AlertPriority;
}

export interface DecisionRecommendation {
  id: string;
  timestamp: Date;
  unitId: string;
  type: "evacuation" | "defense" | "movement" | "reinforcement" | "supply" | "recon";
  title: string;
  description: string;
  rationale: string;
  priority: AlertPriority;
}

// ── Base unit definitions (all near Amritsar / Punjab border) ──

const BASE_UNITS = [
  { id: "ALPHA-1",   name: "Alpha Company",     type: "infantry"  as UnitType, lat: 31.6340, lng: 74.8720, personnel: 120 },
  { id: "BRAVO-2",   name: "Bravo Squadron",    type: "armor"     as UnitType, lat: 31.6520, lng: 74.9100, personnel: 85  },
  { id: "CHARLIE-3", name: "Charlie Logistics", type: "logistics" as UnitType, lat: 31.6100, lng: 74.8500, personnel: 60  },
  { id: "DELTA-4",   name: "Delta Air Wing",    type: "air"       as UnitType, lat: 31.6720, lng: 74.8280, personnel: 24  },
  { id: "ECHO-5",    name: "Echo Recon",        type: "recon"     as UnitType, lat: 31.6180, lng: 74.9350, personnel: 30  },
  { id: "FOXTROT-6", name: "Foxtrot Medics",   type: "medic"     as UnitType, lat: 31.6450, lng: 74.7980, personnel: 45  },
  { id: "GOLF-7",    name: "Golf Armor",        type: "armor"     as UnitType, lat: 31.5920, lng: 74.8840, personnel: 90  },
];

// ── Simulation Engine ─────────────────────────────────────────

class SimulationEngine {
  private units: Map<string, Unit> = new Map();
  private kalmanFilters: Map<string, KalmanFilter2D> = new Map();
  private positionHistory: Map<string, HistoricalPosition[]> = new Map();
  private healthHistory: HealthDataPoint[] = [];

  private alertQueue = new MinHeapPriorityQueue<OperationalEvent>();
  private events: OperationalEvent[] = [];
  private sensorFeeds: SensorFeed[] = [];
  private communicationLogs: CommunicationLog[] = [];
  private recommendations: DecisionRecommendation[] = [];
  private environmentalData: EnvironmentalData[] = [];

  private baseLocation = { lat: 31.6340, lng: 74.8720 };

  public getBaseLocation() {
    return { ...this.baseLocation };
  }
  private missionStart = new Date();
  private eventIdCounter = 1;
  private sensorIdCounter = 1;
  private commIdCounter = 1;
  private recIdCounter = 1;

  constructor() {
    this.initializeUnits();
    this.initializeEnvironment();
    this.generateInitialEvents();
  }

  public relocateOperations(lat: number, lng: number): void {
    this.baseLocation = { lat, lng };
    this.units.clear();
    this.kalmanFilters.clear();
    this.positionHistory.clear();
    this.initializeUnits();
    this.initializeEnvironment();
    
    // Add an event for the relocation
    const relocationEvent: OperationalEvent = {
      id: `EVT-${this.eventIdCounter++}`,
      timestamp: new Date(),
      type: "movement",
      unitId: "COMMAND",
      title: "HQ Relocation complete",
      description: `Operations shifted to new sector: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      severity: "info",
      priority: "high",
      location: { lat, lng },
    };
    this.events.unshift(relocationEvent);
  }

  private initializeUnits(): void {
    const unitOffsets = [
      { id: "ALPHA-1",   name: "Alpha Company",     type: "infantry"  as UnitType, latOff: 0.0,    lngOff: 0.0,    personnel: 120 },
      { id: "BRAVO-2",   name: "Bravo Squadron",    type: "armor"     as UnitType, latOff: 0.018,  lngOff: 0.038,  personnel: 85  },
      { id: "CHARLIE-3", name: "Charlie Logistics", type: "logistics" as UnitType, latOff: -0.024, lngOff: -0.022, personnel: 60  },
      { id: "DELTA-4",   name: "Delta Air Wing",    type: "air"       as UnitType, latOff: 0.038,  lngOff: -0.044, personnel: 24  },
      { id: "ECHO-5",    name: "Echo Recon",        type: "recon"     as UnitType, latOff: -0.016, lngOff: 0.063,  personnel: 30  },
      { id: "FOXTROT-6", name: "Foxtrot Medics",   type: "medic"     as UnitType, latOff: 0.011,  lngOff: -0.074, personnel: 45  },
      { id: "GOLF-7",    name: "Golf Armor",        type: "armor"     as UnitType, latOff: -0.042, lngOff: 0.012,  personnel: 90  },
    ];

    unitOffsets.forEach((d) => {
      const lat = this.baseLocation.lat + d.latOff;
      const lng = this.baseLocation.lng + d.lngOff;
      const vulnerability = Math.floor(Math.random() * 40);
      const unit: Unit = {
        id: d.id,
        name: d.name,
        type: d.type,
        personnel: d.personnel,
        lat,
        lng,
        filteredLat: lat,
        filteredLng: lng,
        rawLat: lat,
        rawLng: lng,
        status: "active",
        health: Math.floor(Math.random() * 25) + 72,
        ammo: Math.floor(Math.random() * 20) + 60,
        fuel: Math.floor(Math.random() * 25) + 60,
        threatLevel: "low",
        vulnerability,
        speed: Math.random() * 30 + 10,
        direction: Math.floor(Math.random() * 360),
        communicationLink: Math.random() > 0.9 ? "weak" : "strong",
        lastUpdate: new Date(),
      };
      // Derive initial threat level from vulnerability
      unit.threatLevel = this.deriveThreatLevel(unit.vulnerability);
      // Derive initial status from readiness score
      unit.status = this.deriveStatus(unit);
      this.units.set(unit.id, unit);
      this.kalmanFilters.set(unit.id, new KalmanFilter2D(lat, lng));
      this.positionHistory.set(unit.id, []);
    });
  }

  /**
   * Threat level is derived deterministically from vulnerability score.
   * Vulnerability itself is updated each tick based on resource depletion.
   *   >= 60 → "high"
   *   >= 30 → "medium"
   *   else  → "low"
   */
  private deriveThreatLevel(vulnerability: number): ThreatLevel {
    if (vulnerability >= 60) return "high";
    if (vulnerability >= 30) return "medium";
    return "low";
  }

  /**
   * Unit readiness score = average of health, fuel, and ammo (equal weight).
   * Status thresholds map to standard operational readiness categories:
   *   readiness < 33 → "critical"  (less than 1/3 of combined capacity)
   *   readiness < 66 → "warning"   (less than 2/3 of combined capacity)
   *   else           → "active"
   * Using equal thirds avoids arbitrary per-metric cutoffs.
   */
  private deriveStatus(unit: Unit): UnitStatus {
    const readiness = (unit.health + unit.fuel + unit.ammo) / 3;
    if (readiness < 33) return "critical";
    if (readiness < 66) return "warning";
    return "active";
  }

  private initializeEnvironment(): void {
    this.environmentalData = [];
    const weathers: EnvironmentalFactor[] = ["clear", "fog", "rain", "clear", "clear", "storm", "clear"];
    const terrains: EnvironmentalData["terrain"][] = ["urban", "flat", "urban", "flat", "forest", "urban", "flat"];
    const units = Array.from(this.units.values());
    units.forEach((u, i) => {
      this.environmentalData.push({
        location: { lat: u.lat, lng: u.lng },
        weather: weathers[i % weathers.length],
        visibility: Math.floor(Math.random() * 40) + 60,
        terrain: terrains[i % terrains.length],
        temperature: Math.floor(Math.random() * 20) + 15,
      });
    });
  }

  private generateInitialEvents(): void {
    const types: EventType[] = ["movement", "communication", "status", "supply"];
    const units = Array.from(this.units.values());
    for (let i = 0; i < 10; i++) {
      const unit = units[Math.floor(Math.random() * units.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const event = this.buildEvent(unit, type, "info", "low", Date.now() - Math.random() * 30 * 60000);
      this.events.push(event);
      this.alertQueue.insertWithLevel(event, event.priority);
    }
    this.events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private buildEvent(
    unit: Unit,
    type: EventType,
    severity: "info" | "warning" | "critical",
    priority: AlertPriority,
    ts?: number
  ): OperationalEvent {
    const TITLES: Record<EventType, string[]> = {
      movement:      ["Unit repositioned", "Movement initiated", "Patrol route changed"],
      threat:        ["Threat detected", "Perimeter breach", "Suspicious activity"],
      supply:        ["Supply drop complete", "Resupply en route", "Logistics update"],
      hazard:        ["Hazard alert", "Environmental warning", "Terrain danger"],
      communication: ["Message received", "Link established", "Comms update"],
      status:        ["Status update", "System check", "Personnel count updated"],
      alert:         ["Critical alert", "Emergency notification", "Urgent message"],
    };
    const DESCS: Record<EventType, string[]> = {
      movement:      [`${unit.name} moved to new position`, `${unit.name} initiated movement sequence`],
      threat:        [`Potential threat near ${unit.name}`, `${unit.name} reported suspicious activity`],
      supply:        [`Supply convoy reached ${unit.name}`, `${unit.name} resupply complete`],
      hazard:        [`Environmental hazard in ${unit.name} zone`, `Terrain danger reported`],
      communication: [`${unit.name} established link`, `Message exchanged with ${unit.name}`],
      status:        [`${unit.name} systems nominal`, `Personnel count verified at ${unit.name}`],
      alert:         [`Critical status update for ${unit.name}`, `Urgent notification from ${unit.name}`],
    };
    const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    return {
      id: `EVT-${this.eventIdCounter++}`,
      timestamp: new Date(ts ?? Date.now()),
      type,
      unitId: unit.id,
      title: pick(TITLES[type]),
      description: pick(DESCS[type]),
      severity,
      priority,
      location: { lat: unit.lat, lng: unit.lng },
    };
  }

  // ── Simulation tick ───────────────────────────────────────

  public updateSimulation(): void {
    const units = Array.from(this.units.values());

    units.forEach((unit) => {
      // Save position history (keep last 15)
      const hist = this.positionHistory.get(unit.id) ?? [];
      hist.push({ lat: unit.lat, lng: unit.lng, timestamp: new Date() });
      if (hist.length > 15) hist.shift();
      this.positionHistory.set(unit.id, hist);

      // Move unit
      unit.lat += (Math.random() - 0.5) * 0.0018;
      unit.lng += (Math.random() - 0.5) * 0.0018;
      unit.lastUpdate = new Date();

      // Simulate noisy GPS → Kalman filter
      const rawLat = addGPSNoise(unit.lat, 0.0007);
      const rawLng = addGPSNoise(unit.lng, 0.0007);
      unit.rawLat = rawLat;
      unit.rawLng = rawLng;
      const kf = this.kalmanFilters.get(unit.id)!;
      const filtered = kf.update(rawLat, rawLng);
      unit.filteredLat = filtered.lat;
      unit.filteredLng = filtered.lng;

      // Resource consumption — rates differ by unit type (higher activity = higher drain)
      // Infantry: moderate health/ammo drain, low fuel
      // Armor/Air: higher fuel drain due to engine load
      // Logistics/Medic: low ammo drain, moderate fuel
      // Recon: low health drain, moderate fuel
      const fuelRate   = unit.type === "air" ? 2.0 : unit.type === "armor" ? 1.5 : 0.8;
      const ammoRate   = unit.type === "infantry" ? 1.0 : unit.type === "recon" ? 0.5 : 0.3;
      const healthRate = unit.type === "infantry" ? 0.5 : 0.2;
      unit.fuel   = Math.max(0, unit.fuel   - Math.random() * fuelRate);
      unit.ammo   = Math.max(0, unit.ammo   - Math.random() * ammoRate);
      unit.health = Math.max(0, unit.health - Math.random() * healthRate);

      // Vulnerability increases as resources deplete (inverse of average readiness)
      const readiness = (unit.health + unit.fuel + unit.ammo) / 3;
      unit.vulnerability = Math.round(100 - readiness);

      // Status derived from composite readiness score (equal weight across all three resources)
      unit.status = this.deriveStatus(unit);

      // Threat level derived deterministically from vulnerability
      unit.threatLevel = this.deriveThreatLevel(unit.vulnerability);
    });

    // Snapshot health history (every tick → keep last 30)
    const snap: HealthDataPoint = {
      time: new Date().toLocaleTimeString("en-US", { hour12: false }),
    };
    units.forEach((u) => { snap[u.id] = Math.round(u.health); });
    this.healthHistory.push(snap);
    if (this.healthHistory.length > 30) this.healthHistory.shift();

    // Random events
    if (Math.random() > 0.6) this.generateRandomEvent();
    if (Math.random() > 0.75) this.generateSensorData();
    if (Math.random() > 0.7)  this.generateCommunication();

    // Weather drift (occasional)
    if (Math.random() > 0.95) this.driftWeather();

    this.updateRecommendations();
  }

  private generateRandomEvent(): void {
    const types: EventType[] = ["movement", "communication", "status", "threat", "supply", "alert"];
    const units = Array.from(this.units.values());
    const unit = units[Math.floor(Math.random() * units.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const isCritical = type === "threat" || type === "alert";
    const severity: "info" | "warning" | "critical" = isCritical
      ? "critical" : Math.random() > 0.7 ? "warning" : "info";
    const priority: AlertPriority = isCritical
      ? (Math.random() > 0.5 ? "critical" : "high")
      : Math.random() > 0.7 ? "medium" : "low";

    const event = this.buildEvent(unit, type, severity, priority);
    this.events.unshift(event);
    if (this.events.length > 60) this.events.pop();

    // Push to priority queue
    this.alertQueue.insertWithLevel(event, priority);
  }

  private generateSensorData(): void {
    const units = Array.from(this.units.values());
    const unit = units[Math.floor(Math.random() * units.length)];
    const types: SensorFeed["type"][] = ["drone", "radar", "thermal", "acoustic"];
    const type = types[Math.floor(Math.random() * types.length)];
    const data: Record<SensorFeed["type"], string> = {
      drone:    `Aerial scan: terrain clear, no contacts detected`,
      radar:    `Radar sweep: ${Math.floor(Math.random() * 6)} contacts at bearing ${Math.floor(Math.random() * 360)}°`,
      thermal:  `Thermal imaging: ${Math.floor(Math.random() * 12)} heat signatures`,
      acoustic: `Acoustic sensor: ${Math.random() > 0.5 ? "vehicle movement" : "no unusual activity"}`,
    };
    const feed: SensorFeed = {
      id: `SNS-${this.sensorIdCounter++}`,
      type, unitId: unit.id, data: data[type], timestamp: new Date(),
    };
    this.sensorFeeds.push(feed);
    if (this.sensorFeeds.length > 25) this.sensorFeeds.shift();
  }

  private generateCommunication(): void {
    const units = Array.from(this.units.values());
    const from = units[Math.floor(Math.random() * units.length)];
    let to = units[Math.floor(Math.random() * units.length)];
    if (from.id === to.id) return;
    const msgs = [
      "All clear, continuing patrol", "Requesting supply drop at current position",
      "Position update: holding defensive line", "Awaiting further orders from command",
      "Status nominal, proceeding with mission", "Detected movement on eastern flank",
      "Requesting immediate air support", "Medical evac needed at grid reference",
    ];
    const priority: AlertPriority = Math.random() > 0.8 ? "critical" : Math.random() > 0.6 ? "high" : "medium";
    const comm: CommunicationLog = {
      id: `COM-${this.commIdCounter++}`,
      timestamp: new Date(), fromUnit: from.id, toUnit: to.id,
      message: msgs[Math.floor(Math.random() * msgs.length)],
      priority,
    };
    this.communicationLogs.push(comm);
    if (this.communicationLogs.length > 35) this.communicationLogs.shift();
  }

  private driftWeather(): void {
    const options: EnvironmentalFactor[] = ["clear", "fog", "rain", "clear", "storm"];
    this.environmentalData.forEach((env) => {
      if (Math.random() > 0.7) {
        env.weather = options[Math.floor(Math.random() * options.length)];
        env.visibility = Math.floor(Math.random() * 40) + 60;
      }
    });
  }

  private updateRecommendations(): void {
    const recQueue = new MinHeapPriorityQueue<DecisionRecommendation>();
    this.units.forEach((unit) => {
      const readiness = (unit.health + unit.fuel + unit.ammo) / 3;

      // Critical: readiness below 1/3 — unit cannot sustain operations
      if (readiness < 33) {
        recQueue.insertWithLevel({
          id: `REC-${this.recIdCounter++}`, timestamp: new Date(), unitId: unit.id,
          type: "evacuation", title: "Immediate Evacuation Required",
          description: `${unit.name} has critically low combined readiness and must withdraw`,
          rationale: `Readiness: ${Math.round(readiness)}% (Health: ${Math.round(unit.health)}% | Fuel: ${Math.round(unit.fuel)}% | Ammo: ${Math.round(unit.ammo)}%)`,
          priority: "critical",
        }, "critical");
      }
      // Warning: readiness below 2/3 — resupply needed to avoid degradation
      else if (readiness < 66) {
        recQueue.insertWithLevel({
          id: `REC-${this.recIdCounter++}`, timestamp: new Date(), unitId: unit.id,
          type: "supply", title: "Resupply Required",
          description: `${unit.name} readiness is degraded — resupply to maintain effectiveness`,
          rationale: `Readiness: ${Math.round(readiness)}% (Health: ${Math.round(unit.health)}% | Fuel: ${Math.round(unit.fuel)}% | Ammo: ${Math.round(unit.ammo)}%)`,
          priority: "high",
        }, "high");
      }
      // High vulnerability (>= 60) with adequate readiness — recommend defensive posture
      if (unit.vulnerability >= 60 && readiness >= 66) {
        recQueue.insertWithLevel({
          id: `REC-${this.recIdCounter++}`, timestamp: new Date(), unitId: unit.id,
          type: "reinforcement", title: "Reinforcement Recommended",
          description: `${unit.name} faces high threat — request reinforcement from nearest unit`,
          rationale: `Vulnerability: ${unit.vulnerability}% — tactical superiority at risk`,
          priority: "critical",
        }, "critical");
      } else if (unit.vulnerability >= 30 && readiness >= 66) {
        recQueue.insertWithLevel({
          id: `REC-${this.recIdCounter++}`, timestamp: new Date(), unitId: unit.id,
          type: "defense", title: "Establish Defensive Position",
          description: `Moderate vulnerability in ${unit.name} AO — recommend defensive formation`,
          rationale: `Vulnerability: ${unit.vulnerability}% with adequate resources for sustained defense`,
          priority: "medium",
        }, "medium");
      }
    });
    this.recommendations = recQueue.toSortedArray().slice(0, 20);
  }

  // ── Public API ────────────────────────────────────────────

  public getUnits(): Unit[] { return Array.from(this.units.values()); }
  public getUnit(id: string): Unit | undefined { return this.units.get(id); }

  public getEvents(unitId?: string, type?: EventType, limit = 25): OperationalEvent[] {
    let filtered = [...this.events];
    if (unitId) filtered = filtered.filter((e) => e.unitId === unitId);
    if (type)   filtered = filtered.filter((e) => e.type === type);
    return filtered.slice(0, limit);
  }

  /** Returns alerts from priority queue (highest priority first). */
  public getAlerts(): OperationalEvent[] {
    return this.alertQueue.toSortedArray().filter(
      (e) => e.severity === "critical" || e.type === "alert" || e.type === "threat"
    ).slice(0, 15);
  }

  public getRiskIndicators(): RiskIndicator[] {
    return Array.from(this.units.values()).map((u) => ({
      unitId: u.id,
      threatLevel: u.threatLevel,
      vulnerability: u.vulnerability,
      /**
       * Risk score = vulnerability score (0–100).
       * Vulnerability is already the inverse of composite readiness:
       *   vulnerability = 100 − avg(health, fuel, ammo)
       * This gives a single, transparent, equal-weight risk measure.
       */
      riskScore: Math.min(100, u.vulnerability),
      factors: this.calcFactors(u),
    }));
  }

  private calcFactors(u: Unit): string[] {
    const f: string[] = [];
    if (u.health < 50)             f.push("Low structural integrity");
    if (u.fuel < 40)               f.push("Fuel critically low");
    if (u.ammo < 30)               f.push("Ammunition depleted");
    if (u.communicationLink !== "strong") f.push("Communication degraded");
    if (u.threatLevel === "medium") f.push("Moderate threat detected");
    if (u.threatLevel === "high")   f.push("High threat presence");
    if (u.vulnerability > 70)      f.push("Highly vulnerable to attack");
    return f.slice(0, 5);
  }

  /** Overall risk score: weighted average across all units. */
  public getOverallRiskScore(): number {
    const indicators = this.getRiskIndicators();
    if (indicators.length === 0) return 0;
    return Math.round(indicators.reduce((s, r) => s + r.riskScore, 0) / indicators.length);
  }

  /** K-Means sectors computed from current unit positions. */
  public getKMeansSectors(): Cluster[] {
    const points = Array.from(this.units.values()).map((u) => ({
      id: u.id, lat: u.lat, lng: u.lng,
    }));
    const result = kMeansClustering(points, 3);
    return result.clusters;
  }

  /** Last N positions for a unit (for trail rendering). */
  public getHistoricalPositions(unitId: string, limit = 12): HistoricalPosition[] {
    return (this.positionHistory.get(unitId) ?? []).slice(-limit);
  }

  /** Health time-series for charts. */
  public getHealthHistory(): HealthDataPoint[] { return [...this.healthHistory]; }

  public getSensorFeeds(unitId?: string, limit = 10): SensorFeed[] {
    let f = [...this.sensorFeeds].reverse();
    if (unitId) f = f.filter((s) => s.unitId === unitId);
    return f.slice(0, limit);
  }

  public getCommunicationLogs(unitId?: string, limit = 15): CommunicationLog[] {
    let f = [...this.communicationLogs].reverse();
    if (unitId) f = f.filter((c) => c.fromUnit === unitId || c.toUnit === unitId);
    return f.slice(0, limit);
  }

  public getRecommendations(unitId?: string, limit = 10): DecisionRecommendation[] {
    let f = [...this.recommendations];
    if (unitId) f = f.filter((r) => r.unitId === unitId);
    return f.slice(0, limit);
  }

  public getEnvironmentalData(): EnvironmentalData[] { return [...this.environmentalData]; }

  public getMissionElapsedMs(): number {
    return Date.now() - this.missionStart.getTime();
  }

  public getAlertQueueDepth(): number { return this.alertQueue.size; }
}

export const simulationEngine = new SimulationEngine();

export function startSimulation(updateInterval = 2000): () => void {
  const id = setInterval(() => simulationEngine.updateSimulation(), updateInterval);
  return () => clearInterval(id);
}
