import itemTypesJson from '@lib/datocms/itemTypes.json';

const itemTypes = (itemTypesJson as { itemTypes?: Record<string, { id: string; name: string; focusField?: string }> }).itemTypes;

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`).replace(/^_/, '');
}

export function toApiKey(debugFieldPath: string): string {
  if (debugFieldPath.includes('.')) {
    const parts = debugFieldPath.split('.');
    const rootField = parts[0];
    const rest = parts.slice(1).join('.');
    return `${camelToSnake(rootField)}.${rest}`;
  }
  return camelToSnake(debugFieldPath);
}

function getItemTypeMeta(typename: string) {
  return itemTypes?.[typename];
}

export function getItemTypeId(typename?: string): string | null {
  if (!typename) return null;
  return getItemTypeMeta(typename)?.id ?? null;
}

export function getFocusFieldApiKey(typename: string): string | null {
  return getItemTypeMeta(typename)?.focusField ?? null;
}

export function getBlockDisplayName(typename: string): string {
  return getItemTypeMeta(typename)?.name ?? typename.replace(/Record$/, '');
}

export function getDebugPaths(
  debugFieldPath: string | null | undefined,
  index: number,
  typename: string
): { blockBasePath: string | null; blockFieldPath: string | null; blockName: string } {
  if (!debugFieldPath || debugFieldPath === '') {
    return { blockBasePath: null, blockFieldPath: null, blockName: getBlockDisplayName(typename) };
  }

  const apiKeyPath = toApiKey(debugFieldPath);
  const blockBasePath = `${apiKeyPath}.${index}`;
  const meta = getItemTypeMeta(typename);
  const focusFieldApiKey = meta?.focusField ?? null;
  const blockFieldPath = focusFieldApiKey ? `${blockBasePath}.${focusFieldApiKey}` : blockBasePath;
  const blockName = meta?.name ?? typename.replace(/Record$/, '');

  return { blockBasePath, blockFieldPath, blockName };
}

export function buildNestedFieldPath(basePath: string, itemIndex: number): string {
  if (basePath.endsWith('.items')) {
    return `${basePath}.${itemIndex}.blocks`;
  }
  return `${basePath}.items.${itemIndex}.blocks`;
}
