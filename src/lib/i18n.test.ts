import { describe, expect, test } from 'vitest';
import rosetta from 'rosetta';
import messages from './i18n.messages.mock.json';
import { setLocale, t } from './i18n';

const defaultLocale = 'nl';
const i18n = rosetta(messages);

describe('i18n', () => {
  test('use setLocale() to update the locale', () => {
    i18n.locale(defaultLocale);
    const newLocale = 'en';

    const locale = setLocale(newLocale);

    expect(locale).toBe(newLocale);
  });

  test('use t() to translate a value', () => {
    const key = 'share_on_social';

    const translation = t(key); // TODO this should fail, but passes because it uses the i18n instance in the i18n.ts file. So when you switch the locale in the i18n instance above, it does not change the locale of the i18n instance in the i18n.ts file. You need to somehow either: use the i18n instance in this test file OR refactor the i18n.ts file to use the i18n instance in this test file -- the first approach is best

    const expectedTranslation = 'Share on social media';
    expect(translation).toBe(expectedTranslation);
  });
});


// import { t, getLocale, setLocale, getLocaleName } from './i18n'
// import beforeAll = require('vitest');

// test('translate function', () => {
//   const key = 'test_disclaimer'
//   const defaultLocale = 'en';

//   const i18n = rosetta(messages);
//   i18n.locale(defaultLocale);

//   const translation = t(key)

//   const expectedTranslation = 'Share on social media'
//   expect(translation).toBe(expectedTranslation)
// })

// test('getLocale function', () => {
//   const locale = getLocale()
//   expect(locale).toBe(defaultLocale)
// })

// test('setLocale function', () => {
//   const newLocale = 'en'
//   setLocale(newLocale)
//   const locale = getLocale()
//   expect(locale).toBe(newLocale)
// })

// test('getLocaleName function', () => {
//   const code = 'en'
//   const localeName = getLocaleName(code)
//   expect(localeName).toBe('English')
// })
