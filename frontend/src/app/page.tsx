import { LandingNavbar } from '@/components/landing/navbar'
import { HeroSection } from '@/components/landing/hero-section'
import { BentoFeatures } from '@/components/landing/bento-features'
import { HowItWorks } from '@/components/landing/how-it-works'
import { InteractivePreview } from '@/components/landing/interactive-preview'
import { ComparisonTable } from '@/components/landing/comparison-table'
import { FAQSection, FAQS } from '@/components/landing/faq-section'
import { LandingFooter } from '@/components/landing/landing-footer'
import { JsonLd } from '@/components/seo/json-ld'
import { absoluteUrl, DEFAULT_DESCRIPTION, ALTERNATE_NAMES } from '@/lib/seo'

export const metadata = {
  title: 'DriveSync One – Combine Multiple Google Drive Accounts in One Place',
  description:
    'DriveSync One (DriveSync) merges multiple Google Drive and S3 accounts into one workspace with pooled storage, cross-account search and smart upload routing.',
  alternates: {
    canonical: '/',
  },
}

export default function LandingPage() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DriveSync One',
    alternateName: ALTERNATE_NAMES,
    url: absoluteUrl('/'),
    description: DEFAULT_DESCRIPTION,
  }

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DriveSync One',
    url: absoluteUrl('/'),
    logo: absoluteUrl('/apple-touch-icon.png'),
    sameAs: ['https://github.com/aminur-islam-sojib/drivesyncone'],
  }

  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DriveSync One',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: DEFAULT_DESCRIPTION,
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink selection:bg-accent-soft selection:text-accent">
      <JsonLd id="schema-website" data={websiteSchema} />
      <JsonLd id="schema-organization" data={organizationSchema} />
      <JsonLd id="schema-software" data={softwareAppSchema} />
      <JsonLd id="schema-faq" data={faqSchema} />

      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <BentoFeatures />
        <HowItWorks />
        <InteractivePreview />
        <ComparisonTable />
        <FAQSection />
      </main>
      <LandingFooter />
    </div>
  )
}
