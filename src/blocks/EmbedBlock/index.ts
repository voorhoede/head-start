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
    [key: string]: boolean | number | string | undefined;
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

export const extractScripts = (html: string): { noscriptHtml: string, scripts: { src: string }[] } => {
  const scripts: { src: string }[] = [];
  const noscriptHtml = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (scriptTag) => {
    const attributes = [...scriptTag.matchAll(/([a-z]+)(="([^"]+)")?/gi)]
      .map((match) => ({ name: match[1], value: match[3] || true }))
      .filter(({ name }) => name !== 'script')
      .reduce((acc, { name, value }) => ({ ...acc, [name]: value }), { src: '' });
    scripts.push(attributes);
    return '';
  });
  return { noscriptHtml, scripts };
};

export const getEmbedText = ({ provider_name, title }: { provider_name: string, title: string }): string => {
  return `${provider_name}: ${title}`;
};

export const isIframeHtml = (html: string): boolean => {
  return /<iframe[^>]*>/gi.test(html);
};

export const sanatizeHtml = (html: string): string => {
  /**
   * Remove deprecated attributes to resolve HTML violations
   * https://html-validate.org/rules/no-deprecated-attr.html
   */
  return html.replace(/<iframe[^>]*>/gi, (iframeTag) => {
    return iframeTag.replace(/(allow|allowtransparency|frameborder|scrolling)="[^"]+"/gi, '');
  });
};
