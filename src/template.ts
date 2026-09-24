import { RetiredPage } from './views/RetiredPage'
import type { RdapResult } from './rdap'

export function renderHtml(domain: string, data: RdapResult): string {
  return '<!DOCTYPE html>' + RetiredPage({ domain, data }).toString()
}
