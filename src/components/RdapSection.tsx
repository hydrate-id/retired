import { Html } from '@elysiajs/html'
import type { RdapResult } from '../rdap'

interface RdapSectionProps {
  data: RdapResult
}

export const RdapSection = ({ data }: RdapSectionProps) => {
  const isFound = data.found
  const handle = isFound ? (data.handle || 'Unknown') : 'Data Unavailable'
  const registrar = isFound ? (data.registrar || 'Unknown') : 'N/A'
  const dnssec = isFound ? (data.dnssec || 'Unsigned') : 'N/A'

  return (
    <section id="rdap" class="py-section flex flex-col items-center bg-surface">
      <div class="max-w-[1280px] w-full px-[32px] flex flex-col gap-5xl">
        <div class="flex flex-col gap-sm">
          <h5 class="text-[32px] font-[400] leading-[38.5px] tracking-[-1.92px] font-heading">Registration Output</h5>
          <p class="text-[14px] font-[500] font-body text-text-muted">Live query results from authoritative RDAP servers.</p>
        </div>
        <div class="bg-surface border border-border rounded-card shadow-xl p-[32px] flex flex-col gap-5xl">
          <div class="flex flex-wrap items-center justify-between gap-2xl border-b border-surface-muted pb-[24px]">
            <div class="min-w-0 max-w-full">
              <span class="text-[11.5px] font-[500] leading-[19.5px] tracking-[0.12px] uppercase text-text-muted">Handle</span>
              <h3 id="rdap-handle" class="text-[20px] sm:text-[28px] font-[400] leading-tight font-heading mt-2xs break-all">{handle}</h3>
            </div>
            <div class="flex flex-wrap gap-sm" id="rdap-status-container">
              {!isFound ? (
                <span class="inline-flex items-center justify-center px-[8px] py-[4px] rounded-full bg-danger text-surface text-[11px] font-[500]">Lookup Failed</span>
              ) : data.status && data.status.length > 0 ? (
                data.status.map(s => (
                  <span class="inline-flex items-center justify-center px-[8px] py-[4px] rounded-full bg-background text-text-primary border border-border text-[11px] font-[500] capitalize">{s}</span>
                ))
              ) : (
                <span class="inline-flex items-center justify-center px-[8px] py-[4px] rounded-full bg-surface text-text-primary border border-border text-[11px] font-[500]">Unknown</span>
              )}
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5xl">
            <div class="flex flex-col gap-xs">
              <span class="text-[11.5px] font-[500] leading-[19.5px] tracking-[0.12px] uppercase text-text-muted">Registrar</span>
              <p id="rdap-registrar" class="text-[18px] font-[500] leading-[28px] font-heading">{registrar}</p>
            </div>
            <div class="flex flex-col gap-xs">
              <span class="text-[11.5px] font-[500] leading-[19.5px] tracking-[0.12px] uppercase text-text-muted">DNSSEC</span>
              <p id="rdap-dnssec" class="text-[18px] font-[500] leading-[28px] font-heading">{dnssec}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
