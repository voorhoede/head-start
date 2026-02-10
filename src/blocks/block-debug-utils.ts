import { snakeCase } from 'scule';
import itemTypesJson from '@lib/datocms/itemTypes.json';

const itemTypes = (itemTypesJson as { itemTypes?: Record<string, { id: string; name: string; focusField?: string }> }).itemTypes;

/**
 * Converts the root segment of a field path to snake_case (DatoCMS API key format).
 * "bodyBlocks" => "body_blocks", "bodyBlocks.0.title" => "body_blocks.0.title"
 */
export function toApiKey(debugFieldPath: string): string {
  if (debugFieldPath.includes('.')) {
    const parts = debugFieldPath.split('.');
    const rootField = parts[0];
    const rest = parts.slice(1).join('.');
    return `${snakeCase(rootField)}.${rest}`;
  }
  return snakeCase(debugFieldPath);
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

/**
 * Builds the field paths used for block edit links and debug labels.
 * ("bodyBlocks", 2, "TextBlockRecord") => { blockBasePath: "body_blocks.2", blockFieldPath: "body_blocks.2.text", blockName: "📝 Text Block" }
 */
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

/**
 * Builds a field path for nested blocks within a parent block.
 * ("body_blocks.2", 0) => "body_blocks.2.items.0.blocks"
 * ("body_blocks.2.items.0.blocks", 1) => "body_blocks.2.items.0.blocks.1.blocks"
 */
export function buildNestedFieldPath(basePath: string | null | undefined, itemIndex: number): string | undefined {
  if (!basePath || basePath === '') {
    return undefined;
  }
  if (basePath.endsWith('.items')) {
    return `${basePath}.${itemIndex}.blocks`;
  }
  return `${basePath}.items.${itemIndex}.blocks`;
}
