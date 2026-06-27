import { ImageResponse } from 'next/og'

// ─────────────────────────────────────────────────────────
//  app/opengraph-image.tsx
//  Static OG image — used for all pages that don't override it.
//  Edge runtime only (satori-based, no Node.js deps).
// ─────────────────────────────────────────────────────────

export const runtime     = 'edge'
export const alt         = 'Blacksmith — Android Project Generator'
export const size        = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background:     '#070807',
          width:          '100%',
          height:         '100%',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          fontFamily:     'sans-serif',
          padding:        '60px',
        }}
      >
        {/* Subtle grid background */}
        <div
          style={{
            position:   'absolute',
            inset:      0,
            background: 'radial-gradient(ellipse at 50% 0%, rgba(61,244,154,0.08) 0%, transparent 60%)',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display:         'flex',
            alignItems:      'center',
            gap:             '8px',
            background:      'rgba(61,244,154,0.12)',
            border:          '1px solid rgba(61,244,154,0.25)',
            borderRadius:    '100px',
            padding:         '6px 16px',
            marginBottom:    '32px',
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3DF49A' }} />
          <span style={{ color: '#3DF49A', fontSize: 14, fontWeight: 600, letterSpacing: '0.05em' }}>
            Android Project Generator
          </span>
        </div>

        {/* Wordmark */}
        <div
          style={{
            fontSize:      96,
            fontWeight:    800,
            letterSpacing: '-4px',
            lineHeight:    1,
            display:       'flex',
          }}
        >
          <span style={{ color: '#F5F5F0' }}>Black</span>
          <span style={{ color: '#3DF49A' }}>smith</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize:    24,
            color:       '#888880',
            marginTop:   24,
            textAlign:   'center',
            maxWidth:    640,
            lineHeight:  1.5,
          }}
        >
          Select features. Gemini generates your Kotlin project.
          Download and build.
        </div>

        {/* Tech strip */}
        <div
          style={{
            display:      'flex',
            gap:          '12px',
            marginTop:    48,
            flexWrap:     'wrap',
            justifyContent: 'center',
          }}
        >
          {['Kotlin', 'Gradle DSL', 'MVVM', 'Clean Arch', 'Compose', 'Hilt'].map(tag => (
            <div
              key={tag}
              style={{
                background:   'rgba(245,245,240,0.06)',
                border:       '1px solid rgba(245,245,240,0.12)',
                borderRadius: '8px',
                padding:      '6px 14px',
                color:        '#888880',
                fontSize:     14,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
