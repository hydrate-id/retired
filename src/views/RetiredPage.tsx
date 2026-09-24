import { Html } from '@elysiajs/html'
import type { RdapResult } from '../rdap'
import { Layout } from '../components/Layout'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { StatusSection } from '../components/StatusSection'
import { RdapSection } from '../components/RdapSection'
import { DatesSection } from '../components/DatesSection'
import { PolicySection } from '../components/PolicySection'
import { InfrastructureSection } from '../components/InfrastructureSection'
import { AbuseSection } from '../components/AbuseSection'
import { FaqSection } from '../components/FaqSection'
import { Footer } from '../components/Footer'

interface RetiredPageProps {
  domain: string
  data: RdapResult
}

export const RetiredPage = ({ domain, data }: RetiredPageProps) => (
  <Layout title={`${domain} - Domain Retired`}>
    <Header domain={domain} />
    <main class="flex-grow">
      <Hero domain={domain} />
      <StatusSection />
      <RdapSection data={data} />
      <DatesSection dates={data.dates} isFound={data.found} />
      <PolicySection />
      <InfrastructureSection nameservers={data.nameservers} entities={data.entities} isFound={data.found} />
      <AbuseSection abuse={data.abuse} isFound={data.found} />
      <FaqSection />
    </main>
    <Footer domain={domain} />
  </Layout>
)
