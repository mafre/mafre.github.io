// Install types + lib first:
//   npm i suncalc
//   npm i -D @types/suncalc

import SunCalc from "suncalc";

export type SunPosition = {
  /** Altitude above the horizon: 0° = on horizon, 90° = straight up */
  altitudeDeg: number;
  /** Azimuth bearing where 0° = North, 90° = East, 180° = South, 270° = West */
  azimuthDeg: number;
  /** Original radians from SunCalc (altitude, azimuth-from-south) */
  raw: { altitudeRad: number; azimuthRad: number };
  time: Date;
  coords: { latitude: number; longitude: number };
};

/**
 * Fetch the current position of the Sun for the given coords.
 * If coords are omitted in a browser, uses the Geolocation API.
 */
export default async function getCurrentSunPosition(
  coords?: { latitude: number; longitude: number }
): Promise<SunPosition> {
  const { latitude, longitude } =
    coords ?? (await getBrowserLocation()); // throws if not available/denied

  const time = new Date();
  const pos = SunCalc.getPosition(time, latitude, longitude);
  // SunCalc azimuth is measured from South, clockwise (radians).
  // Convert to a normal compass bearing where 0°=North, 90°=East…
  const azimuthDeg = normalizeDegrees((pos.azimuth * 180) / Math.PI + 180);
  const altitudeDeg = (pos.altitude * 180) / Math.PI;

  return {
    altitudeDeg,
    azimuthDeg,
    raw: { altitudeRad: pos.altitude, azimuthRad: pos.azimuth },
    time,
    coords: { latitude, longitude },
  };
}

/** Helper: get precise browser location as a Promise */
function getBrowserLocation(): Promise<{ latitude: number; longitude: number }> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    throw new Error("Geolocation API not available in this environment.");
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (p) =>
        resolve({
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
        }),
      (err) => reject(new Error(`Geolocation failed: ${err.message}`)),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 }
    );
  });
}

function normalizeDegrees(d: number): number {
  return ((d % 360) + 360) % 360;
}
