import { Html } from '@elysiajs/html'
import type { RdapResult } from '../rdap'

interface InfrastructureSectionProps {
  nameservers: string[]
  entities: RdapResult['entities']
  isFound: boolean
}

export const InfrastructureSection = ({ nameservers, entities, isFound }: InfrastructureSectionProps) => {
  const roles = new Set<string>()
  for (const ent of entities || []) {
    for (const role of ent.roles || []) {
      roles.add(role)
    }
  }

  return (
    <section class="py-section flex flex-col items-center bg-surface border-t border-border">
      <div class="max-w-[1280px] w-full px-[32px]">
        <h5 class="text-[32px] font-[400] leading-[38.5px] tracking-[-1.92px] font-heading mb-5xl">Network Infrastructure</h5>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5xl">
          <div class="col-span-1 md:col-span-2 flex flex-col gap-md">
            <h6 class="text-[19.5px] font-[700] leading-[21.5px] tracking-[-0.58px] font-heading text-secondary">Authoritative Nameservers</h6>
            <ul id="rdap-nameservers" class="flex flex-col gap-sm mt-sm">
              {!isFound ? (
                <li class="text-[14px] text-text-muted">Query failed or data restricted.</li>
              ) : nameservers && nameservers.length > 0 ? (
                nameservers.map(ns => (
                  <li class="text-[14px] font-[500] text-text-primary flex items-center gap-sm">
                    <svg class="w-[16px] h-[16px] text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                    {' '}{ns}
                  </li>
                ))
              ) : (
                <li class="text-[14px] text-text-muted">No nameservers found.</li>
              )}
            </ul>
          </div>
          <div class="flex flex-col gap-md">
            <h6 class="text-[19.5px] font-[700] leading-[21.5px] tracking-[-0.58px] font-heading text-secondary">Contact Roles</h6>
            <div id="rdap-entities" class="flex flex-col gap-sm mt-sm">
              {!isFound ? (
                <span class="text-[14px] text-text-muted">Query failed.</span>
              ) : roles.size > 0 ? (
                Array.from(roles).map(r => (
                  <span class="inline-flex self-start items-center px-[8px] py-[4px] rounded-full bg-surface-muted text-text-primary text-[11px] font-[500] capitalize">{r}</span>
                ))
              ) : (
                <span class="text-[14px] text-text-muted">No entities found.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
