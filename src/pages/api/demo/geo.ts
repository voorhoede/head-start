import type { Runtime } from '@astrojs/cloudflare';

export const prerender = false;

interface GeoData {
  asn?: string;
  city?: string;
  continent?: string;
  country?: string;
  ip?: string;
  latitude?: string;
  longitude?: string;
  postalCode?: string;
  region?: string;
  regionCode?: string;
  timezone?: string;
}

/**
 * Demo endpoint to show how to access Cloudflare runtime properties, like geo data.
 */
export function GET ({ locals }: { locals: Runtime }) {
  const geoProps: Array<keyof GeoData> = ['asn', 'city', 'continent', 'country', 'ip', 'latitude', 'longitude', 'postalCode', 'region', 'regionCode', 'timezone'];
  const geoData: GeoData = geoProps.reduce((acc, prop) => {
    if (locals.runtime.cf && locals.runtime.cf[prop]) {
      acc[prop] = locals.runtime.cf[prop] as GeoData[keyof GeoData];
    }
    return acc;
  }, {} as GeoData);
  return new Response(JSON.stringify(geoData, null, 2));
}
