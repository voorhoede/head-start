import { describe, expect, test, } from 'vitest';
import { datocmsAssetsOrigin } from '@lib/datocms';
import { renderToFragment } from '@lib/renderer';
import LinkToFile, { type Props as LinkToFileProps } from './LinkToFile.astro';
import { getLocale } from '@lib/i18n';

type MockFileOptions = {
  basename?: string;
  format?: string;
  size?: number;
  locale?: string | null;
}

const mockFilename = (basename: string) => `123-${basename}`;
const mockFilePath = (basename: string) => `/path/to/${mockFilename(basename)}`;

const mockFileLinkProps = ({ 
  basename = 'example.pdf', 
  format = 'pdf', 
  size = 123456, 
  locale 
}: MockFileOptions) => {
  const filename = mockFilename(basename);
  const proxiedFilePath = mockFilePath(basename);
  return {
    record: { 
      __typename: 'FileRecord',
      id: '123',
      title: basename,
      file: { 
        basename: basename,
        filename: filename,
        format: format,
        mimeType: `application/${format}`,
        size: size,
        url: new URL(`${proxiedFilePath}`, datocmsAssetsOrigin).toString(),
      },
      locale: locale || null,
    }
  } satisfies LinkToFileProps;
};

describe('LinkToFile', async () => {
  const sizes = [
    { size: 123, expected: '123 B' },
    { size: 123456, expected: '123 kB' },
    { size: 12345678, expected: '12.3 MB' },
  ];
  const fileScenariosProps = ([
    { basename: 'example.docx', format: 'docx', size: sizes[0].size },
    { basename: 'example.pdf', format: 'pdf', size: sizes[0].size  },
    { basename: 'example.zip', format: 'zip', size: sizes[0].size  },
  ] as const).map(mockFileLinkProps);
  const fileScenarios = await Promise.all(fileScenariosProps
    .map(async (props) =>renderToFragment<LinkToFileProps>(LinkToFile, { props }))
  );
  
  test('renders as a link to proxied file url', () => {
    fileScenarios.forEach((component, index) => {
      const basename = fileScenariosProps[index].record.file.basename;
      expect(component.querySelector('a')?.getAttribute('href')).toBe(`/files${mockFilePath(basename)}`);
    });
  });

  test('uses the record title as the link text', () => {
    fileScenarios.forEach((component, index) => {
      const title = fileScenariosProps[index].record.title;
      expect(component.querySelector('a')?.textContent).toContain(title);
    });
  });

  test('uses the file\'s basename as [download] value', () => {
    fileScenarios.forEach((component, index) => {
      const basename = fileScenariosProps[index].record.file.basename;
      expect(component.querySelector('a')?.getAttribute('download')).toBe(basename);
    });
  });

  test('uses the file\'s mimetype as [type] value',  () => {
    fileScenarios.forEach((component, index) => {
      const mimeType = fileScenariosProps[index].record.file.mimeType;
      expect(component.querySelector('a')?.getAttribute('type')).toBe(mimeType);
    });
  });
  
  const linkMetaRegex = new RegExp(/\(.+\)$/m);

  test('includes file meta between brackets', () => {
    fileScenarios.forEach((component) => {
      const linkMeta = component.querySelector('a')?.textContent?.match(linkMetaRegex)?.[0] || '';
      expect(linkMeta).toMatch(linkMetaRegex);
    });
  });

  test('renders the file\'s format capitalised as meta data', () => {
    fileScenarios.forEach((component, index) => {
      const format = fileScenariosProps[index].record.file.format;
      const linkMeta = component.querySelector('a')?.textContent?.match(linkMetaRegex)?.[0] || '';
      expect(linkMeta).toContain(format.toUpperCase());
    });
  });

  test('renders the filesize as meta data in human readable format', async () => {
    const sizeScenariosProps = sizes.map(({ size }) => mockFileLinkProps({ size }));
    const sizeScenarios = await Promise.all(sizeScenariosProps
      .map(async (props) =>renderToFragment<LinkToFileProps>(LinkToFile, { props }))
    );

    sizeScenarios.forEach((component, index) => {
      const { expected } = sizes[index];
      const linkMeta = component.querySelector('a')?.textContent?.match(linkMetaRegex)?.[0] || '';
      expect(linkMeta).toContain(expected);
    });
  });
  
  test('renders no human-readable hreflang when it matches current locale', async () => {
    const locale = getLocale();
    const props = mockFileLinkProps({ locale });
    const { format, size: filesize } = props.record.file;
    const expectedFormatMeta = format.toUpperCase();
    const expectedSizeMeta = sizes.find(({ size }) => filesize === size)?.expected;
    const component = await renderToFragment<LinkToFileProps>(LinkToFile, { props });
    const linkMeta = component.querySelector('a')?.textContent?.match(linkMetaRegex)?.[0] || '';
    // Hard to prove a negative, but we can check the string matches only other data
    const expected = `(${expectedFormatMeta}, ${expectedSizeMeta})`;
    expect(linkMeta).toMatch(expected);
  });
  
  test('renders the hreflang as meta data in human-readable format ', async () => {
    const locales: { locale: string, expected: Record<string, string> }[] = [
      { locale: 'en', expected: { nl: 'Engels' } },
      { locale: 'nl', expected: { en: 'Dutch' } },
    ];
    const localeScenariosProps = locales.map(({ locale }) => mockFileLinkProps({ locale }));
    const localeScenarios = await Promise.all(localeScenariosProps
      .map(async (props) =>renderToFragment<LinkToFileProps>(LinkToFile, { props }))
    );

    localeScenarios.forEach((component, index) => {
      const { locale: fileLocale, expected } = locales[index];
      const contextLocale = getLocale();
      if (fileLocale === contextLocale) return; // No need to test this, as it's already covered by the previous test
      const linkMeta = component.querySelector('a')?.textContent?.match(linkMetaRegex)?.[0] || '';
      expect(linkMeta).toContain(expected[contextLocale]);
    });    
  });
});
