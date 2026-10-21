import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://drivesyncone.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/register'],
        disallow: [
          '/all-files',
          '/recent',
          '/starred',
          '/trash',
          '/shared',
          '/storage',
          '/activity',
          '/settings',
          '/google-auth',
          '/google-connected',
          '/public/files/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
