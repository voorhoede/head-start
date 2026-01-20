import siteDataUntyped from '@lib/site.json';

type SiteData = {
  internalDomain?: string;
};

const siteData = siteDataUntyped as SiteData;

export type EditorLink = { url: string; isFallback: boolean };

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
): EditorLink | null {
  if (!projectName || !environment) return null;

  const baseUrl = `https://${projectName}.admin.datocms.com/environments/${environment}/editor`;

  if (recordId && itemTypeId) {
    return {
      url: `${baseUrl}/item_types/${itemTypeId}/items/${recordId}/edit`,
      isFallback: false,
    };
  }

  return { url: baseUrl, isFallback: true };
}


export function buildEditorLink(
  recordId: string | null,
  itemTypeId: string | null,
  environment: string,
): EditorLink | null {
  // Builds a DatoCMS editor link; falls back to the base editor if recordId/itemTypeId is missing.
  const projectName = getProjectName();
  if (!projectName) return null;

  return getDatoCmsEditorLink(recordId, itemTypeId, projectName, environment);
}

