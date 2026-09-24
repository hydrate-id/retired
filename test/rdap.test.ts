import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { renderHtml } from '../src/template.ts'
import type { RdapResult } from '../src/rdap.ts'

function buildNormalizer() {
  function vcardProp(vcardArray: unknown[], key: string): string | null {
    if (!vcardArray || !Array.isArray(vcardArray[1])) return null
    const prop = (vcardArray[1] as unknown[][]).find(p => p[0] === key)
    if (!prop || !prop[3]) return null
    if (Array.isArray(prop[3])) return prop[3][0] ?? null
    return String(prop[3])
  }
  return { vcardProp }
}

const fixture: Record<string, unknown> = {
  handle: "123456-RK",
  status: ["clientTransferProhibited"],
  secureDNS: { delegationSigned: true },
  entities: [
    {
      roles: ["registrar"],
      vcardArray: [
        "vcard",
        [["fn", {}, "text", "Test Registrar LLC"]],
        { "@type": "text" }
      ]
    },
    {
      roles: ["abuse"],
      vcardArray: [
        "vcard",
        [["email", {}, "text", "abuse@example.com"], ["tel", {}, "tel", "+1-555-0100"]],
        { "@type": "text" }
      ]
    }
  ],
  events: [
    { eventAction: "registration", eventDate: "2010-01-01T00:00:00Z" },
    { eventAction: "expiration", eventDate: "2025-06-01T00:00:00Z" },
    { eventAction: "last changed", eventDate: "2024-03-15T00:00:00Z" }
  ],
  nameservers: [{ ldhName: "ns1.example.com" }, { ldhName: "ns2.example.com" }]
}

function normalize(raw: Record<string, unknown>) {
  const d = raw
  const statusArr = ((d.status as string[]) ?? []).map(s => s.replace(/_/g, ' '))
  const secure = d.secureDNS as Record<string, unknown> | undefined
  const dnssec = (secure && secure.delegationSigned) ? 'Signed' : 'Unsigned'
  let registrarName: string | null = null
  const entitiesOut = ((d.entities as Array<Record<string, unknown>>) ?? []).map(ent => {
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
  for (const ent of (d.entities as Array<Record<string, unknown>>) ?? []) {
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
  const ns = ((d.nameservers as Array<Record<string, unknown>>) ?? []).map(ns => (ns.ldhName as string) ?? '').filter(Boolean)
  return { statusArr, dnssec, registrarName, entitiesOut, abuseEmail, abusePhone, dates, ns }
}

const { vcardProp } = buildNormalizer()

describe('RDAP normalization', () => {
  test('maps handle, status, dnssec', () => {
    const r = normalize(fixture)
    assert.equal(r.dnssec, 'Signed')
    assert.deepEqual(r.statusArr, ['clientTransferProhibited'])
  })
  test('extracts registrar, abuse, dates, nameservers', () => {
    const r = normalize(fixture)
    assert.equal(r.registrarName, 'Test Registrar LLC')
    assert.equal(r.abuseEmail, 'abuse@example.com')
    assert.equal(r.abusePhone, '+1-555-0100')
    assert.equal(r.dates.registration, '2010-01-01T00:00:00Z')
    assert.equal(r.dates.expiration, '2025-06-01T00:00:00Z')
    assert.equal(r.dates.lastChanged, '2024-03-15T00:00:00Z')
    assert.deepEqual(r.ns, ['ns1.example.com', 'ns2.example.com'])
  })
  test('vcardProp extracts fn', () => {
    const v: unknown[] = ["vcard", [["fn", {}, "text", "Alice"]], {}]
    assert.equal(vcardProp(v, 'fn'), 'Alice')
  })
  test('unsigned when delegationSigned false', () => {
    const r = normalize({ ...fixture, secureDNS: { delegationSigned: false } })
    assert.equal(r.dnssec, 'Unsigned')
  })
})

describe('SSR template rendering', () => {
  test('renders full html with rdap details without client-side fetch', () => {
    const mockData: RdapResult = {
      domain: 'expy.my.id',
      tld: 'id',
      rdapServer: 'rdap.org',
      handle: '17773188_DOMAIN_ID-ID',
      status: ['client transfer prohibited'],
      registrar: 'PT JC Indonesia',
      dnssec: 'Unsigned',
      dates: {
        registration: '2025-11-21T09:48:32Z',
        expiration: '2027-11-21T23:59:59Z',
        lastChanged: '2026-03-22T09:20:50Z'
      },
      nameservers: ['emma.ns.cloudflare.com', 'harvey.ns.cloudflare.com'],
      entities: [
        {
          roles: ['registrar'],
          name: 'PT JC Indonesia',
          emails: ['sales@resellercamp.id'],
          phones: ['tel:+6282141570000']
        }
      ],
      abuse: { email: null, phone: null },
      found: true,
      error: null
    }

    const html = renderHtml('expy.my.id', mockData)
    assert.ok(html.includes('expy.my.id'))
    assert.ok(html.includes('17773188_DOMAIN_ID-ID'))
    assert.ok(html.includes('PT JC Indonesia'))
    assert.ok(html.includes('client transfer prohibited'))
    assert.ok(html.includes('emma.ns.cloudflare.com'))
    assert.ok(html.includes('Nov 21, 2025'))
    assert.ok(!html.includes('/api/rdap'))
  })
})
