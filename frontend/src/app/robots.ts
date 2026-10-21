import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const isPreview =
    process.env.VERCEL_ENV !== undefined &&
    process.env.VERCEL_ENV !== 'production'

  if (isPreview) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    }
  }

  const sitemapUrl = absoluteUrl('/sitemap.xml')
  const host = absoluteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
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
          '/login',
          '/register',
          '/public/files/',
        ],
      },
    ],
    sitemap: sitemapUrl,
    host,
  }
}
