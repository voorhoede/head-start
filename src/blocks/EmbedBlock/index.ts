import OEmbedProviders from 'oembed-providers';

// OEmbed types based on https://oembed.com/ section 2.3.4. Response parameters
export type OEmbedType = 'photo' | 'video' | 'link' | 'rich' | 'error';
export interface OEmbedData {
    type: OEmbedType;
    version: string;
    title: string;
    author_name?: string;
    author_url?: string;
    provider_name?: string;
    provider_url?: string;
    cache_age?: number;
    thumbnail_url?: string;
    thumbnail_width?: number;
    thumbnail_height?: number;
}
export interface OEmbedPhoto extends OEmbedData {
    type: 'photo';
    url: string;
    width: number;
    height: number;
}
export interface OEmbedVideo extends OEmbedData {
    type: 'video';
    html: string;
    width: number;
    height: number;
}
export interface OEmbedLink extends OEmbedData {
    type: 'link';
}
export interface OEmbedRich extends OEmbedData {
    type: 'rich';
    html: string;
    width: number;
    height: number;
}
export type OEmbedAny = OEmbedPhoto | OEmbedVideo | OEmbedLink | OEmbedRich;

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

export const extractScripts = (html: string): { noscriptHtml: string, scripts: { src: string }[] } => {
  const scripts: { src: string }[] = [];
  const noscriptHtml = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (scriptTag) => {
    const attributes = [...scriptTag.matchAll(/([a-z]+)(="([^"]+)")?/gi)]
      .filter((match) => match[1] !== 'script')
      .reduce((acc, match) => ({ ...acc, [match[1]]: match[3] || true }), {
        src: '',
      });
    scripts.push(attributes);
    return '';
  });
  return { noscriptHtml, scripts };
};

export const sanatizeHtml = (html: string): string => {
  return html.replace(/<iframe[^>]*>/gi, (iframeTag) => {
    return iframeTag.replace(/(allow|allowtransparency|frameborder|scrolling)="[^"]+"/gi, '');
  });
};
