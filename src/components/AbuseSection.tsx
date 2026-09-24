import { Html } from '@elysiajs/html'
import type { RdapResult } from '../rdap'

interface AbuseSectionProps {
  abuse: RdapResult['abuse']
  isFound: boolean
}

export const AbuseSection = ({ abuse, isFound }: AbuseSectionProps) => {
  const email = isFound ? (abuse?.email || 'Not available') : 'Not available'
  const phone = isFound ? (abuse?.phone || 'Not available') : 'Not available'

  return (
    <section class="py-section flex flex-col items-center">
      <div class="max-w-[1280px] w-full px-[32px]">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-[64px]">
          <div class="flex flex-col gap-2xl justify-center">
            <h3 class="text-[28px] font-[400] leading-[28px] font-heading">Abuse Reporting</h3>
            <p class="text-[16px] font-[400] text-text-muted">
              If this domain is currently involved in abusive practices, spam, or malicious activity despite being retired, please direct reports to the designated registrar abuse contact provided in the RDAP payload.
            </p>
          </div>
          <div class="bg-surface rounded-[16px] p-[32px] border border-[#D3CFE5] flex flex-col gap-md shadow-sm">
            <span class="text-[11.5px] font-[500] uppercase text-text-muted tracking-[0.12px]">Registrar Abuse Contact</span>
            <p id="rdap-abuse-email" class="text-[18px] font-[500] font-heading truncate text-text-primary">{email}</p>
            <p id="rdap-abuse-phone" class="text-[14px] font-[400] text-text-primary">{phone}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
