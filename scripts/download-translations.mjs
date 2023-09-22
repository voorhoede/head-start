import { writeFile } from 'node:fs/promises'
import dotenv from 'dotenv-safe'
import { getClient } from './lib/datocms.mjs'

dotenv.config()

async function fetchTranslations() {
    // use DatoCMS client instead of http api for pagination support
    const client = await getClient()

    const { locales } = await client.site.find()
    const translations = Object.fromEntries(locales.map(locale => [locale, {}]))
    
    for await (const item of client.items.listPagedIterator({ filter: { type: 'translation' }})) {
        locales.forEach(locale => {
            translations[locale][item.key] = item.value[locale]
        })
    }
    return translations
}

async function downloadTranslations() {
    const translations = await fetchTranslations()
    await writeFile('./src/lib/i18n.messages.json', JSON.stringify(translations, null, 2))
}

downloadTranslations()
    .then(() => console.log('Translations downloaded'))
