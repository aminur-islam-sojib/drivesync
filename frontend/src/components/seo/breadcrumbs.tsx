import * as React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { JsonLd } from './json-ld'
import { absoluteUrl } from '@/lib/seo'

export interface BreadcrumbItem {
  name: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const allItems = [{ name: 'Home', href: '/' }, ...items]

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  }

  return (
    <>
      <JsonLd id={`breadcrumbs-${items.map((i) => i.name).join('-')}`} data={schema} />
      <nav aria-label="Breadcrumbs" className="mb-8 flex items-center text-xs text-ink-3">
        <ol className="flex flex-wrap items-center gap-1.5">
          {allItems.map((item, idx) => {
            const isLast = idx === allItems.length - 1
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="h-3 w-3 text-ink-3/60" aria-hidden="true" />}
                {isLast ? (
                  <span className="font-medium text-ink" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-ink transition-colors flex items-center gap-1"
                  >
                    {idx === 0 && <Home className="h-3 w-3" aria-hidden="true" />}
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}

