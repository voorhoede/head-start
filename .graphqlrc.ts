import { loadEnv } from 'vite';
import { datocmsEnvironment } from './datocms-environment';

const { DATOCMS_READONLY_API_TOKEN } = loadEnv(
  process.env.NODE_ENV!,
  process.cwd(),
  ''
);

const schemaFilename = 'src/lib/datocms/schema.ts';
const outputFilename = 'src/lib/datocms/types.ts';

/**
 * Custom scalar mappings for DatoCMS. Needed by both the schema types
 * (typescript) and the operation types (typescript-operations): the latter
 * inlines the resolved scalar TS type into operation results, so omitting it
 * would emit `unknown` instead of e.g. `string`.
 * @see https://www.datocms.com/docs/content-delivery-api/custom-scalar-types
 */
const scalars = {
  BooleanType: 'boolean',
  CustomData: 'Record<string, unknown>',
  Date: 'string',
  DateTime: 'string',
  FloatType: 'number',
  IntType: 'number',
  ItemId: 'string',
  JsonField: 'unknown',
  MetaTagAttributes: 'Record<string, string>',
  UploadId: 'string',
};

console.log(`Saving generated types for DatoCMS (environment: '${datocmsEnvironment}') to '${outputFilename}'.`);

/**
 * @link https://graphql-config.com/introduction
 */
module.exports = {
  schema: {
    'https://graphql.datocms.com': {
      headers: {
        Authorization: DATOCMS_READONLY_API_TOKEN,
        'X-Environment': datocmsEnvironment,
        'X-Exclude-Invalid': 'true',
      },
    },
  },
  documents: 'src/**/*.graphql',
  extensions: {
    codegen: {
      overwrite: true,
      generates: {
        // Full schema types (object types, enums, inputs, scalars). Since v6,
        // typescript-operations no longer emits these, so they live in their
        // own file and operation types import from it via importSchemaTypesFrom.
        [schemaFilename]: {
          plugins: [
            'typescript',
          ],
          config: {
            enumsAsConst: true,
            strictScalars: true,
            scalars,
          },
        },
        // Operation/fragment types + typed DocumentNodes. Schema types
        // (object types, enums, inputs, scalars) are imported from schema.ts
        // by callers directly, not re-exported here.
        [outputFilename]: {
          plugins: [
            'typescript-operations',
            '@graphql-codegen/typescript-document-nodes',
          ],
          config: {
            // Resolved relative to cwd, then re-relativized by codegen to the
            // output dir → './schema' in the generated import statement.
            importSchemaTypesFrom: `./${schemaFilename.replace(/\.ts$/, '')}`,
            strictScalars: true,
            scalars,
            documentMode: 'documentNode',
            useTypeImports: true,
          },
        },
      },
    },
  },
};
