import { Html } from '@elysiajs/html'

interface FooterProps {
  domain: string
}

export const Footer = ({ domain }: FooterProps) => (
  <footer class="py-[80px] md:py-[120px] w-full flex flex-col items-center justify-center grad-5 text-surface relative overflow-hidden">
    <div class="absolute inset-0 bg-text-primary opacity-90 mix-blend-multiply"></div>
    <div class="max-w-[1280px] w-full px-[32px] relative z-10 flex flex-col gap-[64px] items-center text-center">
      <div class="flex flex-col gap-2xl items-center">
        <span class="text-[32px] font-[400] leading-[38.5px] tracking-[-1.92px] font-heading text-surface">Status: Inactive</span>
        <p class="text-[16px] font-[400] text-surface max-w-[400px] opacity-90">This page serves as a final placeholder. No further updates will be made.</p>
      </div>
      <div class="w-full h-px bg-surface opacity-20"></div>
      <div class="flex flex-col md:flex-row justify-between w-full items-center gap-2xl">
        <span class="text-[14px] font-[500] text-surface font-heading" id="footer-domain-name">{domain}</span>
        <span class="text-[11.5px] font-[500] leading-[19.5px] tracking-[0.12px] text-surface opacity-90">Generated automatically upon retirement.</span>
      </div>
    </div>
  </footer>
)
