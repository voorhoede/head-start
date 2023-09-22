import rosetta from 'rosetta'
import messages from './i18n.messages.json'

export const locales = ['en', 'nl']
export const defaultLocale = locales[0]

const i18n = rosetta(messages)
i18n.locale(defaultLocale)

export const t = i18n.t.bind(i18n)

export function getLocale() {
  return i18n.locale()
}

export function setLocale(locale?: string) {
  const newLocale = locale || defaultLocale
  return i18n.locale(newLocale)
}
