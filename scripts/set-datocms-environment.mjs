import { writeFile } from 'node:fs/promises'
import { getEnvironment } from './lib/datocms.mjs'
import { env } from 'node:process'

getEnvironment()
    .then(environment => {
        process.env.DATOCMS_ENVIRONMENT = environment
        console.log(`DATOCMS_ENVIRONMENT set to '${environment}'`)
        return writeFile('./.datocms-env', environment)
    })
