import { ImageResponse } from 'next/og'

export const alt = 'DriveSync One – All your Google Drives. One workspace.'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#090a0f',
          backgroundImage:
            'radial-gradient(circle at 50% 20%, rgba(2, 132, 199, 0.25) 0%, transparent 60%)',
          color: '#f8fafc',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
            padding: '8px 20px',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '9999px',
              backgroundColor: '#0284c7',
            }}
          />
          <span
            style={{
              fontSize: '20px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              color: '#38bdf8',
            }}
          >
            DRIVESYNC ONE
          </span>
        </div>

        <h1
          style={{
            fontSize: '64px',
            fontWeight: 800,
            textAlign: 'center',
            lineHeight: 1.15,
            margin: '0 0 20px 0',
            letterSpacing: '-0.02em',
          }}
        >
          All your Google Drives.
          <br />
          <span style={{ color: '#0284c7' }}>One workspace.</span>
        </h1>

        <p
          style={{
            fontSize: '24px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '850px',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          Combine multiple Google accounts & S3 into a single pooled drive with
          cross-account search and smart upload auto-routing.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            marginTop: '48px',
            fontSize: '18px',
            color: '#64748b',
          }}
        >
          <span>✓ 100% Free Google Tiers</span>
          <span>✓ AES-256 Token Encryption</span>
          <span>✓ Zero File Scraping</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
