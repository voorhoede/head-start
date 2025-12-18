import { describe, expect, test } from 'vitest';
import { renderToFragment } from '@lib/renderer';
import type { RecordRoute } from '@lib/routing';
import LinkToRecord, { type Props as LinkToRecordProps } from './LinkToRecord.astro';

const record = {
  __typename: 'HomePageRecord',
  id: 'home',
  title: 'Homepage',
} satisfies RecordRoute;

const props = {
  record
} satisfies LinkToRecordProps;

describe('LinkToRecord', () => {
  test('Component is rendered', async () => {
    const fragment = await renderToFragment<LinkToRecordProps>(
      LinkToRecord,
      { props }
    );
    expect(fragment).toBeDefined();
  });

  test('renders text content without trailing whitespace ', async () => {
    const fragment = await renderToFragment<LinkToRecordProps>(LinkToRecord, {
      props,
      slots: {
        default: 'spacing\n',
      },
    });
    expect(fragment.querySelector('a')?.textContent).toBe('spacing');
  });
});
