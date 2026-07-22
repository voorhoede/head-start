export const fieldTypes = [
  'text',
  'email',
  'phone',
  'textarea',
  'select',
  'checkbox',
  'radio',
  'number',
  'date',
] as const;

export type FieldType = (typeof fieldTypes)[number];

export function isValidFieldType(fieldType: unknown): fieldType is FieldType {
  return ([...fieldTypes] as unknown[]).includes(fieldType);
}
