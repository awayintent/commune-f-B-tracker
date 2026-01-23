/**
 * Geocoding utilities for Singapore postal codes
 * Uses OneMap API (Singapore government's official mapping service)
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Convert Singapore postal code to coordinates using OneMap API
 * Falls back to Singapore center if geocoding fails
 */
export async function postalCodeToCoordinates(postalCode: string): Promise<Coordinates | null> {
  if (!postalCode || postalCode.trim().length !== 6) {
    return null;
  }

  try {
    const response = await fetch(
      `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${postalCode}&returnGeom=Y&getAddrDetails=Y`
    );

    if (!response.ok) {
      console.warn(`OneMap API error for postal code ${postalCode}`);
      return null;
    }

    const data = await response.json();

    if (data.found > 0 && data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: parseFloat(result.LATITUDE),
        lng: parseFloat(result.LONGITUDE)
      };
    }

    return null;
  } catch (error) {
    console.error(`Error geocoding postal code ${postalCode}:`, error);
    return null;
  }
}

/**
 * Batch geocode multiple postal codes
 * Returns a map of postal code to coordinates
 */
export async function batchGeocodePostalCodes(
  postalCodes: string[]
): Promise<Map<string, Coordinates>> {
  const results = new Map<string, Coordinates>();
  
  // Process in batches to avoid rate limiting
  const batchSize = 5;
  const delay = 200; // ms between batches

  for (let i = 0; i < postalCodes.length; i += batchSize) {
    const batch = postalCodes.slice(i, i + batchSize);
    
    const promises = batch.map(async (postalCode) => {
      const coords = await postalCodeToCoordinates(postalCode);
      if (coords) {
        results.set(postalCode, coords);
      }
    });

    await Promise.all(promises);

    // Delay between batches
    if (i + batchSize < postalCodes.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return results;
}

/**
 * Singapore center coordinates (fallback)
 */
export const SINGAPORE_CENTER: Coordinates = {
  lat: 1.3521,
  lng: 103.8198
};

/**
 * Get bounds for Singapore map
 */
export function getSingaporeBounds(): [[number, number], [number, number]] {
  return [
    [1.15, 103.6], // Southwest
    [1.47, 104.0]  // Northeast
  ];
}
