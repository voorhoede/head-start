import siteDataUntyped from '@lib/site.json';

type SiteData = {
  internalDomain?: string;
};

const siteData = siteDataUntyped as SiteData;

// Extracts the project name from something like: "head-start.admin.datocms.com"
export function getProjectName(): string | null {
  const domain = siteData.internalDomain;
  if (!domain) return null;

  const match = domain.match(/^([^.]+)/);
  return match?.[1] ?? null;
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

  // Fallback: just send them to the editor (avoids brittle deep links)
  return baseUrl;
}

export function buildEditorUrlFromToken(
  recordId: string,
  itemTypeId: string | null,
  _apiToken: string | undefined,
  environment: string,
): string | null {
  // Result:
  // - Full:     https://{project}.admin.datocms.com/environments/{environment}/editor/item_types/{itemTypeId}/items/{recordId}/edit
  // - Fallback: https://{project}.admin.datocms.com/environments/{environment}/editor
  const projectName = getProjectName();
  if (!projectName) return null;

  return getDatoCmsEditorUrl(recordId, itemTypeId, projectName, environment);
}

