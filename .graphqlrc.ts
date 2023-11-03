import 'dotenv/config'
import { datocmsEnvironment} from './datocms-environment';

const outputFilename = 'src/lib/types/datocms.d.ts';

console.log(`Saving generated types for DatoCMS (environment: '${datocmsEnvironment}') to '${outputFilename}'.`)

/**
 * @link https://graphql-config.com/introduction
 */
module.exports = {
  schema: {
    'https://graphql.datocms.com': {
      headers: {
        Authorization: process.env.DATOCMS_READONLY_API_TOKEN,
        "X-Environment": datocmsEnvironment,
        "X-Exclude-Invalid": "true",
      },
    },
  },
  documents: 'src/**/*.graphql',
  extensions: {
    codegen: {
      overwrite: true,
      generates: {
        [outputFilename]: {
          plugins: [
            'typescript',
            'typescript-operations',
            'typed-document-node',
          ],
          /**
          * scalar config borrowed from DatoCMS team:
          * @see https://github.com/Tonel/typescript-type-generation-graphql-example/blob/2d43584b1d75c9086c4ddd594a6b2401a29b0055/graphql.config.yml#L11-L23
          */
          config: {
            dedupeFragments: true,
            strictScalars: true,
            scalars: {
              BooleanType: 'boolean',
              CustomData: 'Record<string, unknown>',
              Date: 'string',
              DateTime: 'string',
              FloatType: 'number',
              IntType: 'number',
              ItemId: 'string',
              JsonField: 'unkown',
              MetaTagAttributes: 'Record<string, string>',
              UploadId: 'string',
            },
            // namingConvention: {
            //   enumValues: './pascalCaseWithUnderscores',
            // },
          },
        // 'src/lib/datocms.schema.json': {
        //   plugins: [
        //     'introspection',
        //   ],
        //   config: {
        //     dedupeFragments: true,
        //     pureMagicComment: true,
        //     exportFragmentSpreadSubTypes: true,
        //     namingConvention: 'keep',
        //   },
        // },
        },
      },
    },
  },
}

