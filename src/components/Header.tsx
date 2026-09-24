import { Html } from '@elysiajs/html'

interface HeaderProps {
  domain: string
}

export const Header = ({ domain }: HeaderProps) => (
  <header class="h-[65px] w-full flex items-center justify-center px-[32px] bg-transparent text-text-primary shrink-0 relative z-10 border-b border-border">
    <div class="max-w-[1280px] w-full flex justify-between items-center h-full">
      <span class="text-[18px] font-[500] leading-[28px] font-heading" id="nav-domain-name">{domain}</span>
      <nav class="hidden md:flex gap-5xl">
        <a href="#status" class="text-[14px] font-[500] hover:text-primary transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]">Status</a>
        <a href="#rdap" class="text-[14px] font-[500] hover:text-primary transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]">RDAP Data</a>
        <a href="#faq" class="text-[14px] font-[500] hover:text-primary transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]">FAQ</a>
      </nav>
    </div>
  </header>
)
