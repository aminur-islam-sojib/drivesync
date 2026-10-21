import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0284c7',
          borderRadius: '36px',
          color: '#ffffff',
          fontSize: '92px',
          fontWeight: 800,
          fontFamily: 'sans-serif',
        }}
      >
        D
      </div>
    ),
    {
      ...size,
    }
  )
}
