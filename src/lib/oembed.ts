import OEmbedProviders from 'oembed-providers';

type OEmbedEndpoint = {
    url: string;
    schemes: string[];
    discovery: boolean;
}
type OEmbedProvider = {
    provider_name: string;
    provider_url: string;
    endpoints: OEmbedEndpoint[];
}

export function getOEmbedProvider(url: string): OEmbedProvider | null {
  for (const provider of OEmbedProviders as OEmbedProvider[]) {
    for (const endpoint of provider.endpoints) {
      if (endpoint.schemes) {
        for (const scheme of endpoint.schemes) {
          const regex = new RegExp(scheme.replace(/\*/g, '.*'));
          if (regex.test(url)) {
            return provider;
          }
        }
      } else {
        const baseUrl = new URL(url).origin;
        if (provider.provider_url === baseUrl) {
          return provider;
        }
      }
    }
  }
  return null;
}

export function getOEmbedUrl(url: string, format = 'json'): string | null {
  for (const provider of OEmbedProviders as OEmbedProvider[]) {
    for (const endpoint of provider.endpoints) {
      if (endpoint.schemes) {
        for (const scheme of endpoint.schemes) {
          const regex = new RegExp(scheme.replace(/\*/g, '.*'));
          if (regex.test(url)) {
            return endpoint.url.replaceAll('{format}', format);
          }
        }
      } else {
        const baseUrl = new URL(url).origin;
        if (provider.provider_url === baseUrl) {
          return endpoint.url.replaceAll('{format}', format);
        }
      }
    }
  }
  return null;
}

type ParamsByProviderName = {
  [key: string]: {
    [key: string]: string;
  };
};
function getProviderParams(providerName?: string) {
  if (!providerName) {
    return {};
  }
  const paramsByProviderName: ParamsByProviderName = {
    Twitter: {
      omit_script: 'true',
      dnt: 'true',
    },
  };
  return paramsByProviderName[providerName] || {};
}

export async function fetchOEmbedData (url: string /*, searchParams?: URLSearchParams */) {
  const oEmbedBaseUrl = getOEmbedUrl(url);
  if (!oEmbedBaseUrl) {
    return null;
  }
  const OEmbedProvider = getOEmbedProvider(url);
  const providerParams = getProviderParams(OEmbedProvider?.provider_name);
  const searchParams = new URLSearchParams(providerParams);
  searchParams.append('url', url);
  const oEmbedUrl = new URL(oEmbedBaseUrl + '?' + searchParams.toString());
  const response = await fetch(oEmbedUrl);
  if (response.ok) {
    try {
      return await response.json();
    } catch(err) {
      console.log('fetchOEmbedData error' /*, err*/);
      return null;
    }
  }
  return null;
}

export function fetchPageTitle (url:string) {
  return fetch(url)
    .then(response => response.text())
    .then(text => {
      const match = text.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (match) {
        return match[1];
      }
      return null;
    })
    .catch(err => {
      console.log('fetchPageTitle error:', err);
      return null;
    });
}
