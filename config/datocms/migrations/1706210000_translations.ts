import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Create model "\uD83C\uDF10 Translation" (`translation`)');
  const translationModel = await client.itemTypes.create(
    {
      name: '\uD83C\uDF10 Translation',
      api_key: 'translation',
      all_locales_required: true,
      collection_appearance: 'table',
      inverse_relationships_enabled: false,
    },
  );

  console.log(
    'Create Single-line string field "Key" (`key`) in model "\uD83C\uDF10 Translation" (`translation`)',
  );
  await client.fields.create('translation', {
    label: 'Key',
    field_type: 'string',
    api_key: 'key',
    validators: {
      required: {},
      unique: {},
      format: { custom_pattern: '^[a-z_]+$' },
    },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: '',
  });

  console.log(
    'Create Single-line string field "Value" (`value`) in model "\uD83C\uDF10 Translation" (`translation`)',
  );
  await client.fields.create('translation', {
    label: 'Value',
    field_type: 'string',
    api_key: 'value',
    localized: true,
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: true, placeholder: null },
      type: 'title',
    },
    default_value: { en: '' },
  });

  const translationContent = {
    'allow_service': 'Allow {{ service }}',
    'breadcrumbs_title': 'Breadcrumbs',
    'download_video_title': 'download video: {{title}}',
    'search_error': 'Error performing search. Please try again.',
    'go_to_home_page': 'Go to {{ siteName }} home page',
    'breadcrumbs_home': 'Home',
    'image_unavailable': 'image unavailable',
    'search_label': 'Keyword(s)',
    'search_no_results_for_query': 'No search results for \'{{ query }}\'',
    'play_video_title': 'play video: {{title}}',
    'search': 'search',
    'search_on_site': 'Search on {{ siteName }}',
    'search_query_invalid':
      'Search query \'{{ query }}\' is invalid. Query needs to be at least {{ minQueryLength }} characters.',
    'search_results_for_query': 'Search results for \'{{ query }}\'',
    'select_language': 'Select language',
    'consent_message_service':
      '{{ service }} uses cookies to show this video. This requires your permission.',
    'share_on_social': 'Share on social media',
    'skip_to_content': 'Skip to content',
    'not_found': 'The page you requested could not be found.',
    'watch_video_on_provider': 'watch on {{provider}}',
  };

  console.log('Create required translation content');
  await Promise.all(
    Object.entries(translationContent).map(([translationKey, translation]) => (
      client.items.create({
        item_type: { type: 'item_type', id: translationModel.id },
        key: translationKey,
        value: { 'en': translation },
      })
    )),
  );
}
