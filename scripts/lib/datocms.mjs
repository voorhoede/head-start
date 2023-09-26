import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { buildClient } from '@datocms/cma-client-node'
import dotenv from 'dotenv-safe'

dotenv.config()

const apiToken = process.env.DATOCMS_READONLY_API_TOKEN
const execAsync = promisify(exec)

async function getGitBranch() {
    try {
        const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' })
        return stdout.trim()
    } catch (error) {
        console.warn('Could not get git branch', error)
        return null
    }
}

export async function getEnvironment() {
    const branch = await getGitBranch()
    const client = buildClient({ apiToken })
    const availableEnvironments = await client.environments.list()
    const primaryEnvironment = availableEnvironments.find(environment => environment.meta.primary === true).id

    if (!branch) {
        return primaryEnvironment
    }

    // datocms environment names can only contain letters, numbers, and dashes:
    const branchEnvironment = branch.replace(/[^a-z0-9]/gi, '-')
    if (availableEnvironments.includes(branchEnvironment)) {
        return branchEnvironment
    } else {
        console.warn(`Environment '${branchEnvironment}' not found, using primary environment '${primaryEnvironment}' instead.`)
        return primaryEnvironment
    }
}

export async function getClient() {
    const environment = await getEnvironment()
    return buildClient({ apiToken, environment })
}