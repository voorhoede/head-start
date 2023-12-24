import type { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single link field "Parent page" (`parent_page`) in model "Page" (`page`)'
  );
  await client.fields.create('2596445', {
    id: 'FybgJf3dQ3G061OgVj1FHw',
    label: 'Parent page',
    field_type: 'link',
    api_key: 'parent_page',
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: ['2596445'],
      },
    },
    appearance: { addons: [], editor: 'link_select', parameters: {} },
    default_value: null,
  });
}
