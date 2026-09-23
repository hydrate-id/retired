import { Elysia } from 'elysia'
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker'
import { fetchRdap } from './rdap'

export default new Elysia({ adapter: CloudflareAdapter })
  .get('/api/rdap', async ({ request, query }) => {
    const url = new URL(request.url)
    const domain = (query.domain as string | undefined) ?? url.hostname
    const cleaned = domain.toLowerCase().replace(/^www\./, '')
    if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(cleaned)) {
      return { domain: cleaned, found: false, error: 'invalid domain' }
    }
    return fetchRdap(cleaned)
  })
  .compile()
