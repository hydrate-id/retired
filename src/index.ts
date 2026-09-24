import { Elysia } from 'elysia'
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker'
import { fetchRdap, type RdapResult } from './rdap'
import { renderHtml } from './template'

function extractDomain(request: Request, queryDomain?: string): string {
  if (queryDomain && queryDomain.trim()) {
    return queryDomain.trim().toLowerCase().replace(/^www\./, '').split(':')[0]
  }
  const host = request.headers.get('host') || new URL(request.url).hostname
  return host.toLowerCase().replace(/^www\./, '').split(':')[0]
}

function invalidDomainResult(domain: string): RdapResult {
  return {
    domain,
    tld: '',
    rdapServer: null,
    handle: null,
    status: [],
    registrar: null,
    dnssec: 'Unsigned',
    dates: { registration: null, expiration: null, lastChanged: null },
    nameservers: [],
    entities: [],
    abuse: { email: null, phone: null },
    found: false,
    error: 'invalid domain'
  }
}

const app = new Elysia({ adapter: CloudflareAdapter })
  .get('/api/rdap', async ({ request, query }) => {
    const domain = extractDomain(request, query.domain as string | undefined)
    if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(domain)) {
      return invalidDomainResult(domain)
    }
    return fetchRdap(domain)
  })
  .get('/', async ({ request, query, set }) => {
    const domain = extractDomain(request, query.domain as string | undefined)
    let rdap: RdapResult
    if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(domain)) {
      rdap = invalidDomainResult(domain)
    } else {
      rdap = await fetchRdap(domain)
    }

    set.headers['content-type'] = 'text/html; charset=utf-8'
    return renderHtml(domain, rdap)
  })
  .compile()

export default app
