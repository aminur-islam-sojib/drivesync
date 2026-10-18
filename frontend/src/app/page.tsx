import { LandingNavbar } from '@/components/landing/navbar'
import { HeroSection } from '@/components/landing/hero-section'
import { BentoFeatures } from '@/components/landing/bento-features'
import { InteractivePreview } from '@/components/landing/interactive-preview'
import { ComparisonTable } from '@/components/landing/comparison-table'
import { FAQSection } from '@/components/landing/faq-section'
import { LandingFooter } from '@/components/landing/landing-footer'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink selection:bg-accent-soft selection:text-accent">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <BentoFeatures />
        <InteractivePreview />
        <ComparisonTable />
        <FAQSection />
      </main>
      <LandingFooter />
    </div>
  )
}
