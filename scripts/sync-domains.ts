import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import { isValidApexDomain, parseDomainsFile } from '../src/domain-validator.ts'

const DOMAINS_FILE = join(process.cwd(), 'domains.txt')
const content = readFileSync(DOMAINS_FILE, 'utf-8')
const domains = parseDomainsFile(content)

console.log(`Checking ${domains.length} domains in domains.txt...`)

for (const domain of domains) {
  const check = isValidApexDomain(domain)
  if (!check.valid) {
    console.error(`Invalid domain found: ${domain} - ${check.reason}`)
    process.exit(1)
  }
}

const token = process.env.VERCEL_TOKEN
const scope = process.env.VERCEL_SCOPE || 'hydrate-id'
const project = process.env.VERCEL_PROJECT || 'retired'

for (const domain of domains) {
  console.log(`Syncing domain: ${domain} to Vercel (${scope}/${project})...`)
  try {
    const cmd = token
      ? `npx vercel domains add ${domain} ${project} --scope ${scope} --token ${token} --yes`
      : `npx vercel domains add ${domain} ${project} --scope ${scope} --yes`
    execSync(cmd, { stdio: 'inherit' })
  } catch (err) {
    console.error(`Failed to add domain ${domain}:`, err)
  }
}

console.log('Domain sync completed.')
