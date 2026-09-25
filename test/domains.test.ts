import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { isValidApexDomain, parseDomainsFile } from '../src/domain-validator.ts'

describe('Domain Validator - Apex Only', () => {
  test('allows valid single-part TLD apex domains', () => {
    assert.equal(isValidApexDomain('example.com').valid, true)
    assert.equal(isValidApexDomain('hydrate.id').valid, true)
    assert.equal(isValidApexDomain('my-site.xyz').valid, true)
    assert.equal(isValidApexDomain('domain.dev').valid, true)
  })

  test('allows valid coTLD / ccTLD apex domains', () => {
    assert.equal(isValidApexDomain('expy.my.id').valid, true)
    assert.equal(isValidApexDomain('tsaqaf.my.id').valid, true)
    assert.equal(isValidApexDomain('brand.co.id').valid, true)
    assert.equal(isValidApexDomain('company.co.uk').valid, true)
    assert.equal(isValidApexDomain('service.com.au').valid, true)
    assert.equal(isValidApexDomain('community.org.id').valid, true)
    assert.equal(isValidApexDomain('startup.biz.id').valid, true)
  })

  test('rejects subdomains on single-part TLDs', () => {
    const r1 = isValidApexDomain('sub.example.com')
    assert.equal(r1.valid, false)
    assert.ok(r1.reason?.includes('Subdomains are not supported'))

    const r2 = isValidApexDomain('app.hydrate.id')
    assert.equal(r2.valid, false)
  })

  test('rejects subdomains on coTLDs', () => {
    const r1 = isValidApexDomain('sub.expy.my.id')
    assert.equal(r1.valid, false)
    assert.ok(r1.reason?.includes('Subdomains are not supported on coTLD'))

    const r2 = isValidApexDomain('admin.brand.co.id')
    assert.equal(r2.valid, false)
  })

  test('rejects invalid hostname syntax', () => {
    assert.equal(isValidApexDomain('').valid, false)
    assert.equal(isValidApexDomain('-invalid.com').valid, false)
    assert.equal(isValidApexDomain('invalid-.com').valid, false)
    assert.equal(isValidApexDomain('hello..com').valid, false)
    assert.equal(isValidApexDomain('http://example.com').valid, false)
  })
})

describe('domains.txt integrity', () => {
  test('all domains in domains.txt must be unique and valid apex domains', () => {
    const content = readFileSync(join(__dirname, '../domains.txt'), 'utf-8')
    const domains = parseDomainsFile(content)

    assert.ok(domains.length > 0, 'domains.txt should not be empty')

    const seen = new Set<string>()
    for (const d of domains) {
      assert.ok(!seen.has(d), `Duplicate domain found: ${d}`)
      seen.add(d)

      const res = isValidApexDomain(d)
      assert.ok(res.valid, `Domain "${d}" in domains.txt is invalid: ${res.reason}`)
    }
  })
})
