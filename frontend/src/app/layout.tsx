import type { Metadata } from 'next'
import Script from 'next/script'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://drivesyncone.vercel.app'),
  title: {
    default: 'DriveSync — Unified Multi-Account Google Drive & S3 Manager',
    template: '%s | DriveSync',
  },
  description:
    'Aggregate multiple Google Drive and S3 accounts into one unified workspace with pooled storage, cross-account search, and smart upload routing.',
  keywords: [
    'Google Drive Manager',
    'Multi-Account Google Drive',
    'S3 File Manager',
    'Cloud Storage Aggregator',
    'Unified Cloud Workspace',
    'Pooled Cloud Quota',
    'Cross-Account Search',
    'Resumable Uploads',
  ],
  authors: [{ name: 'DriveSync' }],
  creator: 'DriveSync',
  publisher: 'DriveSync',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'DriveSync — Unified Multi-Account Google Drive & S3 Manager',
    description:
      'Aggregate multiple Google Drive and S3 accounts into one unified workspace with pooled storage, cross-account search, and smart upload routing.',
    url: 'https://drivesyncone.vercel.app',
    siteName: 'DriveSync',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DriveSync — Unified Multi-Account Google Drive & S3 Manager',
    description:
      'Aggregate multiple Google Drive and S3 accounts into one unified workspace with pooled storage, cross-account search, and smart upload routing.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-DV26CTSW2B"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-DV26CTSW2B');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
