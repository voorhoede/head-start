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

export function getDatoCmsEditorUrl(
  recordId: string,
  itemTypeId: string | null,
  projectName: string | null,
  environment: string,
): string | null {
  if (!recordId || !projectName || !environment) return null;

  const baseUrl = `https://${projectName}.admin.datocms.com/environments/${environment}/editor`;

  if (itemTypeId) {
    return `${baseUrl}/item_types/${itemTypeId}/items/${recordId}/edit`;
  }

  // Fallback: just send them to the editor
  return baseUrl;
}


export function buildEditorUrlFromToken(
  recordId: string,
  itemTypeId: string | null,
  environment: string,
): string | null {
  // Builds a DatoCMS editor URL, with a fallback to the base editor
  // Format:  https://{project}.admin.datocms.com/environments/{environment}/editor/item_types/{itemTypeId}/items/{recordId}/edit
  const projectName = getProjectName();
  if (!projectName) return null;

  return getDatoCmsEditorUrl(recordId, itemTypeId, projectName, environment);
}

