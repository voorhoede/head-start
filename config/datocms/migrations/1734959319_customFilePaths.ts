import type { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single-line string field "Path" (`path`) in model "\uD83D\uDCE6 File" (`file`)'
  );
  await client.fields.create('GjWw8t-hTFaYYWyc53FeIg', {
    id: 'cnnDYybJTAGvHxiYq2MJ8g',
    label: 'Path',
    field_type: 'string',
    api_key: 'path',
    hint: 'Optional custom path, like <code>/my-files/example.pdf</code>. This may be useful if you need files to be available under a specific URL.',
    validators: {
      format: {
        custom_pattern: '^/.*',
        description: 'Field must start with a forward slash: /',
      },
    },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: '',
  });

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Single-line string field "Path" (`path`) in model "\uD83D\uDCE6 File" (`file`)'
  );
  await client.fields.update('cnnDYybJTAGvHxiYq2MJ8g', { position: 3 });

  console.log(
    'Update Single-line string field "Title" (`title`) in model "\uD83D\uDCE6 File" (`file`)'
  );
  await client.fields.update('YIftd04cTlyz0aEvqsfWXA', {
    appearance: {
      addons: [],
      editor: 'EiyZ3d0SSDCPCNbsKBIwWQ',
      parameters: {
        defaultFunction:
          'if (path) {\n return path.split(\'/\').pop()\n}\nconst upload = await getUpload(file.upload_id)\nreturn `${upload.filename}`',
      },
      field_extension: 'computedFields',
    },
  });
}
