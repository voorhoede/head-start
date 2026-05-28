import { loadEnv } from 'vite';
import { datocmsEnvironment } from './datocms-environment';

const { DATOCMS_READONLY_API_TOKEN } = loadEnv(
  process.env.NODE_ENV!,
  process.cwd(),
  ''
);

const schemaFilename = 'src/lib/datocms/schema.ts';
const outputFilename = 'src/lib/datocms/types.ts';
// Sibling specifier injected verbatim into types.ts to re-export schema.ts.
const schemaSibling = './schema';
// importSchemaTypesFrom is resolved relative to cwd, then re-relativized to the
// output file's dir by codegen, so it must be the cwd-relative path to schema.ts.
const schemaFromCwd = `./${schemaFilename.replace(/\.ts$/, '')}`;

/**
 * Scalar config borrowed from DatoCMS team:
 * @see https://github.com/Tonel/typescript-type-generation-graphql-example/blob/2d43584b1d75c9086c4ddd594a6b2401a29b0055/graphql.config.yml#L11-L23
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
        // Operation/fragment types + typed DocumentNodes. Re-exports the schema
        // types so consumers can keep importing everything from this one module.
        [outputFilename]: {
          plugins: [
            { add: { content: `export * from '${schemaSibling}';` } },
            'typescript-operations',
            '@graphql-codegen/typescript-document-nodes',
          ],
          config: {
            importSchemaTypesFrom: schemaFromCwd,
            strictScalars: true,
            scalars,
          },
        },
      },
    },
  },
};
