import { getEnvironment } from './lib/datocms.mjs'

const datocmsEnvironment = await getEnvironment()
console.log(datocmsEnvironment)
