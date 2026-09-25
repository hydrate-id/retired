// List of common two-level TLDs (coTLD / ccTLD second level domains)
const TWO_LEVEL_TLD_REGEX = /\.(com|co|ac|edu|gov|mil|net|org|web|my|biz|gen|nom|sch|desa)\.[a-z]{2}$/i

export function isValidApexDomain(domain: string): { valid: boolean; reason?: string } {
  const d = domain.trim().toLowerCase()
  if (!d) return { valid: false, reason: 'Empty domain' }

  // Basic domain format check
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(d)) {
    return { valid: false, reason: 'Invalid domain syntax' }
  }

  const parts = d.split('.')
  if (parts.length < 2) {
    return { valid: false, reason: 'Domain must have at least a name and extension' }
  }

  // Check if it matches a known 2-part ccTLD/coTLD (e.g., .my.id, .co.id, .co.uk, .com.au)
  if (TWO_LEVEL_TLD_REGEX.test(d)) {
    if (parts.length === 3) {
      return { valid: true }
    }
    return { valid: false, reason: `Subdomains are not supported on coTLD (${d}). Apex domain only.` }
  }

  // Standard TLD (e.g., example.com, test.id, mydomain.xyz)
  if (parts.length === 2) {
    return { valid: true }
  }

  return { valid: false, reason: `Subdomains are not supported (${d}). Apex domain only.` }
}

export function parseDomainsFile(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map(line => line.trim().toLowerCase())
    .filter(line => line.length > 0 && !line.startsWith('#'))
}
