import { describe, expect, test } from 'vitest';
import { datocmsAssetsOrigin } from '@lib/datocms';
import { renderToFragment } from '@lib/renderer';
import LinkToFile, { type Props as LinkToFileProps } from './LinkToFile.astro';

const mockFileLinkProps = ({ basename }: { basename: string }) => {
  return {
    record: { 
      __typename: 'FileRecord',
      id: '123',
      title: basename,
      file: { 
        basename: basename,
        filename: `123-${basename}`,
        format: 'pdf',
        mimeType: 'application/pdf',
        size: 123456,
        url: new URL(`/path/to/123-${basename}`, datocmsAssetsOrigin).toString(),
      },
    }
  } as LinkToFileProps;
};

describe('LinkToFile', async () => {
  const pdfProps = mockFileLinkProps({ basename: 'example.pdf' });
  const pdfLink = await renderToFragment<LinkToFileProps>(LinkToFile, { props: pdfProps });
  // todo: add another example file docx?

  test('renders as a link to proxied file url', () => {
    expect(pdfLink.querySelector('a')?.getAttribute('href')).toBe('/files/path/to/123-example.pdf');
  });

  test('uses the record title as the link text', () => {
    expect(pdfLink.querySelector('a')?.textContent).toContain(pdfProps.record.title);
  });

  test('uses the file\'s basename as [download] value', () => {
    expect(pdfLink.querySelector('a')?.getAttribute('download')).toBe('example.pdf');
  });

  test('uses the file\'s mimetype as [type] value',  () => {
    expect(pdfLink.querySelector('a')?.getAttribute('type')).toBe('application/pdf');
  });

  test('includes file meta between brackets', () => {
    expect(pdfLink.querySelector('a')?.textContent).toMatch(/\(.+\)/);
  });

  test('renders the file\'s format capitalised as meta data', () => {
    // todo: check if format is actually between brackets? extract meta text first?
    expect(pdfLink.querySelector('a')?.textContent).toContain(pdfProps.record.file.format.toUpperCase());
  });

  test('renders the filesize as meta data in human readable format', () => {
    // todo: check if format is actually between brackets? extract meta text first?
    // todo: different file sizes?
    expect(pdfLink.querySelector('a')?.textContent).toContain('123 kB');
  });

  // test hreflang
  // test locale between brackets if ... (French), (Frans) (mock locale?)
});
