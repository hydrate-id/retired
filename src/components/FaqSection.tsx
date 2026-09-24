import { Html } from '@elysiajs/html'

export const FaqSection = () => (
  <>
    <section class="py-0 h-[300px] md:h-[400px] w-full grad-2 relative overflow-hidden flex items-center justify-center">
      <div class="absolute inset-0 bg-primary opacity-20 mix-blend-multiply"></div>
      <h2 class="relative z-10 text-[48px] font-[400] leading-[53px] tracking-[-2.88px] font-heading text-surface drop-shadow-lg text-center px-[32px]">
        End of Transmission.
      </h2>
    </section>
    <section id="faq" class="py-[40px] flex flex-col items-center bg-surface">
      <div class="max-w-[1280px] w-full px-[32px] flex flex-col gap-5xl">
        <h4 class="text-[24px] font-[400] leading-[26.5px] tracking-[-1.44px] font-heading text-center">Frequently Asked Questions</h4>
        <div class="flex flex-col gap-[10px] max-w-[800px] mx-auto w-full">
          <details class="group bg-surface hover:bg-background border border-[#D3CFE5] rounded-[14px] overflow-hidden shadow-sm transition-colors duration-150">
            <summary class="cursor-pointer text-[18px] font-[500] font-heading text-secondary px-[24px] py-[16px] flex justify-between items-center outline-none">
              Can I buy this domain right now?
              <svg class="w-5 h-5 text-text-primary transition-transform duration-280 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </summary>
            <div class="px-[24px] pb-[24px] pt-[16px] text-[14px] font-[400] text-text-primary border-t border-[#D3CFE5] bg-surface">
              No. This domain is running through its natural lifecycle and will eventually drop back to the public pool via standard registry processes. We do not entertain private offers.
            </div>
          </details>
          <details class="group bg-surface hover:bg-background border border-[#D3CFE5] rounded-[14px] overflow-hidden shadow-sm transition-colors duration-150">
            <summary class="cursor-pointer text-[18px] font-[500] font-heading text-secondary px-[24px] py-[16px] flex justify-between items-center outline-none">
              When will it be available for registration?
              <svg class="w-5 h-5 text-text-primary transition-transform duration-280 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </summary>
            <div class="px-[24px] pb-[24px] pt-[16px] text-[14px] font-[400] text-text-primary border-t border-[#D3CFE5] bg-surface">
              Refer to the "Expiration" date in the Critical Dates section above. Typically, a domain becomes available 30 to 75 days after expiration, depending on the specific Top-Level Domain (TLD) grace period policies.
            </div>
          </details>
          <details class="group bg-surface hover:bg-background border border-[#D3CFE5] rounded-[14px] overflow-hidden shadow-sm transition-colors duration-150">
            <summary class="cursor-pointer text-[18px] font-[500] font-heading text-secondary px-[24px] py-[16px] flex justify-between items-center outline-none">
              Why is this page showing RDAP data?
              <svg class="w-5 h-5 text-text-primary transition-transform duration-280 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </summary>
            <div class="px-[24px] pb-[24px] pt-[16px] text-[14px] font-[400] text-text-primary border-t border-[#D3CFE5] bg-surface">
              Registration Data Access Protocol (RDAP) is the successor to WHOIS. We display this data to provide clear, immediate transparency about the domain's current status and authoritative registrar contacts without requiring third-party lookup tools.
            </div>
          </details>
        </div>
      </div>
    </section>
    <div class="py-[40px] flex flex-col items-center text-center px-[32px]">
      <p class="text-[11.5px] font-[500] leading-[19.5px] tracking-[0.12px] font-body text-text-muted max-w-[600px]">
        The information provided on this page is retrieved live from public RDAP servers. We do not guarantee the accuracy, completeness, or timeliness of the registry data. Use of this domain is subject to ICANN policies.
      </p>
    </div>
  </>
)
