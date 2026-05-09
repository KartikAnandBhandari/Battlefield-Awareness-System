// ============================================================
// KALMAN FILTER (1D + 2D)
// Used in GPS, radar tracking, spacecraft navigation, autonomous vehicles.
// Estimates the true state from noisy measurements.
//
// State vector: position
// Process noise Q: how much we trust the motion model
// Measurement noise R: how noisy the sensor is
// ============================================================

export class KalmanFilter1D {
  private q: number; // process noise covariance
  private r: number; // measurement noise covariance
  private x: number; // state estimate (position)
  private p: number; // estimate error covariance
  private k: number = 0; // Kalman gain

  constructor(q = 0.001, r = 0.008, initialValue = 0) {
    this.q = q;
    this.r = r;
    this.x = initialValue;
    this.p = 1.0;
  }

  /**
   * Update the filter with a new noisy measurement.
   * Returns the smoothed estimate.
   */
  update(measurement: number): number {
    // ── Prediction step ──────────────────────────────────────
    // P_k|k-1 = P_k-1 + Q
    this.p = this.p + this.q;

    // ── Update step ──────────────────────────────────────────
    // K = P / (P + R)
    this.k = this.p / (this.p + this.r);

    // x_k = x_k-1 + K * (z - x_k-1)
    this.x = this.x + this.k * (measurement - this.x);

    // P_k = (1 - K) * P
    this.p = (1 - this.k) * this.p;

    return this.x;
  }

  get state(): number {
    return this.x;
  }

  get gain(): number {
    return this.k;
  }

  get errorCovariance(): number {
    return this.p;
  }
}

export interface FilteredPosition {
  lat: number;
  lng: number;
  /** Raw (noisy) measurement before filtering */
  rawLat: number;
  rawLng: number;
  /** Kalman gain — how much we trusted the measurement */
  gain: number;
}

/**
 * 2-D Kalman filter for geographic coordinates.
 * Runs two independent 1-D filters for lat and lng.
 */
export class KalmanFilter2D {
  private latFilter: KalmanFilter1D;
  private lngFilter: KalmanFilter1D;

  constructor(
    initialLat: number,
    initialLng: number,
    processNoise = 0.001,
    measurementNoise = 0.008
  ) {
    this.latFilter = new KalmanFilter1D(processNoise, measurementNoise, initialLat);
    this.lngFilter = new KalmanFilter1D(processNoise, measurementNoise, initialLng);
  }

  update(rawLat: number, rawLng: number): FilteredPosition {
    const lat = this.latFilter.update(rawLat);
    const lng = this.lngFilter.update(rawLng);
    return {
      lat,
      lng,
      rawLat,
      rawLng,
      gain: (this.latFilter.gain + this.lngFilter.gain) / 2,
    };
  }

  get position(): { lat: number; lng: number } {
    return { lat: this.latFilter.state, lng: this.lngFilter.state };
  }
}

/** Add Gaussian noise to simulate GPS sensor error */
export function addGPSNoise(value: number, sigma = 0.0008): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return value + sigma * z;
}
