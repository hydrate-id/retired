import type { Infer } from 'elysia'

interface IanaEntry { tlds: string[]; urls: string[] }
interface IanaBootstrap { services: IanaEntry[] }

let bootstrapMap: Map<string, string> | null = null
let bootstrapFailed = false

async function getBootstrap(): Promise<Map<string, string>> {
  if (bootstrapMap) return bootstrapMap
  if (bootstrapFailed) return new Map()
  try {
    const res = await fetch('https://data.iana.org/rdap/dns.json', { cf: { cacheTtl: 86400 } })
    if (!res.ok) throw new Error(`bootstrap fetch failed: ${res.status}`)
    const json: IanaBootstrap = await res.json()
    bootstrapMap = new Map()
    for (const entry of json.services) {
      const url = entry.urls[0]
      for (const tld of entry.tlds) {
        if (!bootstrapMap.has(tld)) bootstrapMap.set(tld, url)
      }
    }
    return bootstrapMap
  } catch { bootstrapFailed = true; return new Map() }
}

async function resolveFetchUrl(domain: string): Promise<{ url: string; serverLabel: string | null }> {
  const clean = domain.toLowerCase().replace(/^www\./, '')
  const tld = clean.split('.').pop() ?? ''
  try {
    const boot = await getBootstrap()
    const server = boot.get(tld)
    if (server) return { url: server.endsWith('/') ? server + 'domain/' + clean : server + '/domain/' + clean, serverLabel: server }
  } catch {}
  return { url: 'https://rdap.org/domain/' + clean, serverLabel: 'rdap.org' }
}

function vcardProp(vcardArray: unknown[], key: string): string | null {
  if (!vcardArray || !Array.isArray(vcardArray[1])) return null
  const prop = (vcardArray[1] as unknown[][]).find(p => p[0] === key)
  if (!prop || !prop[3]) return null
  if (Array.isArray(prop[3])) return prop[3][0] ?? null
  return String(prop[3])
}

export interface RdapResult {
  domain: string
  tld: string
  rdapServer: string | null
  handle: string | null
  status: string[]
  registrar: string | null
  dnssec: 'Signed' | 'Unsigned'
  dates: { registration: string | null; expiration: string | null; lastChanged: string | null }
  nameservers: string[]
  entities: Array<{ roles: string[]; name: string | null; emails: string[]; phones: string[] }>
  abuse: { email: string | null; phone: string | null }
  found: boolean
  error: string | null
}

export async function fetchRdap(domain: string): Promise<RdapResult> {
  const clean = domain.toLowerCase().replace(/^www\./, '')
  const labels = clean.split('.')
  const tld = labels[labels.length - 1]
  if (!tld || labels.length < 2) {
    return { domain: clean, tld, rdapServer: null, handle: null, status: [], registrar: null, dnssec: 'Unsigned', dates: { registration: null, expiration: null, lastChanged: null }, nameservers: [], entities: [], abuse: { email: null, phone: null }, found: false, error: 'invalid domain' }
  }

  const { url, serverLabel } = await resolveFetchUrl(clean)
  const server = serverLabel ?? 'rdap.org'

  let raw: unknown
  try {
    const res = await fetch(url, { headers: { accept: 'application/rdap+json', 'user-agent': 'retired-worker/1.0' }, cf: { cacheTtl: 3600 } })
    if (res.status === 404) {
      return { domain: clean, tld, rdapServer: server, handle: null, status: [], registrar: null, dnssec: 'Unsigned', dates: { registration: null, expiration: null, lastChanged: null }, nameservers: [], entities: [], abuse: { email: null, phone: null }, found: false, error: 'domain not found' }
    }
    if (!res.ok) throw new Error(`rdap ${res.status}`)
    raw = await res.json()
  } catch (e) {
    return { domain: clean, tld, rdapServer: server, handle: null, status: [], registrar: null, dnssec: 'Unsigned', dates: { registration: null, expiration: null, lastChanged: null }, nameservers: [], entities: [], abuse: { email: null, phone: null }, found: false, error: `rdap fetch failed: ${e instanceof Error ? e.message : String(e)}` }
  }

  const d = raw as Record<string, unknown>
  const handle = (d.handle as string) ?? null
  const statusArr = ((d.status as string[]) ?? []).map(s => s.replace(/_/g, ' '))
  const secure = d.secureDNS as Record<string, unknown> | undefined
  const dnssec = (secure && secure.delegationSigned) ? 'Signed' : 'Unsigned'

  let registrarName: string | null = null
  const entities = (d.entities as Array<Record<string, unknown>>) ?? []
  const entityOut = entities.map(ent => {
    const roles = (ent.roles as string[]) ?? []
    const v = ent.vcardArray as unknown[] | undefined
    const name = v ? vcardProp(v, 'fn') : null
    const email = v ? vcardProp(v, 'email') : null
    const phone = v ? vcardProp(v, 'tel') : null
    if (roles.includes('registrar') && name) registrarName = name
    return { roles, name, emails: email ? [email] : [], phones: phone ? [phone] : [] }
  })

  let abuseEmail: string | null = null
  let abusePhone: string | null = null
  for (const ent of entities) {
    const roles = (ent.roles as string[]) ?? []
    const v = ent.vcardArray as unknown[] | undefined
    if (roles.includes('abuse')) {
      if (!abuseEmail && v) abuseEmail = vcardProp(v, 'email')
      if (!abusePhone && v) abusePhone = vcardProp(v, 'tel')
    }
  }

  const dates = { registration: null as string | null, expiration: null as string | null, lastChanged: null as string | null }
  for (const ev of (d.events as Array<Record<string, unknown>>) ?? []) {
    const action = ev.eventAction as string
    const date = ev.eventDate as string | undefined
    if (!date) continue
    if (action === 'registration') dates.registration = date
    else if (action === 'expiration') dates.expiration = date
    else if (action === 'last changed') dates.lastChanged = date
  }

  const nameservers = ((d.nameservers as Array<Record<string, unknown>>) ?? []).map(ns => (ns.ldhName as string) ?? '').filter(Boolean)

  return { domain: clean, tld, rdapServer: server, handle, status: statusArr, registrar: registrarName, dnssec, dates, nameservers, entities: entityOut, abuse: { email: abuseEmail, phone: abusePhone }, found: true, error: null }
}
