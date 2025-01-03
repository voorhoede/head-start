import type { SimpleSchemaTypes } from '@datocms/cli/lib/cma-client-node'; 

export const actionStyleField: SimpleSchemaTypes.FieldCreateSchema = {
  label: 'Style',
  field_type: 'string',
  api_key: 'style',
  validators: {
    required: {},
    enum: { values: ['default', 'primary', 'secondary'] },
  },
  appearance: {
    addons: [],
    editor: 'string_select',
    parameters: {
      options: [
        { hint: '', label: 'Default action', value: 'default' },
        { hint: '', label: 'Primary action', value: 'primary' },
        { hint: '', label: 'Secondary action', value: 'secondary' },
      ],
    },
  },
  default_value: 'default',
};
