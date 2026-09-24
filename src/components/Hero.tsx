import { Html } from '@elysiajs/html'

interface HeroProps {
  domain: string
}

export const Hero = ({ domain }: HeroProps) => (
  <section class="py-0 relative overflow-hidden flex flex-col items-center justify-center min-h-[600px] grad-1">
    <div class="absolute inset-0 opacity-10 grad-3 mix-blend-multiply pointer-events-none"></div>
    <div class="max-w-[1280px] w-full px-[32px] flex flex-col items-center text-center gap-5xl relative z-10">
      <span class="inline-flex items-center justify-center px-[12px] py-[6px] rounded-full bg-[#F1EDFF] text-secondary text-[12px] font-[600] uppercase tracking-wider">Service Notice</span>
      <h1 class="text-[64px] md:text-[80px] font-[400] leading-[1.1] tracking-[-4.8px] font-heading max-w-[800px]">This domain has been <span class="text-primary">retired</span>.</h1>
      <p class="text-[18px] font-[500] leading-[28px] font-body text-text-muted max-w-[600px]">The domain <strong id="hero-domain-name" class="text-text-primary">{domain}</strong> is no longer in active service and will not be renewed. Registration data is provided below for administrative transparency.</p>
      <div class="flex gap-2xl mt-3xl"><a href="#rdap" class="inline-flex items-center justify-center h-[56px] px-[40px] rounded-full bg-text-primary text-surface border border-border text-[14px] font-[500] hover:bg-primary-hover transition-colors duration-280 ease-[cubic-bezier(0.4,0,0.2,1)]">View Registry Data</a></div>
    </div>
  </section>
)
