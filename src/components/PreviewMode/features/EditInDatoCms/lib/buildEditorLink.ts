import siteDataUntyped from '@lib/site.json';

type SiteData = {
  internalDomain?: string;
};

const siteData = siteDataUntyped as SiteData;

export function getProjectName(): string | null {
  const domain = siteData.internalDomain;
  if (!domain) return null;

  return domain.split('.')[0] || null;
}

