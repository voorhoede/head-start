import type { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single-line string field "Layout" (`layout`) in block model "Page Partial Block" (`page_partial_block`)'
  );
  await client.fields.create('V80liDVtRC-UYgd3Sm-dXg', {
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'SO4JBlc8QCiQjRNJVlZPcw',
    label: 'Layout',
    field_type: 'string',
    api_key: 'layout',
    validators: {
      required: {},
      enum: {
        values: [
          'stack-untitled',
          'stack-titled',
          'accordion-closed',
          'accordion-open',
          'tabs',
        ],
      },
    },
    appearance: {
      addons: [],
      editor: 'string_radio_group',
      parameters: {
        radios: [
          {
            hint: 'Show items, one after the other, without displaying their title.',
            label: 'Stack, untitled',
            value: 'stack-untitled',
          },
          {
            hint: 'Show items, one after the other, with their title preceding their blocks content.',
            label: 'Stack, titled',
            value: 'stack-titled',
          },
          {
            hint: 'Show items as accordion, with all items collapsed, showing only their titles.',
            label: 'Accordion, closed',
            value: 'accordion-closed',
          },
          {
            hint: 'Show items as accordion, with the first item expanded, showing both its title and blocks content.',
            label: 'Accordion, open',
            value: 'accordion-open',
          },
          {
            hint: 'Show items as tabbed interface, with their titles as tab labels and their blocks content in tab panels.',
            label: 'Tabs',
            value: 'tabs',
          },
        ],
      },
    },
    default_value: 'stack-untitled',
  });

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Single-line string field "Title" (`title`) in model "Page Partial" (`page_partial`)'
  );
  await client.fields.update('UFrvDLVxQju6Z35XHzuENQ', { hint: null });
}
