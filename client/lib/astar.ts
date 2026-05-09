// ============================================================
// A* PATHFINDING
// Industry standard for GPS navigation, robotics, game AI.
// Finds the shortest-cost path between two geo-points on a grid,
// penalising routes through high-risk zones.
//
// Time Complexity: O((V + E) log V)  — V=grid cells, E=edges
// Heuristic: Euclidean distance (admissible → optimal)
// ============================================================

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RiskZone {
  lat: number;
  lng: number;
  /** Radius in degrees (~0.01° ≈ 1 km) */
  radiusDeg: number;
  /** Risk weight 0–100 */
  risk: number;
}

export interface AStarResult {
  /** Ordered waypoints from start to end */
  path: LatLng[];
  /** Total accumulated cost */
  cost: number;
  /** Number of grid cells explored */
  nodesExplored: number;
  /** Distance in approximate km */
  distanceKm: number;
  found: boolean;
}

interface GridNode {
  row: number;
  col: number;
  g: number;
  h: number;
  f: number;
  parent: GridNode | null;
}

const DEG_TO_KM = 111.32;

function euclidean(r1: number, c1: number, r2: number, c2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (c1 - c2) ** 2);
}

function getRiskPenalty(lat: number, lng: number, zones: RiskZone[]): number {
  let penalty = 0;
  for (const z of zones) {
    const d = Math.sqrt((lat - z.lat) ** 2 + (lng - z.lng) ** 2);
    if (d < z.radiusDeg) {
      penalty += z.risk * (1 - d / z.radiusDeg);
    }
  }
  return Math.min(penalty, 200);
}

/**
 * Run A* from `start` to `end` on a lat/lng grid.
 * Risk zones increase the cost of passing through those cells.
 */
export function aStarPathfinding(
  start: LatLng,
  end: LatLng,
  riskZones: RiskZone[] = [],
  gridSize = 50
): AStarResult {
  // Build bounding box with padding
  const pad = 0.04;
  const minLat = Math.min(start.lat, end.lat) - pad;
  const maxLat = Math.max(start.lat, end.lat) + pad;
  const minLng = Math.min(start.lng, end.lng) - pad;
  const maxLng = Math.max(start.lng, end.lng) + pad;

  const latStep = (maxLat - minLat) / gridSize;
  const lngStep = (maxLng - minLng) / gridSize;

  const toGrid = (lat: number, lng: number) => ({
    row: Math.max(0, Math.min(gridSize - 1, Math.round((lat - minLat) / latStep))),
    col: Math.max(0, Math.min(gridSize - 1, Math.round((lng - minLng) / lngStep))),
  });

  const toLatLng = (row: number, col: number): LatLng => ({
    lat: minLat + row * latStep,
    lng: minLng + col * lngStep,
  });

  const key = (r: number, c: number) => r * 1000 + c;

  const sg = toGrid(start.lat, start.lng);
  const eg = toGrid(end.lat, end.lng);

  // Open set: key → node  (we scan for minimum f — good enough for small grids)
  const openMap = new Map<number, GridNode>();
  const closedSet = new Set<number>();

  const startNode: GridNode = {
    row: sg.row, col: sg.col,
    g: 0,
    h: euclidean(sg.row, sg.col, eg.row, eg.col),
    f: 0,
    parent: null,
  };
  startNode.f = startNode.h;
  openMap.set(key(sg.row, sg.col), startNode);

  // 8-directional movement
  const dirs = [
    [-1, 0, 1], [1, 0, 1], [0, -1, 1], [0, 1, 1],
    [-1, -1, 1.414], [-1, 1, 1.414], [1, -1, 1.414], [1, 1, 1.414],
  ] as [number, number, number][];

  let nodesExplored = 0;

  while (openMap.size > 0) {
    // Find node with lowest f
    let current: GridNode | null = null;
    let lowestF = Infinity;
    for (const node of openMap.values()) {
      if (node.f < lowestF) { lowestF = node.f; current = node; }
    }
    if (!current) break;

    const ck = key(current.row, current.col);

    // Goal reached
    if (current.row === eg.row && current.col === eg.col) {
      const path: LatLng[] = [];
      let node: GridNode | null = current;
      while (node) {
        path.unshift(toLatLng(node.row, node.col));
        node = node.parent;
      }
      const distanceKm =
        Math.sqrt(
          ((end.lat - start.lat) * DEG_TO_KM) ** 2 +
          ((end.lng - start.lng) * DEG_TO_KM * Math.cos((start.lat * Math.PI) / 180)) ** 2
        );
      return { path, cost: current.g, nodesExplored, distanceKm, found: true };
    }

    openMap.delete(ck);
    closedSet.add(ck);
    nodesExplored++;

    for (const [dr, dc, baseCost] of dirs) {
      const nr = current.row + dr;
      const nc = current.col + dc;
      if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) continue;
      const nk = key(nr, nc);
      if (closedSet.has(nk)) continue;

      const ll = toLatLng(nr, nc);
      const risk = getRiskPenalty(ll.lat, ll.lng, riskZones);
      const moveCost = baseCost * (1 + risk / 30);
      const g = current.g + moveCost;

      const existing = openMap.get(nk);
      if (!existing || g < existing.g) {
        const h = euclidean(nr, nc, eg.row, eg.col);
        openMap.set(nk, { row: nr, col: nc, g, h, f: g + h, parent: current });
      }
    }
  }

  return { path: [], cost: 0, nodesExplored, distanceKm: 0, found: false };
}
