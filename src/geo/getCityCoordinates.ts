export interface CityCoordinatesOptions {
  latitude: number;
  longitude: number;
  name: string;
  country?: string;
  admin1?: string;
  timezone?: string;
}

export type CityCoords = {
  latitude: number;
  longitude: number;
  name: string;
  country?: string;
  admin1?: string; // state/region
  timezone?: string;
  raw: unknown; // original item for extra fields if you need them
};

/**
 * Fetch coordinates (lat/lon) for a city name.
 * Optionally bias by country name/code and result language.
 *
 * Uses Open-Meteo Geocoding API: https://open-meteo.com/en/docs/geocoding-api
 */
export default async function getCityCoordinates(
  city: string,
  opts: {
    country?: string; // e.g. "Sweden" or "SE"
    language?: string; // e.g. "en", "sv"
    count?: number; // how many results to fetch to pick best
    signal?: AbortSignal; // to cancel
  } = {}
): Promise<CityCoords> {
  if (!city?.trim()) {
    throw new Error('City name is required.');
  }

  const name = opts.country ? `${city}, ${opts.country}` : city;
  const params = new URLSearchParams({
    name,
    count: String(opts.count ?? 5),
    language: opts.language ?? 'en',
    format: 'json',
  });

  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`, {
    signal: opts.signal,
  });

  if (!res.ok) {
    throw new Error(`Geocoding request failed: ${res.status} ${res.statusText}`);
  }

  const data: {
    results?: Array<{
      name: string;
      latitude: number;
      longitude: number;
      country?: string;
      admin1?: string;
      timezone?: string;
      feature_code?: string; // e.g. PPLC (capital), PPLA (admin city)
    }>;
  } = await res.json();

  if (!data.results?.length) {
    throw new Error(`No results found for "${city}".`);
  }

  // Prefer capital/major places if present, else first result
  const preferred =
    data.results.find((r) => r.feature_code === 'PPLC') ??
    data.results.find((r) => r.feature_code === 'PPLA') ??
    data.results[0];

  return {
    latitude: preferred.latitude,
    longitude: preferred.longitude,
    name: preferred.name,
    country: preferred.country,
    admin1: preferred.admin1,
    timezone: preferred.timezone,
    raw: preferred,
  };
}
