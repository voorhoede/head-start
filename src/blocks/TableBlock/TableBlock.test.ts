import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import TableBlock, { type Props } from './TableBlock.astro';

describe('TableBlock', () => {
  test('With header row and header column', async () => {
    const fragment = await renderToFragment<Props>(TableBlock, {
      props: {
        block: {
          _modelApiKey: 'table_block',
          id: '123',
          title: 'Table Block',
          table: {
            columns: ['test_1', 'test_2'],
            data: [
              { test_1: 'Test 1', test_2: 'Test 2' }
            ]
          },
          hasHeaderRow: true,
          hasHeaderColumn: true
        }
      }
    });

    expect(fragment.querySelector('figure')).toBeTruthy();
    expect(fragment.querySelector('figcaption')).toBeTruthy();
    expect(fragment.querySelector('table')).toBeTruthy();
    expect(fragment.querySelector('th[scope="col"]')).toBeTruthy();
    expect(fragment.querySelector('th[scope="row"]')).toBeTruthy();
  });

  test('With header row only', async () => {
    const fragment = await renderToFragment<Props>(TableBlock, {
      props: {
        block: {
          _modelApiKey: 'table_block',
          id: '123',
          title: 'Table Block',
          table: {
            columns: ['test_1', 'test_2'],
            data: [
              { test_1: 'Test 1', test_2: 'Test 2' }
            ]
          },
          hasHeaderRow: true,
          hasHeaderColumn: false
        }
      }
    });

    expect(fragment.querySelector('figure')).toBeTruthy();
    expect(fragment.querySelector('figcaption')).toBeTruthy();
    expect(fragment.querySelector('table')).toBeTruthy();
    expect(fragment.querySelector('th[scope="col"]')).toBeTruthy();
    expect(fragment.querySelector('th[scope="row"]')).toBeFalsy();
  });

  test('With header column only', async () => {
    const fragment = await renderToFragment<Props>(TableBlock, {
      props: {
        block: {
          _modelApiKey: 'table_block',
          id: '123',
          title: 'Table Block',
          table: {
            columns: ['test_1', 'test_2'],
            data: [
              { test_1: 'Test 1', test_2: 'Test 2' }
            ]
          },
          hasHeaderRow: false,
          hasHeaderColumn: true
        }
      }
    });

    expect(fragment.querySelector('figure')).toBeTruthy();
    expect(fragment.querySelector('figcaption')).toBeTruthy();
    expect(fragment.querySelector('table')).toBeTruthy();
    expect(fragment.querySelector('th[scope="col"]')).toBeFalsy();
    expect(fragment.querySelector('th[scope="row"]')).toBeTruthy();
  });

  test('No column or row headers', async () => {
    const fragment = await renderToFragment<Props>(TableBlock, {
      props: {
        block: {
          _modelApiKey: 'table_block',
          id: '123',
          title: 'Table Block',
          table: {
            columns: ['test_1', 'test_2'],
            data: [
              { test_1: 'Test 1', test_2: 'Test 2' }
            ]
          },
          hasHeaderRow: false,
          hasHeaderColumn: false
        }
      }
    });

    expect(fragment.querySelector('figure')).toBeTruthy();
    expect(fragment.querySelector('figcaption')).toBeTruthy();
    expect(fragment.querySelector('table')).toBeTruthy();
    expect(fragment.querySelector('th[scope="col"]')).toBeFalsy();
    expect(fragment.querySelector('th[scope="row"]')).toBeFalsy();
  });
});
