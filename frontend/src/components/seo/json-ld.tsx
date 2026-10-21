import * as React from 'react'

interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>
  id?: string
}

export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
