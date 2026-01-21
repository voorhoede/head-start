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

export function getDatoCmsEditorLink(
  recordId: string | null,
  itemTypeId: string | null,
  projectName: string | null,
  environment: string,
): string | null {
  if (!recordId || !itemTypeId || !projectName || !environment) return null;

  const baseUrl = `https://${projectName}.admin.datocms.com/environments/${environment}/editor`;

  return `${baseUrl}/item_types/${itemTypeId}/items/${recordId}/edit`;
}

export function buildEditorLink(
  recordId: string | null,
  itemTypeId: string | null,
  environment: string,
): string | null {
  const projectName = getProjectName();
  if (!projectName) return null;

  return getDatoCmsEditorLink(recordId, itemTypeId, projectName, environment);
}

