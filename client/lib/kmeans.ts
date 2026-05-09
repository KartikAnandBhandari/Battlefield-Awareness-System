// ============================================================
// K-MEANS++ CLUSTERING
// Used in military ISR, data mining, image segmentation.
// Groups units into geographic sectors automatically.
//
// Time Complexity: O(n · k · i)  — n points, k clusters, i iterations
// Initialization: K-Means++ (smarter than random, avoids bad starts)
// ============================================================

export interface GeoPoint {
  id: string;
  lat: number;
  lng: number;
}

export interface Cluster {
  id: number;
  name: string;
  color: string;
  centroid: { lat: number; lng: number };
  members: GeoPoint[];
}

export interface KMeansResult {
  clusters: Cluster[];
  /** Map from point id → cluster id */
  assignments: Map<string, number>;
  /** Number of iterations until convergence */
  iterations: number;
  /** Whether the algorithm converged before maxIter */
  converged: boolean;
}

const SECTOR_NAMES = ["Alpha Sector", "Bravo Sector", "Charlie Sector", "Delta Sector"];
const SECTOR_COLORS = ["#22d3ee", "#f59e0b", "#4ade80", "#f87171"];

// ── Helpers ────────────────────────────────────────────────

function euclidean(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  return Math.sqrt((a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2);
}

/**
 * K-Means++ initialization.
 * Selects centroids probabilistically, preferring points far from existing ones.
 */
function kMeansPlusPlusInit(points: GeoPoint[], k: number): Array<{ lat: number; lng: number }> {
  const centroids: Array<{ lat: number; lng: number }> = [];

  // Pick first centroid randomly
  centroids.push({ ...points[Math.floor(Math.random() * points.length)] });

  for (let ci = 1; ci < k; ci++) {
    // Compute D² distances from each point to nearest centroid
    const distances = points.map((p) => {
      const minD = Math.min(...centroids.map((c) => euclidean(p, c)));
      return minD * minD;
    });

    const total = distances.reduce((s, d) => s + d, 0);
    let r = Math.random() * total;

    let chosen = points.length - 1;
    for (let j = 0; j < distances.length; j++) {
      r -= distances[j];
      if (r <= 0) {
        chosen = j;
        break;
      }
    }
    centroids.push({ lat: points[chosen].lat, lng: points[chosen].lng });
  }

  return centroids;
}

// ── Main function ──────────────────────────────────────────

/**
 * Run K-Means++ clustering on geographic points.
 * @param points  Array of labeled geo-points
 * @param k       Number of clusters (sectors)
 * @param maxIter Maximum iterations before forced stop
 * @param tol     Convergence threshold (degrees)
 */
export function kMeansClustering(
  points: GeoPoint[],
  k: number = 3,
  maxIter = 100,
  tol = 0.00005
): KMeansResult {
  // Edge cases
  if (points.length === 0) {
    return { clusters: [], assignments: new Map(), iterations: 0, converged: true };
  }
  k = Math.min(k, points.length);

  let centroids = kMeansPlusPlusInit(points, k);
  let assignments = new Array(points.length).fill(0);
  let converged = false;
  let iter = 0;

  for (; iter < maxIter; iter++) {
    // ── Assignment step ──────────────────────────────────────
    const newAssignments = points.map((p) => {
      let best = 0;
      let bestDist = Infinity;
      centroids.forEach((c, ci) => {
        const d = euclidean(p, c);
        if (d < bestDist) {
          bestDist = d;
          best = ci;
        }
      });
      return best;
    });

    // ── Check convergence ───────────────────────────────────
    const noChange = newAssignments.every((a, i) => a === assignments[i]);
    assignments = newAssignments;
    if (noChange) {
      converged = true;
      break;
    }

    // ── Update centroids ────────────────────────────────────
    const newCentroids = centroids.map((prev, ci) => {
      const members = points.filter((_, pi) => assignments[pi] === ci);
      if (members.length === 0) return prev; // keep old centroid if empty
      const lat = members.reduce((s, p) => s + p.lat, 0) / members.length;
      const lng = members.reduce((s, p) => s + p.lng, 0) / members.length;

      // Check if centroid moved less than tolerance
      if (Math.abs(prev.lat - lat) < tol && Math.abs(prev.lng - lng) < tol) {
        converged = true;
      }
      return { lat, lng };
    });

    centroids = newCentroids;
    if (converged) {
      iter++;
      break;
    }
  }

  // ── Build result ─────────────────────────────────────────
  const assignmentMap = new Map<string, number>();
  points.forEach((p, i) => assignmentMap.set(p.id, assignments[i]));

  const clusters: Cluster[] = centroids.map((centroid, ci) => ({
    id: ci,
    name: SECTOR_NAMES[ci] ?? `Sector ${ci + 1}`,
    color: SECTOR_COLORS[ci] ?? "#ffffff",
    centroid,
    members: points.filter((_, pi) => assignments[pi] === ci),
  }));

  return { clusters, assignments: assignmentMap, iterations: iter, converged };
}
