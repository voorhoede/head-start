import type { Client } from '@datocms/cli/lib/cma-client-node';
import { addTranslation } from './lib/add-translation';

export default async function(client: Client): Promise<void> {
  await addTranslation({
    client, 
    key: 'skip_to_content', 
    value: { 
      nl: 'Ga naar de inhoud', 
      en: 'Skip to content',
    }
  });
}
