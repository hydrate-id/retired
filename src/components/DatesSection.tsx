import { Html } from '@elysiajs/html'
import type { RdapResult } from '../rdap'

interface DatesSectionProps {
  dates: RdapResult['dates']
  isFound: boolean
}

function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return 'N/A'
  try {
    const date = new Date(isoDate)
    if (isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'N/A'
  }
}

export const DatesSection = ({ dates, isFound }: DatesSectionProps) => {
  const regDate = isFound ? formatDate(dates?.registration) : 'N/A'
  const changedDate = isFound ? formatDate(dates?.lastChanged) : 'N/A'
  const expDate = isFound ? formatDate(dates?.expiration) : 'N/A'

  return (
    <section class="py-section flex flex-col items-center">
      <div class="max-w-[1280px] w-full px-[32px]">
        <h5 class="text-[32px] font-[400] leading-[38.5px] tracking-[-1.92px] font-heading mb-5xl text-center md:text-left">Critical Dates</h5>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5xl">
          <article class="bg-surface rounded-[20px] p-[24px] flex flex-col gap-md shadow-sm border border-[#D3CFE5] hover:shadow-md transition-shadow duration-280">
            <svg class="w-[24px] h-[24px] text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <h4 class="text-[19.5px] font-[700] leading-[21.5px] tracking-[-0.58px] font-heading">Registration</h4>
            <p id="rdap-date-reg" class="text-[16px] font-[400] text-text-primary">{regDate}</p>
          </article>
          <article class="bg-surface rounded-[20px] p-[24px] flex flex-col gap-md shadow-sm border border-[#D3CFE5] hover:shadow-md transition-shadow duration-280">
            <svg class="w-[24px] h-[24px] text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <h4 class="text-[19.5px] font-[700] leading-[21.5px] tracking-[-0.58px] font-heading">Last Changed</h4>
            <p id="rdap-date-changed" class="text-[16px] font-[400] text-text-primary">{changedDate}</p>
          </article>
          <article class="bg-surface rounded-[20px] p-[24px] flex flex-col gap-md shadow-sm border border-[#D3CFE5] hover:shadow-md transition-shadow duration-280">
            <svg class="w-[24px] h-[24px] text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h4 class="text-[19.5px] font-[700] leading-[21.5px] tracking-[-0.58px] font-heading">Expiration</h4>
            <p id="rdap-date-exp" class="text-[16px] font-[400] text-text-primary">{expDate}</p>
          </article>
        </div>
      </div>
    </section>
  )
}
